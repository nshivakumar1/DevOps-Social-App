#!/bin/bash

echo "🚀 Setting up DevOps Social App..."

# Create directory structure
mkdir -p app/{frontend,backend}
mkdir -p monitoring/{prometheus,grafana,alertmanager}
mkdir -p integrations
mkdir -p .github/workflows

# Install dependencies
echo "📦 Installing Node.js dependencies..."
cd app/backend && npm install
cd ../frontend && npm install
cd ../..

# Set up environment variables
echo "⚙️ Setting up environment variables..."
cat > .env << EOF
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/socialapp

# Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Jira Integration
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@domain.com
JIRA_API_TOKEN=your-jira-api-token

# Application
NODE_ENV=development
PORT=3001
EOF

echo "🐳 Starting services with Docker Compose..."
docker-compose -f app/docker-compose.yml up -d
docker-compose -f monitoring/docker-compose.yml up -d

echo "✅ Setup complete!"
echo ""
echo "🌐 Access your services:"
echo "  App Frontend: http://localhost:3000"
echo "  App Backend: http://localhost:3001"
echo "  Prometheus: http://localhost:9090"
echo "  Grafana: http://localhost:3002 (admin/admin)"
echo "  AlertManager: http://localhost:9093"
echo ""
echo "📚 Next steps:"
echo "  1. Configure Slack webhook URL in .env"
echo "  2. Set up Jira API token in .env"
echo "  3. Import Grafana dashboard"
echo "  4. Set up GitHub secrets for CI/CD"