#!/usr/bin/env node

/**
 * Test contact save functionality with Neon database
 */

import { saveContactMessage, generateId, getStorageInfo, validateDataStorage } from '../src/lib/dataStorage.js';

async function testContactSave() {
  try {
    console.log('Testing Contact Save to Neon Database...\n');
    
    // Check storage info
    const storageInfo = getStorageInfo();
    console.log('Storage Info:', storageInfo);
    
    // Validate data storage
    const isValid = await validateDataStorage();
    console.log('Data storage validation:', isValid ? 'PASSED' : 'FAILED');
    
    if (!isValid) {
      console.error('Data storage validation failed. Cannot proceed with test.');
      process.exit(1);
    }
    
    // Create test contact message
    const testContact = {
      id: generateId(),
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Message',
      message: 'This is a test message to verify Neon database connectivity.',
      timestamp: new Date()
    };
    
    console.log('\nTest contact data:');
    console.log(JSON.stringify(testContact, null, 2));
    
    // Save contact message
    console.log('\nSaving contact message...');
    await saveContactMessage(testContact);
    console.log('Contact message saved successfully!');
    
    console.log('\nContact save test completed successfully!');
    
  } catch (error) {
    console.error('Error testing contact save:', error);
    process.exit(1);
  }
}

testContactSave();