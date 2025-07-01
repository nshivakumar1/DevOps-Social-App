CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO posts (content, author) VALUES 
('Welcome to SocialClone! 🎉', 'system'),
('This is a demo DevOps project', 'admin'),
('Monitoring and integrations are working!', 'devops');