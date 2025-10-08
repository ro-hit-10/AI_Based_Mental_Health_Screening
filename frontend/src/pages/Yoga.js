import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Yoga.css';

const Yoga = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState(null);

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
    { id: 'meditation', name: 'Meditation' }
  ];

  const videos = [
    {
      id: 1,
      title: 'Your Yoga Video',
      instructor: 'Your Instructor',
      duration: '25 min',
      level: 'beginner',
      videoSrc: '/videos/Easy_Pose.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: 'beginner'
    },
    {
      id: 2,
      title: 'Morning Yoga Flow',
      instructor: 'Sarah Wilson',
      duration: '20 min',
      level: 'beginner',
      thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: 'beginner'
    },
    {
      id: 3,
      title: 'Stress Relief Yoga',
      instructor: 'Michael Chen',
      duration: '30 min',
      level: 'intermediate',
      thumbnail: 'https://images.unsplash.com/photo-1599902890901-159ee990e6e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: 'intermediate'
    },
    {
      id: 4,
      title: 'Power Yoga Session',
      instructor: 'Emily Rodriguez',
      duration: '45 min',
      level: 'advanced',
      thumbnail: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: 'advanced'
    },
    {
      id: 5,
      title: 'Guided Meditation',
      instructor: 'James Wilson',
      duration: '15 min',
      level: 'beginner',
      thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: 'meditation'
    }
  ];

  const filteredVideos = selectedCategory === 'all'
    ? videos
    : videos.filter(video => video.category === selectedCategory);

  return (
    <motion.div 
      className="yoga-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="yoga-header">
        <h1>Yoga & Meditation</h1>
        <p>Find peace and balance with our guided yoga sessions</p>
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

      <div className="videos-grid">
        {filteredVideos.map(video => (
          <motion.div
            key={video.id}
            className="video-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5 }}
          >
            <div className="video-thumbnail">
              <img src={video.thumbnail} alt={video.title} />
              <div className="duration">{video.duration}</div>
            </div>
            <div className="video-info">
              <h3>{video.title}</h3>
              <p className="instructor">Instructor: {video.instructor}</p>
              <p className="level">Level: {video.level}</p>
              <motion.button
                className="play-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedVideo(video)}
              >
                Play Video
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <motion.div 
          className="video-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="video-modal-content">
            <button 
              className="close-button"
              onClick={() => setSelectedVideo(null)}
            >
              ×
            </button>
            <h2>{selectedVideo.title}</h2>
            {selectedVideo.videoSrc ? (
              <video 
                controls 
                autoPlay 
                className="video-player"
                src={selectedVideo.videoSrc}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="video-placeholder">
                <p>Video player would appear here</p>
                <p>Video: {selectedVideo.title}</p>
              </div>
            )}
            <div className="video-details">
              <p><strong>Instructor:</strong> {selectedVideo.instructor}</p>
              <p><strong>Duration:</strong> {selectedVideo.duration}</p>
              <p><strong>Level:</strong> {selectedVideo.level}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Yoga; 