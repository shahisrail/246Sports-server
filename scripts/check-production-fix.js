#!/usr/bin/env node

/**
 * Check if Production Email Subscriptions Fix is Deployed
 *
 * This script tests if the production server has the email subscriptions fix
 */

const https = require('https');

const testEmail = 'dev.mydrtech@gmail.com';
const testAssociationId = 'c1539b33-b8fa-4bb5-abd9-6d626b3eef7a';
const baseUrl = 'demo.246sports.com';

console.log('');
console.log('🔍 Testing Production Email Subscriptions Fix');
console.log('==============================================');
console.log('');
console.log(`📧 Email: ${testEmail}`);
console.log(`🏟️  Association ID: ${testAssociationId}`);
console.log(`🌐 URL: https://${baseUrl}`);
console.log('');

// Test 1: Check Status Endpoint
function testStatusEndpoint() {
  return new Promise((resolve, reject) => {
    const path = `/api/v1/email-subscriptions/status?email=${encodeURIComponent(testEmail)}&association_id=${testAssociationId}`;

    console.log('Test 1: GET /api/v1/email-subscriptions/status');
    console.log(`URL: https://${baseUrl}${path}`);

    const options = {
      hostname: baseUrl,
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': '246Sports-Health-Check/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);

        if (res.statusCode === 200) {
          console.log('✅ SUCCESS - Status endpoint is working!');
          try {
            const response = JSON.parse(data);
            console.log('Response:', JSON.stringify(response, null, 2));
          } catch (e) {
            console.log('Response:', data);
          }
          resolve(true);
        } else if (res.statusCode === 500) {
          console.log('❌ FAILED - 500 Internal Server Error');
          console.log('The fix has NOT been applied yet');
          console.log('');
          console.log('🔧 Possible reasons:');
          console.log('   1. Coolify is still deploying (wait 2-3 minutes)');
          console.log('   2. The server needs to be restarted');
          console.log('   3. Check Coolify logs for errors');
          resolve(false);
        } else {
          console.log(`⚠️  Unexpected status code: ${res.statusCode}`);
          console.log('Response:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Test 2: Check Subscribe Endpoint
function testSubscribeEndpoint() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: testEmail,
      association_id: testAssociationId,
      preferences: {
        news: true,
        fixtures: true,
        results: true
      }
    });

    console.log('');
    console.log('Test 2: POST /api/v1/email-subscriptions/subscribe');

    const options = {
      hostname: baseUrl,
      port: 443,
      path: '/api/v1/email-subscriptions/subscribe',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': '246Sports-Health-Check/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);

        if (res.statusCode === 201 || res.statusCode === 200) {
          console.log('✅ SUCCESS - Subscribe endpoint is working!');
          try {
            const response = JSON.parse(data);
            console.log('Response:', JSON.stringify(response, null, 2));
          } catch (e) {
            console.log('Response:', data);
          }
          resolve(true);
        } else if (res.statusCode === 500) {
          console.log('❌ FAILED - 500 Internal Server Error');
          console.log('The fix has NOT been applied yet');
          resolve(false);
        } else if (res.statusCode === 404) {
          console.log('⚠️  Association not found (this is OK - means endpoint works)');
          console.log('Response:', data);
          resolve(true);
        } else {
          console.log(`⚠️  Unexpected status code: ${res.statusCode}`);
          console.log('Response:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

// Run tests
async function runTests() {
  try {
    const test1 = await testStatusEndpoint();
    const test2 = await testSubscribeEndpoint();

    console.log('');
    console.log('==============================================');
    console.log('📊 Final Results:');
    console.log('==============================================');

    if (test1 && test2) {
      console.log('');
      console.log('✅ ALL TESTS PASSED!');
      console.log('');
      console.log('🎉 The email subscriptions fix is working on production!');
      console.log('');
    } else {
      console.log('');
      console.log('❌ TESTS FAILED');
      console.log('');
      console.log('🔧 Next steps:');
      console.log('   1. Check Coolify dashboard for deployment status');
      console.log('   2. Look for "Checking email subscriptions fix..." in logs');
      console.log('   3. If still deploying, wait 2-3 minutes and try again');
      console.log('   4. If deployed but not working, check Coolify logs for errors');
      console.log('');
    }

  } catch (error) {
    console.error('');
    console.error('❌ Test error:', error.message);
    console.error('');
    console.error('Possible issues:');
    console.error('   - Network connection failed');
    console.error('   - Production server is down');
    console.error('   - DNS resolution failed');
    console.error('');
  }
}

runTests();
