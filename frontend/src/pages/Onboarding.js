import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, LogIn, ArrowRight } from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import { stagger, fadeUp } from '../ui/motion';
import './Auth.css';

const Onboarding = () => {
  const navigate = useNavigate();

  const choices = [
    { icon: UserPlus, title: "I'm new here", text: 'Create a private account and take your first check-in. It takes about five minutes.', cta: 'Create account', path: '/register' },
    { icon: LogIn, title: 'Welcome back', text: 'Sign in to continue your journey and see your progress and care plan.', cta: 'Sign in', path: '/login' }
  ];

  return (
    <div className="page page-narrow">
      <PageHeader
        eyebrow="Welcome"
        title="How would you like to continue?"
        italic={[4]}
        subtitle="MindCare is a private space to check in with yourself."
      />
      <motion.div className="choice-grid" variants={stagger(0.12, 0.2)} initial="hidden" animate="show">
        {choices.map(({ icon: Icon, title, text, cta, path }) => (
          <motion.div key={title} variants={fadeUp} className="card card-pad card-hover choice-card" onClick={() => navigate(path)}>
            <div className="icon-tile lg"><Icon size={24} strokeWidth={1.8} /></div>
            <h2>{title}</h2>
            <p className="muted">{text}</p>
            <span className="card-link">{cta} <ArrowRight size={16} /></span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Onboarding;
