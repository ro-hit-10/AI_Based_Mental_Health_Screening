import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Blogs.css';

const Blogs = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'depression', name: 'Depression' },
    { id: 'anxiety', name: 'Anxiety' },
    { id: 'stress', name: 'Stress' },
    { id: 'wellness', name: 'Wellness' }
  ];

  const blogs = [
    {
      id: 1,
      title: 'Understanding Depression: Signs and Symptoms',
      author: 'Dr. Sarah Johnson',
      date: 'March 15, 2024',
      category: 'depression',
      image: 'https://images.unsplash.com/photo-1541199249251-f7136145449c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      excerpt: 'Learn about the common signs and symptoms of depression, and how to recognize them in yourself and others.'
    },
    {
      id: 2,
      title: 'Managing Anxiety in Daily Life',
      author: 'Dr. Michael Chen',
      date: 'March 12, 2024',
      category: 'anxiety',
      image: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      excerpt: 'Practical tips and techniques for managing anxiety in your daily life and maintaining mental well-being.'
    },
    {
      id: 3,
      title: 'Stress Management Strategies',
      author: 'Dr. Emily Rodriguez',
      date: 'March 10, 2024',
      category: 'stress',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      excerpt: 'Effective strategies for managing stress and maintaining a healthy work-life balance.'
    },
    {
      id: 4,
      title: 'The Importance of Mental Wellness',
      author: 'Dr. James Wilson',
      date: 'March 8, 2024',
      category: 'wellness',
      image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      excerpt: 'Understanding the importance of mental wellness and how to maintain it in today\'s fast-paced world.'
    }
  ];

  const filteredBlogs = selectedCategory === 'all'
    ? blogs
    : blogs.filter(blog => blog.category === selectedCategory);

  return (
    <motion.div 
      className="blogs-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="blogs-header">
        <h1>Mental Health Blogs</h1>
        <p>Explore our collection of informative articles on mental health and wellness</p>
      </div>

      <div className="categories">
        {categories.map(category => (
          <motion.button
            key={category.id}
            className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </motion.button>
        ))}
      </div>

      <div className="blogs-grid">
        {filteredBlogs.map(blog => (
          <motion.div
            key={blog.id}
            className="blog-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5 }}
          >
            <div className="blog-image">
              <img src={blog.image} alt={blog.title} />
            </div>
            <div className="blog-info">
              <div className="blog-meta">
                <span className="author">{blog.author}</span>
                <span className="date">{blog.date}</span>
              </div>
              <h3>{blog.title}</h3>
              <p className="excerpt">{blog.excerpt}</p>
              <motion.button
                className="read-more-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Read More
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Blogs; 