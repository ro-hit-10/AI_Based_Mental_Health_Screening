import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import { FilterChips, stagger, fadeUp } from '../ui/motion';

// Local videos served from public/videos - every videoPath must exist in that folder
const videos = [
  {
    id: 1,
    title: 'Easy Pose (Sukhasana)',
    description: 'A simple seated pose to calm the mind and focus on your breath.',
    difficulty: 'Beginner',
    category: 'Breathing',
    videoPath: '/videos/Easy_Pose.mp4',
    benefits: ['Stress relief', 'Mental clarity', 'Better posture']
  },
  {
    id: 2,
    title: 'Yoga for Depression Relief',
    description: 'A gentle sequence of poses that help lift mood and release tension.',
    difficulty: 'Beginner',
    category: 'Therapeutic',
    videoPath: '/videos/Animated_Yoga_for_Depression_Relief.mp4',
    benefits: ['Better mood', 'Emotional balance', 'Muscle relaxation']
  },
  {
    id: 3,
    title: 'Evening Yoga for Well-being',
    description: 'A gentle evening practice to unwind, release the day and prepare for rest.',
    difficulty: 'All levels',
    category: 'Therapeutic',
    videoPath: '/videos/Yoga_Session_3.mp4',
    benefits: ['Stress reduction', 'Inner peace', 'Better sleep']
  }
];

const categories = [
  { id: 'All', name: 'All sessions' },
  { id: 'Therapeutic', name: 'Therapeutic' },
  { id: 'Breathing', name: 'Breathing' }
];

const YogaVideos = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredVideos = videos.filter((video) => activeCategory === 'All' || video.category === activeCategory);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Move and breathe"
        title="Yoga for a calmer mind"
        italic={[3, 4]}
        subtitle="Short, guided practices designed to reduce stress and lift your mood."
      />

      <div style={{ marginBottom: '1.75rem' }}>
        <FilterChips options={categories} value={activeCategory} onChange={setActiveCategory} layoutId="yoga-chip" />
      </div>

      <motion.div className="grid grid-3" variants={stagger(0.08)} initial="hidden" animate="show" key={activeCategory}>
        {filteredVideos.map((video) => (
          <motion.article key={video.id} variants={fadeUp} className="card card-hover media-card" onClick={() => setSelectedVideo(video)}>
            <div className="media-thumb">
              <video src={`${video.videoPath}#t=0.5`} preload="metadata" muted playsInline />
              <span className="play-btn"><Play size={20} fill="currentColor" /></span>
            </div>
            <div className="media-body">
              <div className="meta-row">
                <span>{video.category}</span>
                <span>{video.difficulty}</span>
              </div>
              <h3>{video.title}</h3>
              <p className="muted small">{video.description}</p>
            </div>
          </motion.article>
        ))}
      </motion.div>

      <AnimatePresence>
        {selectedVideo && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedVideo(null)}>
            <motion.div
              className="modal"
              style={{ width: 'min(920px, 100%)' }}
              role="dialog"
              aria-label={selectedVideo.title}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-head">
                <div>
                  <h2 style={{ fontSize: '2rem' }}>{selectedVideo.title}</h2>
                  <p className="muted" style={{ marginTop: '0.25rem' }}>{selectedVideo.description}</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedVideo(null)} aria-label="Close"><X size={18} /></button>
              </div>
              <video
                key={selectedVideo.id}
                src={selectedVideo.videoPath}
                controls
                autoPlay
                playsInline
                className="modal-video"
              >
                Your browser does not support the video tag.
              </video>
              <div className="chip-row">
                {selectedVideo.benefits.map((b) => <span key={b} className="badge">{b}</span>)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default YogaVideos;
