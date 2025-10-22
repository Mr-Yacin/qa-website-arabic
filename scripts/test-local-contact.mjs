#!/usr/bin/env node

/**
 * Test local contact API
 */

async function testLocalContact() {
  try {
    console.log('Testing local contact API...\n');
    
    // Test data
    const testContactData = {
      name: 'Test User Local',
      email: 'test-local@example.com',
      subject: 'Local Test Message',
      message: 'This is a test message to verify the contact form functionality in local development environment.'
    };
    
    console.log('Sending test contact message to local server...');
    console.log('Data:', JSON.stringify(testContactData, null, 2));
    
    const apiUrl = 'http://localhost:4322/api/contact';
    console.log(`\nTesting API endpoint: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testContactData),
    });
    
    console.log('Response status:', response.status);
    
    const responseData = await response.json();
    console.log('Response data:', responseData);
    
    if (response.ok && responseData.ok) {
      console.log('✅ Contact form submission successful!');
      
      // Now check if it was saved to database
      console.log('\nChecking if message was saved to database...');
      
      // Import and check database directly
      const { neon } = await import('@neondatabase/serverless');
      const dotenv = await import('dotenv');
      dotenv.config();
      
      if (process.env.DATABASE_URL) {
        const sql = neon(process.env.DATABASE_URL);
        const contacts = await sql`SELECT * FROM contacts WHERE email = ${testContactData.email} ORDER BY timestamp DESC LIMIT 1`;
        
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
          console.log('❌ Message not found in database');
        }
      } else {
        console.log('⚠️  DATABASE_URL not configured, cannot check database');
      }
      
    } else {
      console.log('❌ Contact form submission failed:', responseData.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing local contact:', error);
  }
}

testLocalContact();