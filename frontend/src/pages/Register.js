// src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import api from '../utils/api';
import AuthAside from '../ui/AuthAside';
import './Auth.css';

const STEPS = ['Account', 'About you', 'Wellbeing'];

const STEP_FIELDS = [
  ['username', 'email', 'password', 'confirmPassword'],
  ['age', 'gender', 'occupation', 'location', 'mobile'],
  []
];

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    occupation: '',
    location: '',
    mobile: '',
    past_mental_health_history: '',
    consent_checkbox: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const validateStep = () => {
    if (STEP_FIELDS[step].some((f) => !String(formData[f]).trim())) {
      return 'Please fill in all fields to continue.';
    }
    if (step === 0) {
      if (formData.password.length < 6) return 'Password should be at least 6 characters.';
      if (formData.password !== formData.confirmPassword) return 'Passwords do not match.';
    }
    if (step === 1 && (Number(formData.age) < 10 || Number(formData.age) > 120)) {
      return 'Please enter a valid age.';
    }
    return '';
  };

  const next = () => {
    const problem = validateStep();
    if (problem) {
      setError(problem);
      return;
    }
    setDirection(1);
    setStep((s) => s + 1);
  };

  const back = () => {
    setError('');
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      next();
      return;
    }
    if (!formData.consent_checkbox) {
      setError('Please accept the privacy policy to create your account.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        age: formData.age,
        gender: formData.gender,
        occupation: formData.occupation,
        location: formData.location,
        mobile: formData.mobile,
        past_mental_health_history: formData.past_mental_health_history
      });
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, props = {}) => (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input className="input" id={name} name={name} value={formData[name]} onChange={handleChange} {...props} />
    </div>
  );

  const slide = {
    enter: (dir) => ({ x: dir * 32, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir * -32, opacity: 0 })
  };

  return (
    <div className="auth-split">
      <div className="auth-main">
        <motion.div className="auth-box wide" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="eyebrow">Create account</span>
          <h1 className="auth-title">Start your check-in</h1>
          <p className="muted">Three short steps. Everything you share stays private.</p>

          <div className="wizard-steps">
            {STEPS.map((label, i) => (
              <React.Fragment key={label}>
                <div className={`wizard-step ${i < step ? 'done' : ''} ${i === step ? 'current' : ''}`}>
                  <span className="num">{i < step ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
                  <span className="label">{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="wizard-bar">
                    <motion.div className="progress-fill" initial={false} animate={{ width: i < step ? '100%' : '0%' }} transition={{ duration: 0.5 }} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <AnimatePresence>
              {error && (
                <motion.div className="alert alert-error" role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <AlertCircle size={18} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}
              >
                {step === 0 && (
                  <>
                    {field('username', 'Username', { placeholder: 'How should we call you?', autoComplete: 'username' })}
                    {field('email', 'Email', { type: 'email', placeholder: 'you@example.com', autoComplete: 'email' })}
                    <div className="form-row">
                      {field('password', 'Password', { type: 'password', placeholder: 'At least 6 characters', autoComplete: 'new-password' })}
                      {field('confirmPassword', 'Confirm password', { type: 'password', placeholder: 'Repeat password', autoComplete: 'new-password' })}
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className="form-row">
                      {field('age', 'Age', { type: 'number', placeholder: 'e.g. 24', min: 10, max: 120 })}
                      <div className="field">
                        <label htmlFor="gender">Gender</label>
                        <select className="input" id="gender" name="gender" value={formData.gender} onChange={handleChange}>
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    {field('occupation', 'Occupation', { placeholder: 'Student, engineer, teacher…' })}
                    <div className="form-row">
                      {field('location', 'City', { placeholder: 'e.g. Pune' })}
                      {field('mobile', 'Mobile number', { type: 'tel', placeholder: '+91', autoComplete: 'tel' })}
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="field">
                      <label htmlFor="past_mental_health_history">Anything you'd like us to know? <span className="faint">(optional)</span></label>
                      <textarea className="input" id="past_mental_health_history" name="past_mental_health_history"
                        value={formData.past_mental_health_history} onChange={handleChange} rows={4}
                        placeholder="Past mental health history, ongoing stress, or anything else that feels relevant" />
                    </div>
                    <label className="check">
                      <input type="checkbox" name="consent_checkbox" checked={formData.consent_checkbox} onChange={handleChange} />
                      I agree to the privacy policy and data usage terms, and I understand MindCare AI is a screening
                      tool, not a medical diagnosis.
                    </label>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="wizard-nav">
              {step > 0 ? (
                <button type="button" className="btn btn-ghost" onClick={back}><ArrowLeft size={17} /> Back</button>
              ) : <span />}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {step < STEPS.length - 1
                  ? <>Continue <ArrowRight size={17} className="arrow" /></>
                  : loading ? 'Creating account…' : 'Create account'}
              </button>
            </div>
          </form>

          <p className="auth-switch">
            Already have an account? <button onClick={() => navigate('/login')}>Sign in</button>
          </p>
        </motion.div>
      </div>
      <AuthAside />
    </div>
  );
};

export default Register;
