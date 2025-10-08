import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../pages/Dashboard.css'; // Use dashboard styling

// Sample local videos - you can replace these with your actual video files
const videos = [
  {
    id: 1,
    title: 'Morning Stress Relief Yoga',
    description: 'Start your day with gentle movements to reduce stress and anxiety',
    duration: '15 min',
    difficulty: 'Beginner',
    category: 'Morning',
    thumbnail: '/api/placeholder/300/200', // You can add actual thumbnails
    videoPath: '/videos/morning-yoga.mp4', // Path to your local video
    benefits: ['Stress Relief', 'Improved Focus', 'Better Mood']
  },
  {
    id: 2,
    title: 'Deep Relaxation Yoga Nidra',
    description: 'Guided meditation and relaxation for deep mental peace',
    duration: '20 min',
    difficulty: 'All Levels',
    category: 'Evening',
    thumbnail: '/api/placeholder/300/200',
    videoPath: '/videos/yoga-nidra.mp4',
    benefits: ['Deep Relaxation', 'Better Sleep', 'Mental Clarity']
  },
  {
    id: 3,
    title: 'Anxiety Release Flow',
    description: 'Flowing sequences designed to calm anxiety and nervous tension',
    duration: '18 min',
    difficulty: 'Intermediate',
    category: 'Therapeutic',
    thumbnail: '/api/placeholder/300/200',
    videoPath: '/videos/anxiety-relief.mp4',
    benefits: ['Anxiety Relief', 'Emotional Balance', 'Inner Peace']
  },
  {
    id: 4,
    title: 'Mindful Breathing Practice',
    description: 'Simple breathing exercises for instant calm and centeredness',
    duration: '10 min',
    difficulty: 'Beginner',
    category: 'Breathing',
    thumbnail: '/api/placeholder/300/200',
    videoPath: '/videos/breathing-practice.mp4',
    benefits: ['Stress Reduction', 'Mental Clarity', 'Emotional Balance']
  },
  {
    id: 5,
    title: 'Restorative Evening Yoga',
    description: 'Gentle poses to unwind and prepare for restful sleep',
    duration: '25 min',
    difficulty: 'Beginner',
    category: 'Evening',
    thumbnail: '/api/placeholder/300/200',
    videoPath: '/videos/evening-yoga.mp4',
    benefits: ['Better Sleep', 'Muscle Relaxation', 'Stress Relief']
  },
  {
    id: 6,
    title: 'Chair Yoga for Office Workers',
    description: 'Quick exercises you can do at your desk to reduce work stress',
    duration: '12 min',
    difficulty: 'Beginner',
    category: 'Workplace',
    thumbnail: '/api/placeholder/300/200',
    videoPath: '/videos/chair-yoga.mp4',
    benefits: ['Work Stress Relief', 'Better Posture', 'Increased Energy']
  }
];

const categories = ['All', 'Morning', 'Evening', 'Therapeutic', 'Breathing', 'Workplace'];
const difficulties = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

const YogaVideos = () => {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDifficulty, setActiveDifficulty] = useState('All Levels');

  const filteredVideos = videos.filter(video => {
    const categoryMatch = activeCategory === 'All' || video.category === activeCategory;
    const difficultyMatch = activeDifficulty === 'All Levels' || video.difficulty === activeDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return '#4ECDC4';
      case 'Intermediate': return '#FFD93D';
      case 'Advanced': return '#FF6B6B';
      default: return '#6C5CE7';
    }
  };

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
        <h1>🧘‍♀️ Yoga Videos for Mental Wellness</h1>
        <p>Practice mindful movements and breathing exercises designed to reduce stress and improve mental health</p>
      </motion.div>

      {/* Filter Controls */}
      <motion.div 
        className="dashboard-stats"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="stat-card">
          <h3>📊 Category</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  background: activeCategory === category ? '#00b4d8' : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  transition: 'all 0.3s ease'
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        <div className="stat-card">
          <h3>🎯 Difficulty</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            {difficulties.map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setActiveDifficulty(difficulty)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  background: activeDifficulty === difficulty ? '#00b4d8' : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  transition: 'all 0.3s ease'
                }}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="feature-icon">📊</div>
          <h3>Total Videos</h3>
          <p className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {filteredVideos.length}
          </p>
          <p style={{ fontSize: '0.9rem' }}>Available sessions</p>
        </div>
      </motion.div>

      {/* Video Grid */}
      <motion.div 
        className="features-grid"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {filteredVideos.map((video, index) => (
          <motion.div
            key={video.id}
            className="feature-card"
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            onClick={() => setSelectedVideo(video)}
            style={{ cursor: 'pointer' }}
          >
            {/* Video Thumbnail */}
            <div style={{
              width: '100%',
              height: '150px',
              background: 'linear-gradient(45deg, #A8E6CF, #88D8B0)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                fontSize: '3rem',
                opacity: 0.8
              }}>▶️</div>
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '5px',
                fontSize: '0.8rem'
              }}>
                {video.duration}
              </div>
            </div>
            
            <div className="feature-icon" style={{ fontSize: '2rem' }}>🧘‍♀️</div>
            <h3>{video.title}</h3>
            <p style={{ 
              textAlign: 'left', 
              fontSize: '0.9rem',
              color: '#e0e0e0',
              marginBottom: '1rem',
              lineHeight: '1.4'
            }}>
              {video.description}
            </p>
            
            {/* Difficulty Badge */}
            <div style={{
              display: 'inline-block',
              background: getDifficultyColor(video.difficulty),
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '15px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              {video.difficulty}
            </div>
            
            {/* Benefits */}
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: '#b0b0b0', marginBottom: '0.5rem' }}>Benefits:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                {video.benefits.map((benefit, i) => (
                  <span key={i} style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '10px',
                    fontSize: '0.7rem',
                    color: '#a0a0a0'
                  }}>
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

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

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            className="feature-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              className="feature-modal"
              style={{ maxWidth: '90%', width: '800px', maxHeight: '90vh', overflow: 'auto' }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>{selectedVideo.title}</h2>
              <p style={{ marginBottom: '1rem' }}>{selectedVideo.description}</p>
              
              {/* Video Player */}
              <div style={{
                width: '100%',
                height: '300px',
                background: 'linear-gradient(45deg, #1a1a2e, #16213e)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                border: '2px dashed rgba(255, 255, 255, 0.3)'
              }}>
                <div style={{ textAlign: 'center', color: '#e0e0e0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📹</div>
                  <p>Video Player</p>
                  <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                    Path: {selectedVideo.videoPath}
                  </p>
                  <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.5rem' }}>
                    Place your video files in the public/videos folder
                  </p>
                </div>
              </div>
              
              {/* Video Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <strong>Duration:</strong> {selectedVideo.duration}
                </div>
                <div>
                  <strong>Difficulty:</strong> 
                  <span style={{ 
                    color: getDifficultyColor(selectedVideo.difficulty),
                    fontWeight: 'bold',
                    marginLeft: '0.5rem'
                  }}>
                    {selectedVideo.difficulty}
                  </span>
                </div>
                <div>
                  <strong>Category:</strong> {selectedVideo.category}
                </div>
              </div>
              
              {/* Benefits */}
              <div style={{ marginBottom: '1.5rem' }}>
                <strong>Benefits:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {selectedVideo.benefits.map((benefit, i) => (
                    <span key={i} style={{
                      background: 'rgba(0, 180, 216, 0.2)',
                      color: '#00b4d8',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '15px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}>
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
              
              <motion.button
                className="feature-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedVideo(null)}
                style={{ width: '100%' }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default YogaVideos;
