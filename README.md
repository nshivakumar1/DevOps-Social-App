# 🚀 DevOps Social App - Complete Monitoring & Integration Stack

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Slack](https://img.shields.io/badge/Slack-Integrated-purple.svg)](https://slack.com/)

A comprehensive DevOps demonstration project featuring a **Twitter-like social media application** with complete **monitoring stack**, **intelligent alerting**, and **enterprise integrations**. Perfect for learning modern DevOps practices and showcasing technical skills.

## 🎯 **Project Overview**

This project demonstrates real-world DevOps implementation with:
- **Full-stack social media app** (React + Node.js + PostgreSQL)
- **Production-grade monitoring** (Prometheus + Grafana + AlertManager)
- **Enterprise integrations** (Slack notifications + Jira ticketing)
- **CI/CD pipeline** (GitHub Actions)
- **Containerization** (Docker + Docker Compose)
- **Infrastructure as Code** approach

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │◄──►│   Node.js API    │◄──►│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)      │    │   (Database)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │     Monitoring Stack     │
                    │  Prometheus │ Grafana   │
                    │ AlertManager│ Exporters │
                    └─────────────────────────┘
                                 │
               ┌─────────────────┼─────────────────┐
               │                 │                 │
    ┌──────────▼──────────┐     │     ┌──────────▼───────────┐
    │   Slack Channel     │     │     │   Jira Project      │
    │   📱 Notifications  │     │     │   🎫 Issue Tracking │
    └─────────────────────┘     │     └─────────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │   GitHub Actions      │
                    │   🔄 CI/CD Pipeline   │
                    └───────────────────────┘
```

## ✨ **Key Features**

### 🎬 **Social Media Application**
- **Real-time posting** with instant feed updates
- **User authentication** and profile management
- **RESTful API** with comprehensive endpoints
- **Responsive design** for all devices
- **PostgreSQL integration** with proper schema

### 📊 **Monitoring & Observability**
- **Custom metrics collection** with Prometheus
- **Beautiful dashboards** in Grafana
- **Real-time alerts** with AlertManager
- **Performance tracking** (response times, error rates)
- **System health monitoring** (CPU, memory, disk)
- **Application-specific metrics** (user activity, API calls)

### 🔔 **Smart Integrations**
- **Slack notifications** for deployments and alerts
- **Jira integration** for automated issue creation
- **Rich message formatting** with buttons and attachments
- **Configurable alert severity** levels
- **Custom notification templates**

### 🔄 **DevOps Pipeline**
- **Automated testing** on every pull request
- **Docker image building** and optimization
- **Multi-environment deployment** (staging → production)
- **Health checks** and rollback capabilities
- **Secrets management** with GitHub Actions

## 🚀 **Quick Start**

### Prerequisites
- **Node.js** 18+ and npm
- **Docker** and Docker Compose
- **Git** for version control
- **Slack workspace** (for notifications)

### 1. Clone & Setup
```bash
git clone https://github.com/nshivakumar1/DevOps-Social-App.git
cd DevOps-Social-App
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your actual values:
# - Slack webhook URL
# - Jira credentials (optional)
# - Database settings
```

### 3. Start Services
```bash
# Start application stack
docker-compose -f app/docker-compose.yml up -d

# Start monitoring stack  
docker-compose -f monitoring/docker-compose.yml up -d
```

### 4. Verify Installation
```bash
# Test Slack integration
npm run test-slack

# Check all services
docker-compose ps
```

## 🌐 **Access Points**

| Service | URL | Credentials |
|---------|-----|-------------|
| 🎬 **Social App** | http://localhost:3000 | - |
| 🔌 **API Docs** | http://localhost:3001/health | - |
| 📊 **Grafana** | http://localhost:3002 | admin / admin |
| 🔍 **Prometheus** | http://localhost:9090 | - |
| 🚨 **AlertManager** | http://localhost:9093 | - |
| 🗄️ **Database** | localhost:5432 | user / password |

## 📱 **Slack Integration Setup**

### 1. Create Slack App
```bash
# Visit: https://api.slack.com/apps
# → Create New App → From scratch
# → Name: "DevOps Monitor"
# → Select your workspace
```

### 2. Configure Webhooks
```bash
# In your Slack app:
# → Incoming Webhooks → Toggle ON
# → Add New Webhook to Workspace
# → Select #devops-alerts channel
# → Copy webhook URL
```

### 3. Update Configuration
```bash
# Add to .env file:
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../...
```

### 4. Test Integration
```bash
# Quick test
node test-slack.js quick

