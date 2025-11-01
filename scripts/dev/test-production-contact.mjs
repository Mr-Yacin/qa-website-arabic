#!/usr/bin/env node

/**
 * Test contact API in production environment
 */

async function testProductionContact() {
  try {
    console.log('Testing production contact API...\n');
    
    // Test data
    const testContactData = {
      name: 'Test User Production',
      email: 'test-production@example.com',
      subject: 'Production Test Message',
      message: 'This is a test message to verify the contact form functionality in production environment.'
    };
    
    console.log('Sending test contact message...');
    console.log('Data:', JSON.stringify(testContactData, null, 2));
    
    // Replace with your actual production URL
    const productionUrl = 'https://your-site.vercel.app'; // Update this!
    const apiUrl = `${productionUrl}/api/contact`;
    
    console.log(`\nTesting API endpoint: ${apiUrl}`);
    
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
      console.log('✅ Contact form submission successful!');
    } else {
      console.log('❌ Contact form submission failed:', responseData.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing production contact:', error);
  }
}

testProductionContact();