import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Leaf } from 'lucide-react';

const APP_LINKS = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/phq-test', label: 'PHQ-9' },
  { path: '/ai-screening', label: 'AI Screening' },
  { path: '/progress', label: 'Progress' },
  { path: '/yoga', label: 'Yoga' },
  { path: '/blogs', label: 'Articles' },
  { path: '/professionals', label: 'Find an expert' }
];

const Navbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const loggedIn = Boolean(localStorage.getItem('token'));
  const links = loggedIn ? APP_LINKS : [];

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const logout = () => {
    ['token', 'user', 'hasCompletedPHQ', 'assignedDomain', 'latestPHQAnswers', 'phqScore', 'screeningAnalysis']
      .forEach((k) => localStorage.removeItem(k));
    go('/');
  };

  const isActive = (path) => pathname === path || (path === '/ai-screening' && pathname === '/screening');

  const actions = loggedIn ? (
    <button className="btn btn-ghost btn-sm" onClick={logout}>Log out</button>
  ) : (
    <>
      <button className="btn btn-ghost btn-sm" onClick={() => go('/login')}>Sign in</button>
      <button className="btn btn-primary btn-sm" onClick={() => go('/register')}>Get started</button>
    </>
  );

  return (
    <>
      <nav className="navbar" aria-label="Main">
        <div className="navbar-inner">
          <button className="brand" onClick={() => go(loggedIn ? '/dashboard' : '/')}>
            <span className="brand-mark"><Leaf size={17} strokeWidth={2.2} /></span>
            MindCare
          </button>

          <div className="nav-links">
            {links.map((link) => (
              <button key={link.path} className={`nav-link ${isActive(link.path) ? 'active' : ''}`} onClick={() => go(link.path)}>
                {link.label}
                {isActive(link.path) && (
                  <motion.span layoutId="nav-underline" className="nav-underline" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />
                )}
              </button>
            ))}
            <div className="btn-row" style={{ marginLeft: '0.75rem', gap: '0.5rem' }}>{actions}</div>
          </div>

          <button className="nav-toggle" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="nav-mobile"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {links.map((link) => (
              <button key={link.path} className={`nav-link ${isActive(link.path) ? 'active' : ''}`} onClick={() => go(link.path)}>
                {link.label}
              </button>
            ))}
            <div className="btn-row" style={{ marginTop: '0.75rem' }}>{actions}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
