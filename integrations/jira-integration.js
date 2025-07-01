const axios = require('axios');

class JiraIntegration {
  constructor(baseUrl, email, apiToken) {
    this.baseUrl = baseUrl;
    this.auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
  }

  async createIssue(projectKey, summary, description, issueType = 'Bug') {
    const issueData = {
      fields: {
        project: { key: projectKey },
        summary: summary,
        description: description,
        issuetype: { name: issueType },
        priority: { name: 'High' }
      }
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/rest/api/3/issue`,
        issueData,
        {
          headers: {
            'Authorization': `Basic ${this.auth}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Jira issue created:', response.data.key);
      return response.data;
    } catch (error) {
      console.error('Failed to create Jira issue:', error.response?.data || error.message);
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
          headers: {
            'Authorization': `Basic ${this.auth}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Comment added to Jira issue:', issueKey);
    } catch (error) {
      console.error('Failed to add comment:', error.response?.data || error.message);
    }
  }

  async updateDeploymentStatus(issueKey, version, environment, status) {
    const comment = `Deployment Update:
- Version: ${version}
- Environment: ${environment}
- Status: ${status}
- Timestamp: ${new Date().toISOString()}`;

    await this.addComment(issueKey, comment);
  }
}

module.exports = JiraIntegration;