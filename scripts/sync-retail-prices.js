#!/usr/bin/env node

/**
 * Sync script to update all packages with retail prices from eSIM Access API
 *
 * This script:
 * 1. Fetches all packages from the API
 * 2. Updates the database with retail_price values
 * 3. Recalculates min_retail_price for each country
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const apiKey = process.env.EXPO_PUBLIC_ESIM_ACCESS_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

if (!apiKey) {
  console.error('Missing eSIM Access API key in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchPackagesFromAPI() {
  try {
    const response = await fetch('https://api.esimaccess.com/api/v1/open/package/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-AccessCode': apiKey,
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (!data.success || !data.obj || !data.obj.packageList) {
      throw new Error('Invalid API response');
    }

    return data.obj.packageList;
  } catch (error) {
    console.error('Error fetching packages from API:', error);
    throw error;
  }
}

async function syncRetailPrices() {
  console.log('Starting retail price sync...\n');

  try {
    console.log('Fetching packages from eSIM Access API...');
    const apiPackages = await fetchPackagesFromAPI();
    console.log(`✓ Fetched ${apiPackages.length} packages from API\n`);

    console.log('Fetching existing packages from database...');
    const { data: dbPackages, error: fetchError } = await supabase
      .from('esim_packages')
      .select('id, package_code, price, retail_price');

    if (fetchError) {
      throw new Error(`Database error: ${fetchError.message}`);
    }

    console.log(`✓ Found ${dbPackages.length} packages in database\n`);

    const packageMap = new Map();
    for (const pkg of apiPackages) {
      packageMap.set(pkg.packageCode, {
        price: pkg.price / 100,
        retailPrice: pkg.retailPrice / 100,
      });
    }

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    console.log('Updating packages with retail prices...');

    for (const dbPkg of dbPackages) {
      const apiData = packageMap.get(dbPkg.package_code);

      if (!apiData) {
        console.log(`⚠ Package ${dbPkg.package_code} not found in API, skipping`);
        skippedCount++;
        continue;
      }

      if (dbPkg.retail_price === apiData.retailPrice) {
        skippedCount++;
        continue;
      }

      const { error: updateError } = await supabase
        .from('esim_packages')
        .update({
          price: apiData.price,
          retail_price: apiData.retailPrice,
        })
        .eq('id', dbPkg.id);

      if (updateError) {
        console.error(`✗ Error updating package ${dbPkg.package_code}:`, updateError.message);
        errorCount++;
      } else {
        updatedCount++;
        if (updatedCount % 100 === 0) {
          console.log(`  Updated ${updatedCount} packages...`);
        }
      }
    }

    console.log(`\n✓ Updated ${updatedCount} packages`);
    console.log(`⚠ Skipped ${skippedCount} packages (already up-to-date or not found)`);
    if (errorCount > 0) {
      console.log(`✗ Failed to update ${errorCount} packages`);
    }

    console.log('\nRecalculating min_retail_price for countries...');
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('id, code');

    if (countriesError) {
      throw new Error(`Error fetching countries: ${countriesError.message}`);
    }

    let countriesUpdated = 0;

    for (const country of countries) {
      const { data: packages, error: pkgError } = await supabase
        .from('esim_packages')
        .select('retail_price')
        .eq('country_id', country.id)
        .order('retail_price', { ascending: true })
        .limit(1);

      if (pkgError || !packages || packages.length === 0) {
        continue;
      }

      const minRetailPrice = packages[0].retail_price;

      const { error: updateError } = await supabase
        .from('countries')
        .update({ min_retail_price: minRetailPrice })
        .eq('id', country.id);

      if (!updateError) {
        countriesUpdated++;
      }
    }

    console.log(`✓ Updated min_retail_price for ${countriesUpdated} countries\n`);

    console.log('✅ Retail price sync completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  }
}

syncRetailPrices();
