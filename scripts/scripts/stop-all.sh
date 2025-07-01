#!/bin/bash

echo "🛑 Stopping all services..."

cd app && docker-compose down
cd ../monitoring && docker-compose down

echo "✅ All services stopped!"
