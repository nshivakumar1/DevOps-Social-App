#!/bin/bash

echo "🚀 Setting up complete DevOps Social App..."

# Create directory structure
mkdir -p app/{frontend,backend,database}
mkdir -p monitoring/{prometheus,grafana,alertmanager}

# ===================
# BACKEND APPLICATION
# ===================

echo "📱 Creating Backend Application..."

# Backend package.json
cat > app/backend/package.json << 'EOF'
{
  "name": "social-backend",
  "version": "1.0.0",
  "description": "Social media backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "pg": "^8.8.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "prom-client": "^14.2.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF

# Backend server.js
cat > app/backend/server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const promClient = require('prom-client');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

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

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@db:5432/socialapp'
});

app.use(cors());
app.use(express.json());

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
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
    version: '1.0.0'
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
        ('Slack integration is working! 📱', 'devops')
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
    
    const result = await pool.query(
      'INSERT INTO posts (content, author, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [content, author]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Backend server running on port ${port}`);
  initDB();
});
EOF

# Backend Dockerfile
cat > app/backend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
EOF

# ===================
# FRONTEND APPLICATION  
# ===================

echo "🎨 Creating Frontend Application..."

# Frontend package.json
cat > app/frontend/package.json << 'EOF'
{
  "name": "social-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "axios": "^1.4.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOF

# Create React app structure
mkdir -p app/frontend/{src,public}

# Frontend public/index.html
cat > app/frontend/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Social Clone - DevOps Demo App" />
    <title>🐦 SocialClone</title>
    <style>
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
          sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background-color: #f5f5f5;
      }
    </style>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
EOF

# Frontend src/index.js
cat > app/frontend/src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

