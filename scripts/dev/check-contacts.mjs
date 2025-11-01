#!/usr/bin/env node

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

async function checkContacts() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('Checking existing contacts in database...\n');
    
    const contacts = await sql`SELECT * FROM contacts ORDER BY timestamp DESC LIMIT 10`;
    
    console.log(`Found ${contacts.length} contact messages:`);
    
    if (contacts.length === 0) {
      console.log('No contact messages found in database.');
    } else {
      contacts.forEach((contact, index) => {
        console.log(`${index + 1}. ${contact.timestamp}: ${contact.name} (${contact.email})`);
        console.log(`   Subject: ${contact.subject}`);
        console.log(`   ID: ${contact.id}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error checking contacts:', error);
  }
}

checkContacts();