#!/usr/bin/env node

/**
 * Check existing data in Neon database
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkExistingData() {
  try {
    console.log('📊 Checking Existing Data in Neon Database...\n');
    
    const { neon } = await import('@neondatabase/serverless');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Check contacts
    console.log('📧 Checking contacts table...');
    const contacts = await sql`
      SELECT id, name, email, subject, timestamp 
      FROM contacts 
      ORDER BY timestamp DESC 
      LIMIT 10
    `;
    
    if (contacts.length > 0) {
      console.log(`✅ Found ${contacts.length} contact messages (showing latest 10):`);
      contacts.forEach((contact, index) => {
        console.log(`  ${index + 1}. ${contact.name} (${contact.email}) - "${contact.subject}" - ${new Date(contact.timestamp).toLocaleString()}`);
      });
    } else {
      console.log('ℹ️  No contact messages found in database');
    }
    
    console.log('');
    
    // Check ratings
    console.log('⭐ Checking ratings table...');
    const ratings = await sql`
      SELECT question_slug, average, count, last_updated 
      FROM ratings 
      ORDER BY last_updated DESC 
      LIMIT 10
    `;
    
    if (ratings.length > 0) {
      console.log(`✅ Found ${ratings.length} question ratings (showing latest 10):`);
      ratings.forEach((rating, index) => {
        console.log(`  ${index + 1}. ${rating.question_slug} - Average: ${rating.average} (${rating.count} votes) - ${new Date(rating.last_updated).toLocaleString()}`);
      });
    } else {
      console.log('ℹ️  No ratings found in database');
    }
    
    console.log('');
    
    // Check search index
    console.log('🔍 Checking search_index table...');
    const searchIndexEntries = await sql`
      SELECT id, last_updated 
      FROM search_index 
      ORDER BY last_updated DESC 
      LIMIT 5
    `;
    
    if (searchIndexEntries.length > 0) {
      console.log(`✅ Found ${searchIndexEntries.length} search index entries:`);
      searchIndexEntries.forEach((entry, index) => {
        console.log(`  ${index + 1}. ID: ${entry.id} - Updated: ${new Date(entry.last_updated).toLocaleString()}`);
      });
    } else {
      console.log('ℹ️  No search index entries found in database');
    }
    
    console.log('\n✅ Database check completed successfully!');
    
  } catch (error) {
    console.error('❌ Error checking existing data:', error);
    process.exit(1);
  }
}

checkExistingData();