# Full test suite
node test-slack.js
```

## 🎫 **Jira Integration** (Optional)

### Setup Steps
1. **Generate API Token**: Jira Settings → Security → API tokens
2. **Update .env**:
   ```bash
   JIRA_BASE_URL=https://your-company.atlassian.net
   JIRA_EMAIL=your-email@company.com
   JIRA_API_TOKEN=your_token_here
   ```
3. **Test**: Integration will auto-create issues for critical alerts

## 📊 **Monitoring Dashboards**

### Pre-configured Grafana Dashboards
- **📈 Application Metrics**: Request rates, response times, error rates
- **🖥️ System Resources**: CPU, memory, disk usage
- **🗄️ Database Performance**: Connection pools, query performance
- **🌐 Network Monitoring**: Traffic analysis, endpoint health
- **👥 User Analytics**: Active users, engagement metrics

### Key Metrics Tracked
```javascript
// Application Metrics
http_request_duration_seconds    // Response time histogram
http_requests_total             // Request counter by method/status
database_connections_active     // Active DB connections
user_registrations_total        // New user signups
posts_created_total            // Social media activity

// Infrastructure Metrics  
node_cpu_seconds_total         // CPU usage
node_memory_MemAvailable_bytes // Available memory
node_filesystem_free_bytes     // Disk space
```

## 🚨 **Alerting Rules**

### Critical Alerts
- **🔴 Service Down**: Any service unavailable > 1 minute
- **🔴 High Error Rate**: 5xx errors > 10% for 2 minutes
- **🔴 Database Issues**: Connection failures or high latency
- **🔴 Disk Space**: < 10% free space remaining

### Warning Alerts
- **🟡 High Response Time**: 95th percentile > 2 seconds
- **🟡 Memory Usage**: > 85% for 5 minutes
- **🟡 CPU Usage**: > 80% for 10 minutes
- **🟡 SSL Certificate**: Expires within 30 days

## 🔄 **CI/CD Pipeline**

### GitHub Actions Workflow
```yaml
Triggers: Push to main, Pull Request
├── 🧪 Test Suite
│   ├── Unit Tests (Backend)
│   ├── Integration Tests (API)
│   └── Frontend Tests (React)
├── 🏗️ Build
│   ├── Docker Images
│   ├── Security Scanning
│   └── Artifact Storage
├── 🚀 Deploy
│   ├── Staging Environment
│   ├── Health Checks
│   ├── Smoke Tests
│   └── Production (manual approval)
└── 📱 Notifications
    ├── Slack Updates
    ├── Jira Comments
    └── Status Reports
```

### Deployment Strategy
- **Blue-Green Deployment** for zero downtime
- **Automated rollback** on health check failures
- **Feature flags** for gradual rollouts
- **Database migrations** with safety checks

## 📂 **Project Structure**

```
DevOps-Social-App/
├── 📱 app/                     # Main application
│   ├── frontend/              # React.js frontend
│   │   ├── src/
│   │   ├── public/
│   │   └── Dockerfile
│   ├── backend/               # Node.js API
│   │   ├── src/
│   │   ├── tests/
│   │   └── Dockerfile
│   ├── database/              # PostgreSQL setup
│   └── docker-compose.yml
├── 📊 monitoring/             # Monitoring stack
│   ├── prometheus/           # Metrics collection
│   │   ├── prometheus.yml
│   │   └── alert_rules.yml
│   ├── grafana/              # Visualization
│   │   ├── dashboards/
│   │   └── datasources/
│   ├── alertmanager/         # Alert routing
│   └── docker-compose.yml
├── 🔗 integrations/          # External integrations
│   ├── slack-webhook.js      # Slack notifications
│   ├── jira-integration.js   # Jira API client
│   └── enhanced-slack.js     # Rich notifications
├── 🔄 .github/               # CI/CD pipeline
│   └── workflows/
│       ├── deploy.yml        # Main pipeline
│       ├── test.yml          # Testing workflow
│       └── security.yml     # Security scans
├── 🛠️ scripts/               # Utility scripts
│   ├── setup.sh             # Initial setup
│   ├── health-check.js      # Status monitoring
│   └── backup.sh            # Database backup
├── 📋 docs/                  # Documentation
│   ├── setup/               # Setup guides
│   ├── monitoring/          # Monitoring docs
│   └── api/                 # API documentation
├── 🧪 tests/                 # Test suites
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── e2e/                 # End-to-end tests
├── 📝 .env.example           # Environment template
├── 🚫 .gitignore            # Git ignore rules
├── 📄 README.md             # This file
├── 📦 package.json          # Dependencies
└── 🐳 docker-compose.yml    # Full stack setup
```

## 🛠️ **Development**

### Running Locally
```bash
# Install dependencies
npm install

