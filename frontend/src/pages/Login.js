import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      console.log('Attempting login with:', { email: formData.email });
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Login response:', { status: response.status, data });

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.msg || 'Login failed. Please try again.');
        console.error('Login failed:', data);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="login-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="login-content"
        variants={itemVariants}
      >
        <motion.h1 
          className="login-title"
          variants={itemVariants}
        >
          Welcome Back
        </motion.h1>
        
        <motion.p 
          className="login-subtitle"
          variants={itemVariants}
        >
          Sign in to continue your journey
        </motion.p>

        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <motion.div 
            className="form-group"
            variants={itemVariants}
          >
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </motion.div>

          <motion.div 
            className="form-group"
            variants={itemVariants}
          >
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </motion.div>

          <motion.div 
            className="form-options"
            variants={itemVariants}
          >
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <motion.button 
              type="button" 
              className="forgot-password"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Forgot Password?
            </motion.button>
          </motion.div>

          <motion.button
            type="submit"
            className="login-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            variants={itemVariants}
          >
            Sign In
          </motion.button>
        </form>

        <motion.div 
          className="signup-prompt"
          variants={itemVariants}
        >
          <p>
            Don't have an account?{' '}
            <motion.span
              className="signup-link"
              onClick={() => navigate('/register')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign Up
            </motion.span>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Login;