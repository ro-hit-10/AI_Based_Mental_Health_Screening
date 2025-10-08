// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import Report from './pages/Report';
import './styles/styles.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
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
          <Route path="/report" element={<Report />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
