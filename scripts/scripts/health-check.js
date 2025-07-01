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
