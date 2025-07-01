// Updated Jira Integration - Replace integrations/jira-integration.js

const axios = require('axios');

class JiraIntegration {
  constructor(baseUrl, email, apiToken) {
    this.baseUrl = baseUrl;
    this.auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
    this.headers = {
      'Authorization': `Basic ${this.auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseUrl}/rest/api/3/myself`, {
        headers: this.headers,
        timeout: 10000
      });
      console.log('✅ Jira connection successful:', response.data.displayName);
      return { success: true, user: response.data };
    } catch (error) {
      console.error('❌ Jira connection failed:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  async getProjects() {
    try {
      const response = await axios.get(`${this.baseUrl}/rest/api/3/project`, {
        headers: this.headers,
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get projects:', error.response?.data || error.message);
      throw error;
    }
  }

  async getIssueTypes(projectKey) {
    try {
      const response = await axios.get(`${this.baseUrl}/rest/api/3/project/${projectKey}`, {
        headers: this.headers,
        timeout: 10000
      });
      return response.data.issueTypes;
    } catch (error) {
      console.error('Failed to get issue types:', error.response?.data || error.message);
      throw error;
    }
  }

  async getProjectConfiguration(projectKey) {
    try {
      const response = await axios.get(`${this.baseUrl}/rest/api/3/project/${projectKey}`, {
        headers: this.headers,
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get project config:', error.response?.data || error.message);
      throw error;
    }
  }

  async createIssue(projectKey, summary, description, issueTypeName = null, priority = 'Medium') {
    try {
      // Get available issue types for the project
      const issueTypes = await this.getIssueTypes(projectKey);
      
      // Find a suitable issue type
      let issueType;
      if (issueTypeName) {
        issueType = issueTypes.find(type => 
          type.name.toLowerCase() === issueTypeName.toLowerCase()
        );
      }
      
      // Fallback to common issue types
      if (!issueType) {
        const fallbackTypes = ['Story', 'Task', 'Bug', 'Epic', 'Improvement'];
        for (const typeName of fallbackTypes) {
          issueType = issueTypes.find(type => 
            type.name.toLowerCase() === typeName.toLowerCase()
          );
          if (issueType) break;
        }
      }
      
      // Use the first available issue type if no fallback found
      if (!issueType && issueTypes.length > 0) {
        issueType = issueTypes[0];
      }
      
      if (!issueType) {
        throw new Error('No suitable issue type found for project');
      }

      console.log(`📝 Using issue type: ${issueType.name}`);

      const issueData = {
        fields: {
          project: { key: projectKey },
          summary: summary,
          description: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    text: description,
                    type: "text"
                  }
                ]
              }
            ]
          },
          issuetype: { id: issueType.id },
          labels: ["devops", "automated", "social-app"]
        }
      };

      // Add priority if the issue type supports it
      try {
        issueData.fields.priority = { name: priority };
      } catch (priorityError) {
        console.log('⚠️ Priority field not supported, skipping...');
      }

      const response = await axios.post(
        `${this.baseUrl}/rest/api/3/issue`,
        issueData,
        {
          headers: this.headers,
          timeout: 15000
        }
      );
      
      console.log('✅ Jira issue created:', response.data.key);
      return {
        key: response.data.key,
        id: response.data.id,
        url: `${this.baseUrl}/browse/${response.data.key}`,
        issueType: issueType.name
      };
    } catch (error) {
      console.error('❌ Failed to create Jira issue:', error.response?.data || error.message);
      throw error;
    }
  }

  async addComment(issueKey, comment) {
    const commentData = {
      body: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                text: comment,
                type: "text"
              }
            ]
          }
        ]
      }
    };

    try {
      await axios.post(
        `${this.baseUrl}/rest/api/3/issue/${issueKey}/comment`,
        commentData,
        {
          headers: this.headers,
          timeout: 10000
        }
      );
      
      console.log('✅ Comment added to Jira issue:', issueKey);
    } catch (error) {
      console.error('❌ Failed to add comment:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateDeploymentStatus(issueKey, version, environment, status) {
    const comment = `🚀 Deployment Update:
• Version: ${version}
• Environment: ${environment}
• Status: ${status}
• Timestamp: ${new Date().toISOString()}
• Automated via DevOps pipeline`;

    await this.addComment(issueKey, comment);
  }

  async searchIssues(jql) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/rest/api/3/search`,
        {
          jql: jql,
          maxResults: 50,
          fields: ['summary', 'status', 'assignee', 'created', 'updated']
        },
        { headers: this.headers }
      );
      
      return response.data.issues;
    } catch (error) {
      console.error('❌ Failed to search issues:', error.response?.data || error.message);
      throw error;
    }
  }

  async getRecentIssues(projectKey, days = 7) {
    const jql = `project = ${projectKey} AND created >= -${days}d ORDER BY created DESC`;
    return await this.searchIssues(jql);
  }
}

module.exports = JiraIntegration;