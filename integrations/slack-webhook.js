const axios = require('axios');

class SlackNotifier {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl;
  }

  async sendSimpleMessage(text) {
    const message = {
      text: text
    };

    try {
      await axios.post(this.webhookUrl, message);
      console.log('✅ Simple message sent to Slack');
    } catch (error) {
      console.error('❌ Failed to send simple message to Slack:', error.message);
      throw error;
    }
  }

  async sendDeploymentNotification(status, version, environment) {
    const color = status === 'success' ? 'good' : 'danger';
    const emoji = status === 'success' ? '✅' : '❌';
    
    const message = {
      attachments: [
        {
          color: color,
          fields: [
            {
              title: `${emoji} Deployment ${status.toUpperCase()}`,
              value: `Version: ${version}\nEnvironment: ${environment}`,
              short: false
            }
          ],
          footer: 'DevOps Bot',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };

    try {
      await axios.post(this.webhookUrl, message);
      console.log('✅ Deployment notification sent to Slack');
    } catch (error) {
      console.error('❌ Failed to send deployment notification:', error.message);
      throw error;
    }
  }

  async sendAlertNotification(alertName, severity, description) {
    const color = severity === 'critical' ? 'danger' : 'warning';
    const emoji = severity === 'critical' ? '🚨' : '⚠️';
    
    const message = {
      attachments: [
        {
          color: color,
          fields: [
            {
              title: `${emoji} ALERT: ${alertName}`,
              value: `Severity: ${severity}\nDescription: ${description}`,
              short: false
            }
          ],
          footer: 'Monitoring System',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };

    try {
      await axios.post(this.webhookUrl, message);
      console.log('✅ Alert notification sent to Slack');
    } catch (error) {
      console.error('❌ Failed to send alert notification:', error.message);
      throw error;
    }
  }

  async sendEnhancedMessage(title, message, color = 'good', fields = []) {
    const payload = {
      attachments: [
        {
          color: color,
          title: title,
          text: message,
          fields: fields,
          footer: 'DevOps Monitor',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };

    try {
      await axios.post(this.webhookUrl, payload);
      console.log('✅ Enhanced message sent to Slack');
    } catch (error) {
      console.error('❌ Failed to send enhanced message:', error.message);
      throw error;
    }
  }

  async sendSystemStatus(services) {
    const statusEmojis = {
      healthy: '✅',
      warning: '⚠️',
      critical: '❌',
      unknown: '❓'
    };

    let statusText = '📊 **System Status Update**\n\n';
    
    services.forEach(service => {
      const emoji = statusEmojis[service.status] || '❓';
      statusText += `${emoji} **${service.name}**: ${service.description}\n`;
    });

    await this.sendSimpleMessage(statusText);
  }

  async sendMetricsReport(metrics) {
    let reportText = '📈 **Performance Metrics Report**\n\n';
    
    Object.entries(metrics).forEach(([key, value]) => {
      reportText += `• **${key}**: ${value}\n`;
    });

    await this.sendSimpleMessage(reportText);
  }
}

module.exports = SlackNotifier;