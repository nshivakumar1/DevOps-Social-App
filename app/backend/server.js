// Enhanced backend with Slack and Jira integration for posts
// Replace your app/backend/server.js with this version

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const promClient = require('prom-client');
const SlackNotifier = require('../../integrations/slack-webhook.js');
const JiraIntegration = require('../../integrations/jira-integration.js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize integrations
const slack = process.env.SLACK_WEBHOOK_URL ? new SlackNotifier(process.env.SLACK_WEBHOOK_URL) : null;
const jira = (process.env.JIRA_BASE_URL && process.env.JIRA_EMAIL && process.env.JIRA_API_TOKEN) 
  ? new JiraIntegration(process.env.JIRA_BASE_URL, process.env.JIRA_EMAIL, process.env.JIRA_API_TOKEN) 
  : null;

// Prometheus metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register]
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const postsCreatedTotal = new promClient.Counter({
  name: 'posts_created_total',
  help: 'Total number of posts created',
  labelNames: ['author'],
  registers: [register]
});

const activeUsers = new promClient.Gauge({
  name: 'active_users_total',
  help: 'Number of active users',
  registers: [register]
});

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@db:5432/socialapp'
});

app.use(cors());
app.use(express.json());

// Track active users (simple implementation)
const activeUserSet = new Set();
setInterval(() => {
  activeUsers.set(activeUserSet.size);
  activeUserSet.clear();
}, 60000); // Reset every minute

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Track user activity (simple IP-based tracking)
  const userIp = req.ip || req.connection.remoteAddress;
  activeUserSet.add(userIp);
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration.observe(
      { method: req.method, route, status_code: res.statusCode },
      duration
    );
    
    httpRequestTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode
    });
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    integrations: {
      slack: slack ? 'enabled' : 'disabled',
      jira: jira ? 'enabled' : 'disabled'
    }
  });
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Initialize database
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        author VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add sample data if table is empty
    const count = await pool.query('SELECT COUNT(*) FROM posts');
    if (parseInt(count.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO posts (content, author) VALUES 
        ('Welcome to SocialClone! 🎉', 'system'),
        ('This is a demo DevOps project with monitoring', 'admin'),
        ('Slack and Jira integrations are active! 📱', 'devops')
      `);
    }
    
    console.log('✅ Database initialized');
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
  }
}

// API Routes
app.get('/api/posts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts ORDER BY created_at DESC LIMIT 50');
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { content, author } = req.body;
    if (!content || !author) {
      return res.status(400).json({ error: 'Content and author required' });
    }
    
    // Insert post into database
    const result = await pool.query(
      'INSERT INTO posts (content, author, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [content, author]
    );
    
    const newPost = result.rows[0];
    
    // Update metrics
    postsCreatedTotal.inc({ author });
    
    // Send Slack notification for new posts (optional)
    if (slack && process.env.NOTIFY_NEW_POSTS === 'true') {
      try {
        await slack.sendSimpleMessage(`📝 New post by @${author}: "${content}"`);
        console.log('✅ Slack notification sent for new post');
      } catch (slackError) {
        console.error('❌ Failed to send Slack notification:', slackError.message);
      }
    }
    
    // Check for keyword alerts and create Jira issues
    const alertKeywords = ['bug', 'error', 'broken', 'issue', 'problem', 'help'];
    const hasAlert = alertKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
    
    if (hasAlert && jira) {
      try {
        const issue = await jira.createIssue(
          'DEMO', // Replace with your Jira project key
          `User Report: ${content.substring(0, 50)}...`,
          `User @${author} reported: "${content}"\n\nPosted at: ${newPost.created_at}\nPost ID: ${newPost.id}`,
          'Task'
        );
        console.log('✅ Jira issue created:', issue.key);
        
        // Notify Slack about Jira issue creation
        if (slack) {
          await slack.sendSimpleMessage(`🎫 Jira issue ${issue.key} created for user report by @${author}`);
        }
      } catch (jiraError) {
        console.error('❌ Failed to create Jira issue:', jiraError.message);
      }
    }
    
    res.json(newPost);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Trigger alerts endpoint (for testing)
app.post('/api/trigger-alert', async (req, res) => {
  try {
    const { alertType, severity, description } = req.body;
    
    // Send Slack alert
    if (slack) {
      await slack.sendAlertNotification(
        alertType || 'Test Alert',
        severity || 'warning',
        description || 'This is a test alert triggered from the web app'
      );
    }
    
    // Create Jira issue for critical alerts
    if (jira && severity === 'critical') {
      const issue = await jira.createIssue(
        'DEMO', // Replace with your project key
        `Critical Alert: ${alertType}`,
        `Alert Details:\nType: ${alertType}\nSeverity: ${severity}\nDescription: ${description}\n\nTriggered at: ${new Date().toISOString()}`,
        'Bug'
      );
      console.log('✅ Critical alert Jira issue created:', issue.key);
    }
    
    res.json({ 
      success: true, 
      message: 'Alert triggered successfully',
      integrations: {
        slack: slack ? 'notified' : 'disabled',
        jira: (jira && severity === 'critical') ? 'issue created' : 'not triggered'
      }
    });
  } catch (error) {
    console.error('Alert trigger error:', error);
    res.status(500).json({ error: error.message });
  }
});

// System status endpoint
app.get('/api/system-status', async (req, res) => {
  try {
    const dbStatus = await pool.query('SELECT NOW()');
    const postCount = await pool.query('SELECT COUNT(*) FROM posts');
    
    const status = {
      database: 'healthy',
      postsCount: parseInt(postCount.rows[0].count),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      integrations: {
        slack: slack ? 'enabled' : 'disabled',
        jira: jira ? 'enabled' : 'disabled'
      }
    };
    
    res.json(status);
  } catch (error) {
    res.status(500).json({ 
      database: 'unhealthy', 
      error: error.message 
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Backend server running on port ${port}`);
  console.log(`📱 Slack integration: ${slack ? 'ENABLED' : 'DISABLED'}`);
  console.log(`🎫 Jira integration: ${jira ? 'ENABLED' : 'DISABLED'}`);
  initDB();
});

// Simulate some alerts for testing (optional)
if (process.env.NODE_ENV === 'development') {
  setTimeout(async () => {
    if (slack) {
      console.log('📊 Sending startup notification to Slack...');
      try {
        await slack.sendSimpleMessage('🚀 SocialClone backend started successfully!');
      } catch (error) {
        console.error('Failed to send startup notification:', error.message);
      }
    }
  }, 5000); // Send after 5 seconds
}