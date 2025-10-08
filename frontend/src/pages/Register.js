// src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Register.css'; // For additional form styling if needed

const Register = () => {
  const navigate = useNavigate();
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
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (!formData.consent_checkbox) {
      alert('Please accept the consent checkbox.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          age: formData.age,
          gender: formData.gender,
          occupation: formData.occupation,
          location: formData.location,
          mobile: formData.mobile,
          past_mental_health_history: formData.past_mental_health_history
        }),
      });

      if (response.ok) {
        navigate('/login');
      } else {
        const data = await response.json();
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
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
      className="register-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="register-content"
        variants={itemVariants}
      >
        <motion.h1 
          className="register-title"
          variants={itemVariants}
        >
          Create Account
        </motion.h1>
        <form className="register-form" onSubmit={handleSubmit}>
          <motion.div 
            className="form-group"
            variants={itemVariants}
          >
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </motion.div>

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
              placeholder="Enter your email"
              required
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
              placeholder="Enter your password"
              required
            />
          </motion.div>

          <motion.div 
            className="form-group"
            variants={itemVariants}
          >
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </motion.div>

          <motion.div 
            className="form-group"
            variants={itemVariants}
          >
            <label htmlFor="age">Age</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter your age"
              required
            />
          </motion.div>
          
          <motion.div 
            className="form-group"
            variants={itemVariants}
          >
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="gender-select"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </motion.div>

          <motion.div 
            className="form-group"
            variants={itemVariants}
          >
            <label htmlFor="occupation">Occupation</label>
            <input
              type="text"
              id="occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              placeholder="Enter your occupation"
              required
            />
          </motion.div>

          <motion.div 
            className="form-group"
            variants={itemVariants}
          >
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter your location"
              required
            />
          </motion.div>

          <motion.div 
            className="form-group"
            variants={itemVariants}
          >
            <label htmlFor="mobile">Mobile Number</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Enter your mobile number"
              required
            />
          </motion.div>

          <motion.div 
            className="form-group"
            variants={itemVariants}
          >
            <label htmlFor="past_mental_health_history">Past Mental Health History (Optional)</label>
            <textarea
              id="past_mental_health_history"
              name="past_mental_health_history"
              value={formData.past_mental_health_history}
              onChange={handleChange}
              placeholder="Share any relevant mental health history"
              rows="4"
            />
          </motion.div>

          <motion.div 
            className="form-group"
            variants={itemVariants}
          >
            <label htmlFor="consent_checkbox">
              <input
                type="checkbox"
                id="consent_checkbox"
                name="consent_checkbox"
                checked={formData.consent_checkbox}
                onChange={handleChange}
                required
              />
              I agree to the platform's privacy policy and data usage terms.
            </label>
          </motion.div>

          <motion.button 
            type="submit"
            className="register-button"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Register
          </motion.button>
        </form>

        <motion.p 
          className="login-link"
          variants={itemVariants}
        >
          Already have an account?{" "}
          <motion.span
            className="link"
            onClick={() => navigate("/login")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Sign In
          </motion.span>
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default Register;
