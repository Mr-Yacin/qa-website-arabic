#!/usr/bin/env node

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

async function debugDatabase() {
  try {
    console.log('=== Database Debug Information ===\n');
    
    // Check environment variables
    console.log('Environment Variables:');
    console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('- DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
    console.log('- DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20) + '...');
    console.log('');
    
    if (!process.env.DATABASE_URL) {
      console.log('❌ DATABASE_URL not found in environment variables');
      return;
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Test basic connection
    console.log('Testing database connection...');
    const connectionTest = await sql`SELECT NOW() as current_time, version() as db_version`;
    console.log('✅ Connection successful');
    console.log('- Current time:', connectionTest[0].current_time);
    console.log('- Database version:', connectionTest[0].db_version.substring(0, 50) + '...');
    console.log('');
    
    // Check if contacts table exists
    console.log('Checking contacts table...');
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'contacts'
      );
    `;
    console.log('- Contacts table exists:', tableExists[0].exists);
    
    if (!tableExists[0].exists) {
      console.log('❌ Contacts table does not exist!');
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
    
    // Check table structure
    console.log('\nTable structure:');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'contacts'
      ORDER BY ordinal_position;
    `;
    
    columns.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Count total contacts
    console.log('\nContact messages:');
    const count = await sql`SELECT COUNT(*) as total FROM contacts`;
    console.log('- Total contacts:', count[0].total);
    
    // Show recent contacts if any
    if (count[0].total > 0) {
      console.log('\nRecent contacts:');
      const recent = await sql`
        SELECT id, name, email, subject, timestamp 
        FROM contacts 
        ORDER BY timestamp DESC 
        LIMIT 5
      `;
      
      recent.forEach((contact, index) => {
        console.log(`${index + 1}. ${contact.timestamp}: ${contact.name} (${contact.email})`);
        console.log(`   Subject: ${contact.subject}`);
        console.log(`   ID: ${contact.id}`);
        console.log('');
      });
    }
    
    // Check all tables in the database
    console.log('All tables in database:');
    const allTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    allTables.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Database debug failed:', error);
  }
}

debugDatabase();