# Frontend src/App.js
cat > app/frontend/src/App.js << 'EOF'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/posts`);
      setPosts(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || !author.trim()) return;

    try {
      await axios.post(`${API_URL}/api/posts`, {
        content: newPost,
        author: author
      });
      setNewPost('');
      await fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post');
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🐦 SocialClone</h1>
        <p>DevOps Demo Social Media App</p>
      </header>
      
      <div className="container">
        <div className="post-form-container">
          <form onSubmit={handleSubmit} className="post-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Your name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                className="author-input"
              />
            </div>
            <div className="form-group">
              <textarea
                placeholder="What's happening?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                required
                className="content-input"
                rows="3"
              />
            </div>
            <button type="submit" className="submit-btn">
              📝 Post
            </button>
          </form>
        </div>

        <div className="posts-container">
          <h2>Recent Posts</h2>
          
          {loading && <div className="loading">Loading posts...</div>}
          
          {error && <div className="error">{error}</div>}
          
          {!loading && posts.length === 0 && (
            <div className="no-posts">No posts yet. Be the first to post!</div>
          )}
          
          <div className="posts">
            {posts.map((post) => (
              <div key={post.id} className="post">
                <div className="post-header">
                  <strong className="post-author">@{post.author}</strong>
                  <span className="post-time">
                    {new Date(post.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="post-content">{post.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <footer className="app-footer">
        <p>🚀 DevOps Social App • Monitoring: <a href="http://localhost:3002" target="_blank" rel="noopener noreferrer">Grafana</a> • <a href="http://localhost:9090" target="_blank" rel="noopener noreferrer">Prometheus</a></p>
      </footer>
    </div>
  );
}

export default App;
EOF

# Frontend src/App.css
cat > app/frontend/src/App.css << 'EOF'
.App {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  min-height: 100vh;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.app-header {
  text-align: center;
  padding: 20px 0;
  border-bottom: 2px solid #e1e8ed;
  margin-bottom: 30px;
}

.app-header h1 {
  color: #1da1f2;
  margin: 0;
  font-size: 2.5em;
}

.app-header p {
  color: #657786;
  margin: 10px 0 0 0;
}

.container {
  max-width: 600px;
  margin: 0 auto;
}

.post-form-container {
  background: #f7f9fa;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 30px;
  border: 1px solid #e1e8ed;
}

.post-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.author-input, .content-input {
  padding: 12px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
}

.author-input:focus, .content-input:focus {
  outline: none;
  border-color: #1da1f2;
  box-shadow: 0 0 0 2px rgba(29, 161, 242, 0.2);
}

.content-input {
  resize: vertical;
  min-height: 80px;
}

.submit-btn {
  background: #1da1f2;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
  align-self: flex-end;
}

.submit-btn:hover {
  background: #1991db;
}

.posts-container h2 {
  color: #14171a;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e1e8ed;
}

.posts {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 15px;
  transition: box-shadow 0.2s;
}

.post:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.post-author {
  color: #1da1f2;
  font-size: 16px;
}

.post-time {
  color: #657786;
  font-size: 14px;
}

.post-content {
  color: #14171a;
  margin: 0;
  line-height: 1.5;
  font-size: 15px;
}

.loading, .error, .no-posts {
  text-align: center;
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
}

.loading {
  background: #e1f5fe;
  color: #0288d1;
}

.error {
  background: #ffebee;
  color: #c62828;
}

.no-posts {
  background: #f3e5f5;
  color: #7b1fa2;
}

.app-footer {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e1e8ed;
  color: #657786;
}

.app-footer a {
  color: #1da1f2;
  text-decoration: none;
}

.app-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .App {
    padding: 10px;
  }
  
  .app-header h1 {
    font-size: 2em;
  }
  
  .post-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
EOF

# Frontend Dockerfile
cat > app/frontend/Dockerfile << 'EOF'
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF

# Nginx configuration for frontend
cat > app/frontend/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://backend:3001;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
EOF

# ===================
# DOCKER COMPOSE FILES
# ===================

echo "🐳 Creating Docker Compose configurations..."

# Main application docker-compose.yml
cat > app/docker-compose.yml << 'EOF'
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: socialapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d socialapp"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://user:password@db:5432/socialapp
      NODE_ENV: development
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      REACT_APP_API_URL: http://localhost:3001
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
EOF

# ===================
# MONITORING STACK
# ===================

echo "📊 Creating Monitoring Stack..."

# Prometheus configuration
mkdir -p monitoring/prometheus
cat > monitoring/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'social-app-backend'
    static_configs:
      - targets: ['host.docker.internal:3001']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
EOF

# Alert rules
cat > monitoring/prometheus/alert_rules.yml << 'EOF'
groups:
  - name: social_app_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }}s"

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "{{ $labels.job }} has been down for more than 1 minute"
EOF

# AlertManager configuration
mkdir -p monitoring/alertmanager
cat > monitoring/alertmanager/alertmanager.yml << 'EOF'
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alertmanager@example.org'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
- name: 'web.hook'
  webhook_configs:
  - url: 'http://127.0.0.1:5001/'
EOF

# Monitoring docker-compose.yml
cat > monitoring/docker-compose.yml << 'EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    extra_hosts:
      - "host.docker.internal:host-gateway"

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3002:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus

  alertmanager:
    image: prom/alertmanager:latest
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager:/etc/alertmanager

  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'

volumes:
  prometheus_data:
  grafana_data:
EOF

# ===================
# UTILITY SCRIPTS
# ===================

echo "🛠️ Creating utility scripts..."

mkdir -p scripts

# Health check script
cat > scripts/health-check.js << 'EOF'
const axios = require('axios');

const services = [
  { name: 'Frontend', url: 'http://localhost:3000' },
  { name: 'Backend', url: 'http://localhost:3001/health' },
  { name: 'Prometheus', url: 'http://localhost:9090/-/healthy' },
  { name: 'Grafana', url: 'http://localhost:3002/api/health' },
  { name: 'AlertManager', url: 'http://localhost:9093/-/healthy' }
];

async function checkHealth() {
  console.log('🏥 Health Check Results:');
  console.log('========================');
  
  for (const service of services) {
    try {
      const response = await axios.get(service.url, { timeout: 5000 });
      console.log(`✅ ${service.name}: Healthy (${response.status})`);
    } catch (error) {
      console.log(`❌ ${service.name}: Unhealthy (${error.message})`);
    }
  }
}

checkHealth();
EOF

# Start script
cat > scripts/start-all.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting DevOps Social App..."

# Start application stack
echo "📱 Starting application stack..."
cd app && docker-compose up -d

# Wait a bit for app to start
sleep 10

# Start monitoring stack
echo "📊 Starting monitoring stack..."
cd ../monitoring && docker-compose up -d

echo ""
echo "✅ All services started!"
echo ""
echo "🌐 Access points:"
echo "  Frontend:    http://localhost:3000"
echo "  Backend API: http://localhost:3001"
echo "  Grafana:     http://localhost:3002 (admin/admin)"
echo "  Prometheus:  http://localhost:9090"
echo "  AlertManager: http://localhost:9093"
echo ""
echo "🔍 Check status with: npm run health-check"
EOF

chmod +x scripts/start-all.sh

# Stop script
cat > scripts/stop-all.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping all services..."

cd app && docker-compose down
cd ../monitoring && docker-compose down

echo "✅ All services stopped!"
EOF

chmod +x scripts/stop-all.sh

echo ""
echo "✅ Complete application setup created!"
echo ""
echo "🚀 To start everything:"
echo "  cd app && docker-compose up -d"
echo "  cd ../monitoring && docker-compose up -d"
echo ""
echo "Or use the utility script:"
echo "  ./scripts/start-all.sh"