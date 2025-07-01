// Load environment variables
require('dotenv').config();
const SlackNotifier = require('./integrations/slack-webhook.js');

// Debug environment loading
console.log('🔍 Environment Debug Info:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Current directory:', process.cwd());
console.log('Dotenv loaded from:', require('path').resolve('.env'));

// Check if .env file exists
const fs = require('fs');
const path = require('path');
const envPath = path.resolve('.env');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📄 .env file content preview:');
  console.log(envContent.split('\n').slice(0, 5).join('\n'));
} else {
  console.log('❌ .env file not found at:', envPath);
}

// Get webhook URL with better validation
const webhookUrl = process.env.SLACK_WEBHOOK_URL;

console.log('\n🔗 Webhook URL Debug:');
console.log('Raw value:', webhookUrl);
console.log('Type:', typeof webhookUrl);
console.log('Length:', webhookUrl ? webhookUrl.length : 'undefined');
console.log('Starts with https:', webhookUrl ? webhookUrl.startsWith('https://') : false);

// Better validation function
function isValidWebhookUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  // Remove any whitespace
  url = url.trim();
  
  // Check if it's the default placeholder
  const placeholders = [
    'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
    'YOUR_WEBHOOK_URL_HERE',
    'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX'
  ];
  
  if (placeholders.includes(url)) {
    return false;
  }
  
  // Check if it's a valid Slack webhook URL format
  const webhookRegex = /^https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[A-Za-z0-9]+$/;
  return webhookRegex.test(url);
}

async function runSlackTests() {
  console.log('\n🚀 Starting Slack Integration Tests...\n');

  // Validate webhook URL
  if (!isValidWebhookUrl(webhookUrl)) {
    console.log('❌ Invalid or missing Slack webhook URL');
    console.log('\n📝 How to fix:');
    console.log('1. Go to https://api.slack.com/apps');
    console.log('2. Create a new app > Incoming Webhooks');
    console.log('3. Add webhook to workspace');
    console.log('4. Copy the webhook URL');
    console.log('5. Update .env file with: SLACK_WEBHOOK_URL=your_actual_url');
    console.log('\n✅ Your webhook URL should look like:');
    console.log('https://hooks.slack.com/services/T1234567890/B0987654321/AbCdEfGhIjKlMnOpQrStUvWx');
    return;
  }

  console.log('✅ Valid webhook URL detected');
  console.log('🎯 Starting notification tests...\n');

  const slack = new SlackNotifier(webhookUrl.trim());

  try {
    // Test 1: Simple welcome message
    console.log('📤 Test 1: Welcome message');
    await slack.sendSimpleMessage('🎉 DevOps Slack integration is working!');
    await sleep(2000);

    // Test 2: Successful deployment
    console.log('📤 Test 2: Successful deployment');
    await slack.sendDeploymentNotification('success', 'v1.0.0', 'staging');
    await sleep(2000);

    // Test 3: Failed deployment
    console.log('📤 Test 3: Failed deployment');
    await slack.sendDeploymentNotification('failure', 'v1.0.1', 'production');
    await sleep(2000);

    // Test 4: Critical alert
    console.log('📤 Test 4: Critical alert');
    await slack.sendAlertNotification('Database Connection Lost', 'critical', 'Primary database server is not responding');
    await sleep(2000);

    // Test 5: Warning alert
    console.log('📤 Test 5: Warning alert');
    await slack.sendAlertNotification('High Memory Usage', 'warning', 'Memory usage is at 89% on web server');
    await sleep(2000);

    // Test 6: Performance alert
    console.log('📤 Test 6: Performance degradation');
    await slack.sendAlertNotification('Slow Response Times', 'warning', 'API response time increased to 3.2 seconds');
    await sleep(2000);

    // Test 7: Security alert
    console.log('📤 Test 7: Security alert');
    await slack.sendAlertNotification('Suspicious Login Activity', 'critical', 'Multiple failed login attempts detected');
    await sleep(2000);

    // Test 8: Auto-scaling notification
    console.log('📤 Test 8: Auto-scaling event');
    await slack.sendSimpleMessage('📈 Auto-scaling triggered: Added 2 new instances due to high traffic');
    await sleep(2000);

    // Test 9: Maintenance notification
    console.log('📤 Test 9: Maintenance window');
    await slack.sendSimpleMessage('🔧 Scheduled maintenance starts in 30 minutes. Expected downtime: 15 minutes');
    await sleep(2000);

    // Test 10: Success summary
    console.log('📤 Test 10: System status');
    await slack.sendSimpleMessage('✅ All systems operational\n• API: 99.9% uptime\n• Database: Healthy\n• Monitoring: Active');

    console.log('\n🎉 All tests completed successfully!');
    console.log('📱 Check your Slack channel for 10 test notifications');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('Request failed with status code 404')) {
      console.log('\n🔍 Troubleshooting 404 error:');
      console.log('• Check if your webhook URL is correct');
      console.log('• Verify the Slack app is installed in your workspace');
      console.log('• Make sure the webhook is added to a channel');
    }
  }
}

// Quick test function for just essential notifications
async function runQuickTest() {
  console.log('\n⚡ Running quick test...\n');

  if (!isValidWebhookUrl(webhookUrl)) {
    console.log('❌ Please set a valid SLACK_WEBHOOK_URL in .env file');
    return;
  }

  const slack = new SlackNotifier(webhookUrl.trim());

  try {
    await slack.sendSimpleMessage('🧪 Quick test: DevOps monitoring active!');
    await slack.sendDeploymentNotification('success', 'v1.0.0', 'test');
    console.log('✅ Quick test completed! Check Slack.');
  } catch (error) {
    console.error('❌ Quick test failed:', error.message);
  }
}

// URL validation test
async function testWebhookUrl() {
  console.log('\n🔗 Testing webhook URL validation...\n');
  
  const testUrls = [
    process.env.SLACK_WEBHOOK_URL,
    'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
    'invalid-url',
    'https://hooks.slack.com/services/T1234567890/B0987654321/ValidWebhookToken123'
  ];

  testUrls.forEach((url, index) => {
    console.log(`Test ${index + 1}: ${url ? url.substring(0, 50) + '...' : 'undefined'}`);
    console.log(`Valid: ${isValidWebhookUrl(url)}\n`);
  });
}

// Helper function for delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Command line interface
const command = process.argv[2] || 'full';

switch (command.toLowerCase()) {
  case 'quick':
    runQuickTest();
    break;
  case 'validate':
    testWebhookUrl();
    break;
  case 'debug':
    console.log('🔍 Debug mode - showing environment info only');
    // Debug info is already shown at the top
    break;
  case 'full':
  default:
    runSlackTests();
    break;
}

// Export for use in other files
module.exports = {
  runSlackTests,
  runQuickTest,
  isValidWebhookUrl
};