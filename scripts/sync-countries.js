#!/usr/bin/env node

const fetch = require('node-fetch');
global.fetch = fetch;

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const apiKey = process.env.EXPO_PUBLIC_ESIM_ACCESS_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

if (!apiKey) {
  console.error('Missing API key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncCountries() {
  try {
    console.log('Fetching packages from API...');

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

    const packages = data.obj.packageList;
    console.log(`Fetched ${packages.length} packages`);

    console.log('Deleting old packages...');
    await supabase.from('esim_packages').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Inserting new packages...');
    let inserted = 0;
    let failed = 0;

    for (const pkg of packages) {
      if (!pkg.volume || pkg.volume <= 0) {
        continue;
      }

      const { data: country } = await supabase
        .from('countries')
        .select('id')
        .eq('code', pkg.locationCode)
        .maybeSingle();

      if (!country) {
        continue;
      }

      const priceInDollars = Number((pkg.price / 10000).toFixed(2));
      const retailPriceInDollars = Number((pkg.retailPrice / 10000).toFixed(2));

      const { error } = await supabase.from('esim_packages').insert({
        country_id: country.id,
        package_code: pkg.packageCode,
        package_name: pkg.name,
        location_code: pkg.locationCode,
        location_name: pkg.location,
        data_amount: pkg.volume,
        validity_days: pkg.duration,
        price: priceInDollars,
        retail_price: retailPriceInDollars,
        currency: pkg.currencyCode,
        description: pkg.description || null,
      });

      if (error) {
        failed++;
        if (failed < 10) {
          console.error(`Error inserting ${pkg.packageCode}:`, error.message);
        }
      } else {
        inserted++;
        if (inserted % 100 === 0) {
          console.log(`Inserted ${inserted} packages...`);
        }
      }
    }

    console.log(`\nSync complete!`);
    console.log(`Inserted: ${inserted}`);
    console.log(`Failed: ${failed}`);

    await supabase
      .from('countries')
      .update({ last_synced_at: new Date().toISOString() })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    process.exit(0);
  } catch (error) {
    console.error('Sync failed:', error.message);
    process.exit(1);
  }
}

syncCountries();
