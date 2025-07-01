import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🐦 SocialClone - DevOps Demo</h1>
      <p>Welcome to the DevOps Social App!</p>
      
      {loading ? (
        <p>Loading posts...</p>
      ) : (
        <div>
          <h2>Recent Posts</h2>
          {posts.map(post => (
            <div key={post.id} style={{ 
              border: '1px solid #ccc', 
              padding: '10px', 
              margin: '10px 0',
              borderRadius: '5px'
            }}>
              <strong>@{post.author}</strong>
              <p>{post.content}</p>
              <small>{new Date(post.created_at).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
      
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f5f5f5' }}>
        <h3>🚀 DevOps Features Active:</h3>
        <ul>
          <li>✅ Docker containerization</li>
          <li>✅ GitHub Actions CI/CD</li>
          <li>✅ Slack notifications</li>
          <li>✅ Jira integration</li>
          <li>✅ Prometheus monitoring</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
