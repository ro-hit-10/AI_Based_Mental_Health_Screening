// frontend/src/components/Blogs.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../pages/Dashboard.css'; // Use dashboard styling

const blogs = [
  {
    id: 1,
    title: '5 Coping Strategies for Anxiety',
    summary: 'Learn effective ways to manage anxiety naturally through proven techniques.',
    category: 'Anxiety',
    readTime: '5 min read',
    author: 'Dr. Sarah Johnson',
    icon: '🧘',
    color: '#FF6B6B',
    link: 'https://psychcentral.com/anxiety/coping-strategies',
  },
  {
    id: 2,
    title: 'Mental Health and Mindfulness',
    summary: 'How mindfulness practices can significantly improve your mental well-being.',
    category: 'Mindfulness',
    readTime: '8 min read',
    author: 'Dr. Michael Chen',
    icon: '🧠',
    color: '#6C5CE7',
    link: 'https://www.mindful.org/meditation/mindfulness-getting-started/',
  },
  {
    id: 3,
    title: 'The Science of Gratitude',
    summary: 'Explore how gratitude practices can reduce depression and boost happiness.',
    category: 'Depression',
    readTime: '6 min read',
    author: 'Dr. Emily Rodriguez',
    icon: '💝',
    color: '#4ECDC4',
    link: 'https://greatergood.berkeley.edu/topic/gratitude/definition',
  },
  {
    id: 4,
    title: 'Sleep and Mental Health',
    summary: 'Understanding the crucial connection between quality sleep and mental wellness.',
    category: 'Sleep',
    readTime: '7 min read',
    author: 'Dr. James Wilson',
    icon: '😴',
    color: '#FFD93D',
    link: 'https://www.sleepfoundation.org/how-sleep-works/why-do-we-need-sleep',
  },
  {
    id: 5,
    title: 'Building Resilience in Difficult Times',
    summary: 'Practical strategies to develop emotional resilience and bounce back from setbacks.',
    category: 'Resilience',
    readTime: '9 min read',
    author: 'Dr. Lisa Park',
    icon: '💪',
    color: '#A8E6CF',
    link: 'https://www.apa.org/topics/resilience',
  },
  {
    id: 6,
    title: 'The Power of Social Connections',
    summary: 'How maintaining strong relationships impacts your mental health and overall well-being.',
    category: 'Relationships',
    readTime: '6 min read',
    author: 'Dr. Robert Kim',
    icon: '🤝',
    color: '#FF9A8B',
    link: 'https://www.health.harvard.edu/newsletter_article/the-health-benefits-of-strong-relationships',
  },
  {
    id: 7,
    title: 'Managing Work-Life Balance',
    summary: 'Essential tips for maintaining mental health while juggling professional and personal life.',
    category: 'Stress',
    readTime: '8 min read',
    author: 'Dr. Amanda Taylor',
    icon: '⚖️',
    color: '#D4A5FF',
    link: 'https://www.mayoclinic.org/healthy-lifestyle/adult-health/in-depth/work-life-balance/art-20048134',
  },
  {
    id: 8,
    title: 'Nutrition for Mental Wellness',
    summary: 'Discover how your diet directly affects your mood, energy, and mental clarity.',
    category: 'Nutrition',
    readTime: '10 min read',
    author: 'Dr. Maria Gonzalez',
    icon: '🥗',
    color: '#87CEEB',
    link: 'https://www.harvard.edu/blog/nutritional-psychiatry-your-brain-on-food-201511168626',
  },
  {
    id: 9,
    title: 'Understanding Panic Attacks',
    summary: 'Learn to recognize, understand, and effectively manage panic attacks when they occur.',
    category: 'Anxiety',
    readTime: '7 min read',
    author: 'Dr. David Lee',
    icon: '🆘',
    color: '#FFA07A',
    link: 'https://www.nimh.nih.gov/health/topics/panic-disorder',
  }
];

