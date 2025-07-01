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