# Start development servers
npm run dev:frontend    # React dev server
npm run dev:backend     # Node.js with nodemon
npm run dev:monitoring  # Start monitoring stack

# Run tests
npm test               # All tests
npm run test:unit      # Unit tests only
npm run test:integration # Integration tests
```

### Adding New Features
```bash
# Create feature branch
git checkout -b feature/new-monitoring-dashboard

# Make changes and test
npm test
npm run test-slack

# Commit and push
git commit -m "✨ Add user engagement dashboard"
git push origin feature/new-monitoring-dashboard
```

## 🧪 **Testing**

### Test Suites Available
```bash
# Slack integration tests
npm run test-slack              # Full test suite
node test-slack.js quick        # Quick validation
node test-slack.js errors       # Error scenarios

# Application tests
npm run test:backend            # API tests
npm run test:frontend           # React component tests
npm run test:integration        # Full stack tests

# Infrastructure tests
npm run test:monitoring         # Prometheus metrics
npm run test:health            # Service health checks
```

### Load Testing
```bash
# Install k6 (optional)
brew install k6

# Run load tests
k6 run tests/load/api-load-test.js
k6 run tests/load/frontend-load-test.js
```

## 🔒 **Security Features**

- **🔐 Environment Variables**: Sensitive data in `.env` (not committed)
- **🔑 GitHub Secrets**: CI/CD credentials stored securely
- **🛡️ Input Validation**: SQL injection and XSS protection
- **🔒 HTTPS Enforcement**: SSL/TLS in production
- **👤 Authentication**: JWT-based user sessions
- **📊 Security Monitoring**: Failed login attempt tracking

## 🚀 **Production Deployment**

### Cloud Platform Support
- **☁️ AWS**: ECS, EKS, or EC2 deployment
- **🔵 Azure**: Container Instances or AKS
- **🟢 Google Cloud**: Cloud Run or GKE
- **🟦 DigitalOcean**: App Platform or Droplets

### Production Checklist
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backups automated
- [ ] Monitoring alerts configured
- [ ] Log aggregation setup (ELK/EFK stack)
- [ ] CDN configured for static assets
- [ ] Load balancer configured
- [ ] Auto-scaling rules defined

## 📈 **Performance Metrics**

### Benchmarks
- **⚡ API Response Time**: < 200ms (95th percentile)
- **🚀 Frontend Load Time**: < 2 seconds
- **📊 Database Queries**: < 100ms average
- **🔄 Deployment Time**: < 5 minutes
- **📱 Slack Notifications**: < 1 second

### Monitoring SLAs
- **🎯 Uptime**: 99.9% availability target
- **📊 Error Rate**: < 0.1% for critical paths
- **⚡ Response Time**: 95% of requests < 1 second
- **📱 Alert Response**: Critical alerts within 30 seconds

## 🤝 **Contributing**

### Getting Started
1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch
4. **Make** your changes
5. **Test** thoroughly
6. **Submit** a pull request

### Development Guidelines
- **📝 Commit Messages**: Use conventional commits (feat:, fix:, docs:)
- **🧪 Testing**: Add tests for new features
- **📚 Documentation**: Update docs for API changes
- **🎨 Code Style**: Follow ESLint configuration
- **🔒 Security**: Never commit secrets or credentials

### Code Review Process
- **✅ Automated Tests**: Must pass all CI checks
- **👥 Peer Review**: At least one approval required
- **🧪 Manual Testing**: Test in staging environment
- **📱 Integration Tests**: Verify Slack/Jira integrations work

## 🌟 **Roadmap**

### 🚧 In Progress
- [ ] **Kubernetes deployment** manifests
- [ ] **Advanced alerting** with PagerDuty integration
- [ ] **Log aggregation** with ELK stack
- [ ] **A/B testing** framework

### 🔮 Planned Features
- [ ] **Multi-tenant** architecture support
- [ ] **Real-time chat** with WebSocket
- [ ] **Mobile app** (React Native)
- [ ] **Machine learning** for content recommendations
- [ ] **Advanced analytics** dashboard
- [ ] **Chaos engineering** testing

### 💡 Ideas & Suggestions
- **Infrastructure as Code** with Terraform
- **Service mesh** with Istio
- **Progressive Web App** features
- **Internationalization** (i18n)
- **Accessibility** improvements (a11y)

## 📚 **Resources & Learning**

### Helpful Links
- **📖 [Prometheus Documentation](https://prometheus.io/docs/)**
- **📊 [Grafana Tutorials](https://grafana.com/tutorials/)**
- **🐳 [Docker Best Practices](https://docs.docker.com/develop/best-practices/)**
- **🔄 [GitHub Actions Guide](https://docs.github.com/en/actions)**
- **📱 [Slack API Documentation](https://api.slack.com/)**

### Learning Path
1. **Start**: Set up the basic application
2. **Monitor**: Add Prometheus metrics and Grafana dashboards
3. **Alert**: Configure AlertManager and Slack notifications
4. **Automate**: Set up GitHub Actions CI/CD
5. **Scale**: Deploy to cloud platform
6. **Optimize**: Performance tuning and advanced monitoring

## 🆘 **Troubleshooting**

### Common Issues

#### 🔴 Slack Notifications Not Working
```bash
# Check webhook URL
echo $SLACK_WEBHOOK_URL