const Blogs = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics', icon: '📚' },
    { id: 'Anxiety', name: 'Anxiety', icon: '😰' },
    { id: 'Depression', name: 'Depression', icon: '😔' },
    { id: 'Mindfulness', name: 'Mindfulness', icon: '🧘' },
    { id: 'Sleep', name: 'Sleep', icon: '😴' },
    { id: 'Stress', name: 'Stress', icon: '😤' },
    { id: 'Nutrition', name: 'Nutrition', icon: '🥗' }
  ];

  const filteredBlogs = selectedCategory === 'all' 
    ? blogs 
    : blogs.filter(blog => blog.category === selectedCategory);

  return (
    <motion.div
      className="dashboard-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="dashboard-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1>📰 Mental Health Blog Library</h1>
        <p>Discover expert insights, practical tips, and evidence-based advice for mental wellness</p>
      </motion.div>

      {/* Category Filters */}
      <motion.div 
        className="dashboard-stats"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
          <h3>🏷️ Filter by Category</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '25px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  background: selectedCategory === category.id 
                    ? 'linear-gradient(45deg, #00b4d8, #0077b6)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>{category.icon}</span> {category.name}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Blog Statistics */}
      <motion.div 
        className="dashboard-stats"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="stat-card">
          <div className="feature-icon">📖</div>
          <h3>Total Articles</h3>
          <p className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
            {blogs.length}
          </p>
          <p style={{ fontSize: '0.9rem' }}>Expert-reviewed content</p>
        </div>
        
        <div className="stat-card">
          <div className="feature-icon">🔍</div>
          <h3>Showing</h3>
          <p className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
            {filteredBlogs.length}
          </p>
          <p style={{ fontSize: '0.9rem' }}>{selectedCategory === 'all' ? 'All categories' : selectedCategory + ' articles'}</p>
        </div>
        
        <div className="stat-card">
          <div className="feature-icon">⏱️</div>
          <h3>Average Read Time</h3>
          <p className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
            7<span style={{ fontSize: '1.5rem' }}>min</span>
          </p>
          <p style={{ fontSize: '0.9rem' }}>Quick, valuable insights</p>
        </div>
      </motion.div>

      {/* Blog Grid */}
      <motion.div 
        className="features-grid"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {filteredBlogs.map((blog, index) => (
          <motion.div
            key={blog.id}
            className="feature-card"
            whileHover={{ scale: 1.03, y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            style={{ cursor: 'pointer' }}
            onClick={() => window.open(blog.link, '_blank', 'noopener,noreferrer')}
          >
            {/* Blog Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              background: blog.color,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              marginBottom: '1.5rem',
              margin: '0 auto 1.5rem auto',
              boxShadow: `0 8px 32px ${blog.color}30`
            }}>
              {blog.icon}
            </div>
            
            {/* Category Tag */}
            <div style={{
              background: blog.color + '20',
              color: blog.color,
              padding: '0.25rem 0.75rem',
              borderRadius: '15px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              width: 'fit-content',
              margin: '0 auto 1rem auto'
            }}>
              {blog.category}
            </div>
            
            <h3 style={{ 
              fontSize: '1.3rem', 
              marginBottom: '1rem',
              lineHeight: '1.4'
            }}>
              {blog.title}
            </h3>
            
            <p style={{ 
              fontSize: '0.95rem',
              color: '#e0e0e0',
              marginBottom: '1.5rem',
              lineHeight: '1.5',
              textAlign: 'center'
            }}>
              {blog.summary}
            </p>
            
            {/* Blog Meta */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              color: '#b0b0b0'
            }}>
              <span>👨‍⚕️ {blog.author}</span>
              <span>📖 {blog.readTime}</span>
            </div>
            
            {/* Read Button */}
            <motion.button
              className="feature-button"
              style={{ 
                width: '100%',
                background: `linear-gradient(45deg, ${blog.color}, ${blog.color}CC)`,
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                window.open(blog.link, '_blank', 'noopener,noreferrer');
              }}
            >
              📖 Read Article
            </motion.button>
          </motion.div>
        ))}
      </motion.div>

      {filteredBlogs.length === 0 && (
        <motion.div 
          className="features-grid"
          style={{ gridTemplateColumns: '1fr' }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div className="feature-card">
            <div className="feature-icon" style={{ fontSize: '3rem' }}>🔍</div>
            <h3>No Articles Found</h3>
            <p>No articles found for the selected category. Try selecting a different category.</p>
          </motion.div>
        </motion.div>
      )}

      {/* Back to Dashboard Button */}
      <motion.div 
        className="dashboard-stats"
        style={{ marginTop: '3rem' }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <motion.button
          className="feature-button"
          style={{ width: '100%', padding: '1.2rem 2rem' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
        >
          ← Back to Dashboard
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Blogs;
