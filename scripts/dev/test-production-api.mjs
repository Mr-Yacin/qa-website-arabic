#!/usr/bin/env node

/**
 * Test production contact API
 */

async function testProductionAPI() {
  try {
    console.log('Testing production contact API...\n');
    
    // You need to replace this with your actual Vercel URL
    const productionUrl = 'https://www.soaale.com'; // Custom domain
    
    console.log('⚠️  Please update the productionUrl in this script with your actual Vercel URL');
    console.log('Current URL (needs to be updated):', productionUrl);
    console.log('');
    
    // Test data
    const testContactData = {
      name: 'Production Test User',
      email: 'production-test@example.com',
      subject: 'Production API Test',
      message: 'This is a test message to verify the production contact API is working and saving to Neon database.'
    };
    
    console.log('Test data:');
    console.log(JSON.stringify(testContactData, null, 2));
    console.log('');
    
    const apiUrl = `${productionUrl}/api/contact`;
    console.log(`Testing API endpoint: ${apiUrl}`);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testContactData),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      if (response.ok && responseData.ok) {
        console.log('✅ Production contact API is working!');
        
        // Wait a moment then check database
        console.log('\nWaiting 3 seconds then checking database...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check if message was saved
        const { neon } = await import('@neondatabase/serverless');
        const dotenv = await import('dotenv');
        dotenv.config();
        
        if (process.env.DATABASE_URL) {
          const sql = neon(process.env.DATABASE_URL);
          const contacts = await sql`
            SELECT * FROM contacts 
            WHERE email = ${testContactData.email} 
            ORDER BY timestamp DESC 
            LIMIT 1
          `;
          
          if (contacts.length > 0) {
            console.log('✅ Message found in database:', {
              id: contacts[0].id,
              name: contacts[0].name,
              email: contacts[0].email,
              subject: contacts[0].subject,
              timestamp: contacts[0].timestamp
            });
            
            // Clean up test data
            await sql`DELETE FROM contacts WHERE email = ${testContactData.email}`;
            console.log('✅ Test data cleaned up');
          } else {
            console.log('❌ Message not found in database - production may not be saving to Neon');
          }
        }
        
      } else {
        console.log('❌ Production contact API failed:', responseData.message);
      }
      
    } catch (fetchError) {
      console.error('❌ Failed to connect to production API:', fetchError.message);
      console.log('\nPossible issues:');
      console.log('1. Update the productionUrl variable with your actual Vercel URL');
      console.log('2. Make sure your site is deployed and accessible');
      console.log('3. Check if the /api/contact endpoint exists in production');
    }
    
  } catch (error) {
    console.error('❌ Error testing production API:', error);
  }
}

testProductionAPI();