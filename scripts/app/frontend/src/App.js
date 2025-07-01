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
