// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import Dashboard from './pages/Dashboard';
import PHQTest from './components/PHQTest';
import PHQResult from './pages/PHQResult';
import ScreeningResult from './pages/ScreeningResult';
import Suggestions from './pages/Suggestions';
import Screening from './components/Screening';
import AIScreening from './pages/AIScreening';
import ProgressTracker from './components/ProgressTracker';
import YogaVideos from './components/YogaVideos';
import Blogs from './components/Blogs';
import Professionals from './pages/Professionals';
import PrescriptionDownload from './pages/PrescriptionDownload';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Navbar from './ui/Navbar';
import Footer from './ui/Footer';

const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, transition: { duration: 0.18 } }
};

const AnimatedRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.main key={location.pathname} {...pageTransition}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/phq-test" element={<PHQTest />} />
          <Route path="/phq-result" element={<PHQResult />} />
          <Route path="/ai-screening" element={<AIScreening />} />
          <Route path="/screening" element={<Screening />} />
          <Route path="/screening-result" element={<ScreeningResult />} />
          <Route path="/suggestions" element={<Suggestions />} />
          <Route path="/progress" element={<ProgressTracker />} />
          <Route path="/yoga" element={<YogaVideos />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/professionals" element={<Professionals />} />
          <Route path="/prescription-download" element={<PrescriptionDownload />} />
          <Route path="/report" element={<Navigate to="/prescription-download" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
};

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Router>
        <div className="app-root">
          <Navbar />
          <AnimatedRoutes />
          <Footer />
        </div>
      </Router>
    </MotionConfig>
  );
}

export default App;
