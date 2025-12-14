import { supabase } from './supabase';
import { esimAccessApi } from './esimApi';
import {
  getCountryInfo,
  parseLocationCode,
  CountryInfo,
} from '@/utils/countryMapper';
import type { EsimAccessPackage } from '@/types';

interface CountryData {
  code: string;
  name: string;
  region: string;
  flag: string;
  api_location_code: string;
  package_count: number;
  min_price: number;
  min_retail_price: number;
  is_top_country: boolean;
}

interface PackageData {
  country_id: string;
  package_code: string;
  package_name: string;
  location_code: string;
  location_name: string;
  data_amount: number;
  validity_days: number;
  price: number;
  retail_price: number;
  currency: string;
  description: string | null;
}

const TOP_COUNTRIES = ['US', 'GB', 'FR', 'DE', 'ES', 'IT', 'JP', 'AU', 'CA', 'NL'];

export async function syncCountriesFromAPI(): Promise<{
  success: boolean;
  error?: string;
  stats?: {
    countriesAdded: number;
    packagesAdded: number;
    countriesUpdated: number;
  };
}> {
  try {
    console.log('Starting country sync from eSIM Access API...');

    const response = await esimAccessApi.getAllPackages();

    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error || 'Failed to fetch packages from API',
      };
    }

    const packages = response.data as EsimAccessPackage[];
    console.log(`Fetched ${packages.length} packages from API`);
    if (packages.length > 0) {
      console.log('First package from API:', JSON.stringify(packages[0], null, 2));
    }

    const countryMap = new Map<string, CountryData>();
    const packagesByCountry = new Map<string, PackageData[]>();

    for (const pkg of packages) {
      const locationCodes = parseLocationCode(pkg.locationCode);

      if (locationCodes.length === 0) {
        continue;
      }

      if (!pkg.dataAmount || pkg.dataAmount <= 0) {
        continue;
      }

      const priceInDollars = Number((pkg.price / 10000).toFixed(2));
      const retailPriceInDollars = Number((pkg.retailPrice / 10000).toFixed(2));

      for (const countryCode of locationCodes) {
        const countryInfo = getCountryInfo(countryCode);

        if (!countryInfo) {
          console.warn(`Unknown country code: ${countryCode}`);
          continue;
        }

        if (!countryMap.has(countryCode)) {
          countryMap.set(countryCode, {
            code: countryCode,
            name: countryInfo.name,
            region: countryInfo.region,
            flag: countryInfo.flag,
            api_location_code: pkg.locationCode,
            package_count: 0,
            min_price: priceInDollars,
            min_retail_price: retailPriceInDollars,
            is_top_country: TOP_COUNTRIES.includes(countryCode),
          });
          packagesByCountry.set(countryCode, []);
        }

        const country = countryMap.get(countryCode)!;
        country.package_count += 1;
        if (priceInDollars < country.min_price) {
          country.min_price = priceInDollars;
        }
        if (retailPriceInDollars < country.min_retail_price) {
          country.min_retail_price = retailPriceInDollars;
        }
      }
    }

    console.log(`Organized into ${countryMap.size} countries`);

    const { data: existingCountries, error: fetchError } = await supabase
      .from('countries')
      .select('id, code');

    if (fetchError) {
      return {
        success: false,
        error: `Database error: ${fetchError.message}`,
      };
    }

    const existingCountryMap = new Map(
      (existingCountries || []).map((c: any) => [c.code, c.id])
    );

    const countriesToInsert: any[] = [];
    const countriesToUpdate: any[] = [];
    const countryIdMap = new Map<string, string>();

    for (const [code, country] of countryMap.entries()) {
      if (existingCountryMap.has(code)) {
        const countryId = existingCountryMap.get(code)!;
        countryIdMap.set(code, countryId);
        countriesToUpdate.push({
          id: countryId,
          ...country,
          last_synced_at: new Date().toISOString(),
        });
      } else {
        countriesToInsert.push({
          ...country,
          last_synced_at: new Date().toISOString(),
        });
      }
    }

    let countriesAdded = 0;
    let countriesUpdated = 0;

    if (countriesToInsert.length > 0) {
      const { data: insertedCountries, error: insertError } = await supabase
        .from('countries')
        .insert(countriesToInsert)
        .select('id, code');

      if (insertError) {
        console.error('Error inserting countries:', insertError);
        return {
          success: false,
          error: `Failed to insert countries: ${insertError.message}`,
        };
      }

      countriesAdded = insertedCountries?.length || 0;
      for (const country of insertedCountries || []) {
        countryIdMap.set(country.code, country.id);
      }
    }

    if (countriesToUpdate.length > 0) {
      for (const country of countriesToUpdate) {
        const { error: updateError } = await supabase
          .from('countries')
          .update(country)
          .eq('id', country.id);

        if (updateError) {
          console.error(`Error updating country ${country.code}:`, updateError);
        } else {
          countriesUpdated++;
        }
      }
    }

    const packagesToInsert: any[] = [];

    for (const pkg of packages) {
      const locationCodes = parseLocationCode(pkg.locationCode);

      if (locationCodes.length === 0) {
        continue;
      }

      if (!pkg.dataAmount || pkg.dataAmount <= 0) {
        console.warn(`Skipping package ${pkg.packageCode}: invalid data amount`);
        continue;
      }

      const priceInDollars = Number((pkg.price / 10000).toFixed(2));
      const retailPriceInDollars = Number((pkg.retailPrice / 10000).toFixed(2));

      for (const countryCode of locationCodes) {
        const countryId = countryIdMap.get(countryCode);

        if (!countryId) {
          continue;
        }

        packagesToInsert.push({
          country_id: countryId,
          package_code: pkg.packageCode,
          package_name: pkg.packageName,
          location_code: pkg.locationCode,
          location_name: pkg.locationName,
          data_amount: pkg.dataAmount,
          validity_days: pkg.validity,
          price: priceInDollars,
          retail_price: retailPriceInDollars,
          currency: pkg.currency,
          description: pkg.description || null,
        });
      }
    }

    const { error: deleteError } = await supabase
      .from('esim_packages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error('Error deleting old packages:', deleteError);
    }

    let packagesAdded = 0;

    if (packagesToInsert.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < packagesToInsert.length; i += batchSize) {
        const batch = packagesToInsert.slice(i, i + batchSize);
        const { data: insertedPackages, error: insertError } = await supabase
          .from('esim_packages')
          .insert(batch)
          .select('id');

        if (insertError) {
          console.error('Error inserting packages batch:', insertError);
        } else {
          packagesAdded += insertedPackages?.length || 0;
        }
      }
    }

    console.log(`Sync complete: ${countriesAdded} countries added, ${countriesUpdated} updated, ${packagesAdded} packages added`);

    return {
      success: true,
      stats: {
        countriesAdded,
        countriesUpdated,
        packagesAdded,
      },
    };
  } catch (error) {
    console.error('Error syncing countries:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getLastSyncTime(): Promise<Date | null> {
  const { data, error } = await supabase
    .from('countries')
    .select('last_synced_at')
    .order('last_synced_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data?.last_synced_at) {
    return null;
  }

  return new Date(data.last_synced_at);
}

export async function shouldSync(): Promise<boolean> {
  const lastSync = await getLastSyncTime();

  if (!lastSync) {
    return true;
  }

  const hoursSinceLastSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);

  return hoursSinceLastSync > 24;
}
