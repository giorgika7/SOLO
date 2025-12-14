const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

async function seedTestData() {
  console.log('Starting to seed test data...');

  try {
    const testEmail = 'test@example.com';
    const adminEmail = 'admin@solo-esim.com';

    console.log('1. Creating test users...');

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'test123',
      email_confirm: true,
    });

    if (authError && !authError.message.includes('already registered')) {
      throw authError;
    }

    const userId = authUser?.user?.id || (await getUserIdByEmail(testEmail));

    if (userId) {
      await supabase.from('users').upsert({
        id: userId,
        email: testEmail,
        name: 'Test User',
        balance: 100.00,
        currency: 'USD',
        is_admin: false,
      });

      console.log('2. Creating test eSIMs...');

      const mockEsims = [
        {
          user_id: userId,
          order_no: `TEST-${Date.now()}-1`,
          country_name: 'United States',
          package_name: 'USA-5GB-30D',
          iccid: `890126012345678901${Math.floor(Math.random() * 100)}`,
          activation_code: 'LPA:1$lpa.eSimAccess.com$890126012345678901',
          qr_code: null,
          status: 'active',
          data_used: 1024000000,
          data_total: 5368709120,
          purchase_date: new Date().toISOString(),
          expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          user_id: userId,
          order_no: `TEST-${Date.now()}-2`,
          country_name: 'United Kingdom',
          package_name: 'UK-10GB-7D',
          iccid: `890126012345678902${Math.floor(Math.random() * 100)}`,
          activation_code: 'LPA:1$lpa.eSimAccess.com$890126012345678902',
          qr_code: null,
          status: 'active',
          data_used: 500000000,
          data_total: 10737418240,
          purchase_date: new Date().toISOString(),
          expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          user_id: userId,
          order_no: `TEST-${Date.now()}-3`,
          country_name: 'France',
          package_name: 'FR-3GB-15D',
          iccid: `890126012345678903${Math.floor(Math.random() * 100)}`,
          activation_code: 'LPA:1$lpa.eSimAccess.com$890126012345678903',
          qr_code: null,
          status: 'expired',
          data_used: 2147483648,
          data_total: 3221225472,
          purchase_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          expiry_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      const { error: esimError } = await supabase.from('esims').insert(mockEsims);
      if (esimError) throw esimError;

      console.log('3. Creating test orders...');

      const mockOrders = mockEsims.map((esim, index) => ({
        user_id: userId,
        order_no: esim.order_no,
        package_id: null,
        amount: [15.99, 29.99, 12.99][index],
        currency: 'USD',
        status: esim.status === 'expired' ? 'completed' : 'completed',
        payment_method: 'test',
        email: testEmail,
        created_at: esim.purchase_date,
      }));

      const { error: orderError } = await supabase.from('orders').insert(mockOrders);
      if (orderError) throw orderError;

      console.log('Test data seeded successfully!');
      console.log(`Test user email: ${testEmail}`);
      console.log('Test user password: test123');
      console.log(`Admin email: ${adminEmail}`);
      console.log(`Created ${mockEsims.length} test eSIMs and orders`);
    }

  } catch (error) {
    console.error('Error seeding test data:', error);
  }
}

async function getUserIdByEmail(email) {
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();
  return data?.id;
}

seedTestData();