# Test webhook directly
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test message"}' \
  $SLACK_WEBHOOK_URL

# Debug with verbose logging
SLACK_DEBUG=true node test-slack.js
```

#### 🔴 Grafana Dashboard Not Loading
```bash
# Check Prometheus connectivity
curl http://localhost:9090/api/v1/targets

# Verify data source in Grafana
# Go to Configuration → Data Sources → Test

# Check container logs
docker-compose logs grafana
```

#### 🔴 High Memory Usage
```bash
# Check container resource usage
docker stats

# Scale down non-essential services
docker-compose down alertmanager

# Monitor Node.js memory leaks
node --inspect app/backend/server.js
```

### Getting Help
- **🐛 Bug Reports**: Create a GitHub issue with detailed reproduction steps
- **💬 Questions**: Use GitHub Discussions for general questions
- **🚀 Feature Requests**: Submit enhancement issues with use cases
- **📧 Contact**: Reach out via GitHub profile for urgent issues

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Nakul Shivakumar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 🙏 **Acknowledgments**

- **Prometheus** community for excellent monitoring tools
- **Grafana** team for beautiful visualization platform
- **Slack** for robust webhook API
- **Docker** for containerization technology
- **React** and **Node.js** communities
- **Open source contributors** who make projects like this possible

## 📊 **Project Stats**

![GitHub stars](https://img.shields.io/github/stars/nshivakumar1/DevOps-Social-App?style=social)
![GitHub forks](https://img.shields.io/github/forks/nshivakumar1/DevOps-Social-App?style=social)
![GitHub issues](https://img.shields.io/github/issues/nshivakumar1/DevOps-Social-App)
![GitHub pull requests](https://img.shields.io/github/issues-pr/nshivakumar1/DevOps-Social-App)

---

<div align="center">

**Built with ❤️ for learning and demonstrating modern DevOps practices**

[⭐ Star this repo](https://github.com/nshivakumar1/DevOps-Social-App) • [🐛 Report Bug](https://github.com/nshivakumar1/DevOps-Social-App/issues) • [💡 Request Feature](https://github.com/nshivakumar1/DevOps-Social-App/issues)

**Happy coding! 🚀**

</div>