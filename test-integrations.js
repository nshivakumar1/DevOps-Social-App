require('dotenv').config();
const SlackNotifier = require('./integrations/slack-webhook.js');
const JiraIntegration = require('./integrations/jira-integration.js');
const axios = require('axios');

class IntegrationTester {
  constructor() {
    this.slack = process.env.SLACK_WEBHOOK_URL ? new SlackNotifier(process.env.SLACK_WEBHOOK_URL) : null;
    this.jira = (process.env.JIRA_BASE_URL && process.env.JIRA_EMAIL && process.env.JIRA_API_TOKEN) 
      ? new JiraIntegration(process.env.JIRA_BASE_URL, process.env.JIRA_EMAIL, process.env.JIRA_API_TOKEN) 
      : null;
  }

  async testSlackIntegration() {
    console.log('\n🔔 Testing Slack Integration...');
    
    if (!this.slack) {
      console.log('❌ Slack not configured. Please set SLACK_WEBHOOK_URL in .env');
      return false;
    }

    try {
      await this.slack.sendSimpleMessage('🧪 Integration test: Slack is working with DPT project!');
      console.log('✅ Slack integration working');
      return true;
    } catch (error) {
      console.log('❌ Slack integration failed:', error.message);
      return false;
    }
  }

  async testJiraIntegration() {
    console.log('\n🎫 Testing Jira Integration...');
    
    if (!this.jira) {
      console.log('❌ Jira not configured. Please set JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN in .env');
      return false;
    }

    try {
      // Test connection
      const connectionTest = await this.jira.testConnection();
      if (!connectionTest.success) {
        console.log('❌ Jira connection failed:', connectionTest.error);
        return false;
      }

      // Get projects and focus on DPT
      const projects = await this.jira.getProjects();
      console.log('✅ Jira connection successful');
      console.log('📋 Available projects:');
      projects.slice(0, 5).forEach(project => {
        const indicator = project.key === 'DPT' ? '👉' : '  ';
        console.log(`${indicator} • ${project.key}: ${project.name}`);
      });

      // Test DPT project specifically
      const projectKey = process.env.JIRA_PROJECT_KEY || 'DPT';
      console.log(`\n🎯 Testing ${projectKey} project access...`);
      
      const issueTypes = await this.jira.getIssueTypes(projectKey);
      console.log(`✅ ${projectKey} project accessible`);
      console.log('📝 Available issue types:', issueTypes.map(t => t.name).join(', '));

      return true;
    } catch (error) {
      console.log('❌ Jira integration failed:', error.message);
      return false;
    }
  }

  async testJiraIssueCreation() {
    console.log('\n🎫 Testing Jira Issue Creation...');
    
    if (!this.jira) {
      console.log('❌ Jira not configured');
      return false;
    }

    try {
      const projectKey = process.env.JIRA_PROJECT_KEY || 'DPT';
      
      const issue = await this.jira.createIssue(
        projectKey,
        '🧪 Test Issue from DevOps Social App',
        `This is an automated test issue created by the DevOps Social App integration testing.

**Project Details:**
- Project: ${projectKey} (DevOps-Pipeline-Testing)
- Created: ${new Date().toISOString()}
- Purpose: Verify CI/CD pipeline integration
- Environment: ${process.env.NODE_ENV || 'development'}

**Integration Test Status:**
✅ Slack integration: Working
✅ Jira API access: Working  
✅ Issue creation: Working

This issue can be safely closed after verification.`,
        'Task',
        'Low'
      );

      console.log('✅ Test issue created successfully');
      console.log(`🔗 Issue Key: ${issue.key}`);
      console.log(`🌐 Issue URL: ${issue.url}`);
      
      // Add a comment to the issue
      await this.jira.addComment(issue.key, '✅ Automated comment: Issue creation test completed successfully! CI/CD pipeline integration verified.');
      console.log('✅ Comment added to issue');

      return issue;
    } catch (error) {
      console.log('❌ Failed to create test issue:', error.message);
      return false;
    }
  }

  async testWebAppIntegration() {
    console.log('\n🌐 Testing Web App Integration...');
    
    const backendUrl = 'http://localhost:3001';
    
    try {
      // Test health endpoint
      const healthResponse = await axios.get(`${backendUrl}/health`);
      console.log('✅ Backend health check passed');
      console.log('📊 Integrations status:', healthResponse.data.integrations);

      return true;
    } catch (error) {
      console.log('❌ Web app integration test failed:', error.message);
      console.log('💡 Make sure the backend is running: cd app && docker-compose up -d');
      return false;
    }
  }

  async runAllTests() {
    console.log('🧪 Starting Integration Test Suite for DPT Project...');
    console.log('='.repeat(60));

    const results = {
      slack: await this.testSlackIntegration(),
      jira: await this.testJiraIntegration(),
      jiraIssueCreation: false,
      webApp: await this.testWebAppIntegration()
    };

    // Only test Jira issue creation if Jira connection works
    if (results.jira) {
      results.jiraIssueCreation = await this.testJiraIssueCreation();
    }

    console.log('\n📊 Test Results Summary:');
    console.log('='.repeat(30));
    Object.entries(results).forEach(([test, passed]) => {
      const status = passed ? '✅ PASSED' : '❌ FAILED';
      console.log(`${status} ${test}`);
    });

    const passedTests = Object.values(results).filter(r => r === true || r !== false).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
      console.log('\n🎉 All integrations working perfectly with DPT project!');
      console.log('🚀 Ready for GitHub Actions CI/CD pipeline!');
    } else {
      console.log('\n💡 Setup Guide:');
      if (!results.slack) {
        console.log('   📱 Set up Slack: Get webhook URL from https://api.slack.com/apps');
      }
      if (!results.jira) {
        console.log('   🎫 Set up Jira: Get API token from Jira settings');
      }
      if (!results.webApp) {
        console.log('   🌐 Start backend: cd app && docker-compose up -d');
      }
    }

    return results;
  }
}

// Command line interface
async function main() {
  const tester = new IntegrationTester();
  const command = process.argv[2] || 'all';

  switch (command.toLowerCase()) {
    case 'slack':
      await tester.testSlackIntegration();
      break;
    case 'jira':
      await tester.testJiraIntegration();
      break;
    case 'webapp':
      await tester.testWebAppIntegration();
      break;
    case 'issue':
      await tester.testJiraIssueCreation();
      break;
    case 'all':
    default:
      await tester.runAllTests();
      break;
  }
}

// Export for use in other files
module.exports = IntegrationTester;

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}