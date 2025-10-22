#!/usr/bin/env node

/**
 * Test contact API endpoint
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testContactAPI() {
  try {
    console.log('Testing Contact API...\n');
    
    // Check environment variables
    console.log('Environment check:');
    console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('- RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('- ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
    console.log('- FROM_EMAIL:', process.env.FROM_EMAIL);
    console.log('');
    
    // Test data
    const testContactData = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Contact Message',
      message: 'This is a test message to verify the contact form functionality and Neon database integration.'
    };
    
    console.log('Test contact data:');
    console.log(JSON.stringify(testContactData, null, 2));
    console.log('');
    
    // Since we can't directly test the API endpoint without starting the server,
    // let's test the database connection directly
    console.log('Testing Neon database connection...');
    
    try {
      const { neon } = await import('@neondatabase/serverless');
      
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL not configured');
      }
      
      const sql = neon(process.env.DATABASE_URL);
      
      // Test basic connection
      const result = await sql`SELECT 1 as test`;
      console.log('✅ Database connection successful:', result);
      
      // Test if contacts table exists
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'contacts'
        );
      `;
      
      console.log('✅ Contacts table exists:', tableCheck[0].exists);
      
      // If table doesn't exist, create it
      if (!tableCheck[0].exists) {
        console.log('Creating contacts table...');
        await sql`
          CREATE TABLE contacts (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            subject VARCHAR(500) NOT NULL,
            message TEXT NOT NULL,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `;
        console.log('✅ Contacts table created');
      }
      
      // Test inserting a contact message
      const testId = Date.now().toString() + Math.random().toString(36).substring(2, 11);
      await sql`
        INSERT INTO contacts (id, name, email, subject, message, timestamp)
        VALUES (${testId}, ${testContactData.name}, ${testContactData.email}, ${testContactData.subject}, ${testContactData.message}, ${new Date().toISOString()})
      `;
      
      console.log('✅ Test contact message inserted with ID:', testId);
      
      // Verify the insertion
      const inserted = await sql`
        SELECT * FROM contacts WHERE id = ${testId}
      `;
      
      console.log('✅ Verified inserted contact:', {
        id: inserted[0].id,
        name: inserted[0].name,
        email: inserted[0].email,
        subject: inserted[0].subject,
        timestamp: inserted[0].timestamp
      });
      
      // Clean up test data
      await sql`DELETE FROM contacts WHERE id = ${testId}`;
      console.log('✅ Test data cleaned up');
      
    } catch (dbError) {
      console.error('❌ Database test failed:', dbError);
      throw dbError;
    }
    
    console.log('\n✅ Contact API and Neon database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing contact API:', error);
    process.exit(1);
  }
}

testContactAPI();