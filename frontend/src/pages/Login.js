import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import AuthAside from '../ui/AuthAside';
import { stagger, fadeUp } from '../ui/motion';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const shake = useAnimationControls();
  const justRegistered = location.state?.registered;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Could not reach the server. Please check your connection and try again.');
      shake.start({ x: [0, -10, 10, -6, 6, -3, 3, 0], transition: { duration: 0.45 } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">
      <div className="auth-main">
        <motion.div className="auth-box" animate={shake}>
          <motion.div variants={stagger(0.07, 0.05)} initial="hidden" animate="show">
            <motion.span className="eyebrow" variants={fadeUp}>Welcome back</motion.span>
            <motion.h1 className="auth-title" variants={fadeUp}>Sign in to MindCare</motion.h1>
            <motion.p className="muted" variants={fadeUp}>Pick up your journey where you left it.</motion.p>

            <form onSubmit={handleSubmit} className="auth-form" noValidate={false}>
              <AnimatePresence>
                {justRegistered && !error && (
                  <motion.div className="alert alert-info" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <CheckCircle2 size={18} /> Account created. Sign in to get started.
                  </motion.div>
                )}
                {error && (
                  <motion.div className="alert alert-error" role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <AlertCircle size={18} /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div className="field" variants={fadeUp}>
                <label htmlFor="email">Email</label>
                <input className="input" type="email" id="email" name="email" value={formData.email}
                  onChange={handleChange} required placeholder="you@example.com" autoComplete="email" />
              </motion.div>

              <motion.div className="field" variants={fadeUp}>
                <label htmlFor="password">Password</label>
                <div className="pw-wrap">
                  <input className="input" type={showPw ? 'text' : 'password'} id="password" name="password"
                    value={formData.password} onChange={handleChange} required placeholder="Your password"
                    autoComplete="current-password" style={{ paddingRight: '3rem' }} />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              <motion.button type="submit" className="btn btn-primary btn-block" variants={fadeUp} disabled={loading}>
                {loading ? 'Signing in…' : <>Sign in <ArrowRight size={17} className="arrow" /></>}
              </motion.button>
            </form>

            <motion.p className="auth-switch" variants={fadeUp}>
              New to MindCare? <button onClick={() => navigate('/register')}>Create an account</button>
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
      <AuthAside />
    </div>
  );
};

export default Login;
