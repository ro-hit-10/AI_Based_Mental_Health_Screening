import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Use dashboard styling

const Professionals = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('mumbai');
  const [selectedProfessional, setSelectedProfessional] = useState(null);

  const categories = [
    { id: 'all', name: 'All Specialists', icon: '👥' },
    { id: 'psychiatrist', name: 'Psychiatrists', icon: '🧠' },
    { id: 'psychologist', name: 'Psychologists', icon: '💭' },
    { id: 'therapist', name: 'Therapists', icon: '🤝' },
    { id: 'counselor', name: 'Counselors', icon: '💬' }
  ];

  const cities = [
    { id: 'mumbai', name: 'Mumbai' },
    { id: 'delhi', name: 'Delhi' },
    { id: 'bangalore', name: 'Bangalore' },
    { id: 'chennai', name: 'Chennai' },
    { id: 'pune', name: 'Pune' },
    { id: 'hyderabad', name: 'Hyderabad' }
  ];

  const professionals = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      title: 'Consultant Psychiatrist',
      specialization: 'Depression, Anxiety & PTSD',
      experience: '15 years',
      rating: 4.9,
      fees: '₹1,500 - ₹2,000',
      clinic: 'Mindcare Hospital',
      address: 'Bandra West, Mumbai',
      phone: '+91 9876543210',
      justdialUrl: 'https://www.justdial.com/Mumbai/Mindcare-Hospital-Bandra-West/022PXX22-XX22-181210143052-A6P5_BZDET',
      category: 'psychiatrist',
      city: 'mumbai',
      qualifications: ['MBBS', 'MD Psychiatry', 'Fellowship in Clinical Psychology'],
      languages: ['English', 'Hindi', 'Marathi'],
      availability: 'Mon-Sat: 10:00 AM - 6:00 PM',
      treatments: ['CBT', 'DBT', 'Medication Management', 'Psychotherapy']
    },
    {
      id: 2,
      name: 'Dr. Rajesh Sharma',
      title: 'Clinical Psychologist',
      specialization: 'Cognitive Behavioral Therapy',
      experience: '12 years',
      rating: 4.8,
      fees: '₹1,200 - ₹1,800',
      clinic: 'Mind Wellness Center',
      address: 'Connaught Place, Delhi',
      phone: '+91 9876543211',
      justdialUrl: 'https://www.justdial.com/Delhi/Mind-Wellness-Center-Connaught-Place/011PXX22-XX22-170615120404-N9P8_BZDET',
      category: 'psychologist',
      city: 'delhi',
      qualifications: ['MA Psychology', 'PhD Clinical Psychology', 'CBT Certification'],
      languages: ['English', 'Hindi'],
      availability: 'Mon-Fri: 9:00 AM - 7:00 PM',
      treatments: ['Individual Therapy', 'Group Therapy', 'Stress Management', 'Anxiety Treatment']
    },
    {
      id: 3,
      name: 'Dr. Priya Patel',
      title: 'Marriage & Family Therapist',
      specialization: 'Relationship & Family Counseling',
      experience: '10 years',
      rating: 4.7,
      fees: '₹1,000 - ₹1,500',
      clinic: 'Harmony Therapy Center',
      address: 'Koramangala, Bangalore',
      phone: '+91 9876543212',
      justdialUrl: 'https://www.justdial.com/Bangalore/Harmony-Therapy-Center-Koramangala/080PXX22-XX22-160412134521-M7Q6_BZDET',
      category: 'therapist',
      city: 'bangalore',
      qualifications: ['MSW', 'Diploma in Family Therapy', 'Certified Relationship Counselor'],
      languages: ['English', 'Hindi', 'Kannada'],
      availability: 'Tue-Sun: 11:00 AM - 8:00 PM',
      treatments: ['Couple Therapy', 'Family Counseling', 'Pre-marital Counseling', 'Conflict Resolution']
    },
    {
      id: 4,
      name: 'Dr. Arun Kumar',
      title: 'Addiction Counselor',
      specialization: 'Substance Abuse & Recovery',
      experience: '8 years',
      rating: 4.6,
      fees: '₹800 - ₹1,200',
      clinic: 'Recovery Plus Center',
      address: 'T. Nagar, Chennai',
      phone: '+91 9876543213',
      justdialUrl: 'https://www.justdial.com/Chennai/Recovery-Plus-Center-T-Nagar/044PXX22-XX22-150318142103-K5L4_BZDET',
      category: 'counselor',
      city: 'chennai',
      qualifications: ['MA Psychology', 'Addiction Counseling Certification', 'NAADAC Certified'],
      languages: ['English', 'Tamil', 'Hindi'],
      availability: 'Mon-Sat: 10:00 AM - 6:00 PM',
      treatments: ['De-addiction Therapy', '12-Step Program', 'Motivational Interviewing', 'Relapse Prevention']
    },
    {
      id: 5,
      name: 'Dr. Meera Joshi',
      title: 'Child Psychologist',
      specialization: 'Child & Adolescent Mental Health',
      experience: '14 years',
      rating: 4.9,
      fees: '₹1,300 - ₹1,700',
      clinic: 'Little Minds Clinic',
      address: 'Viman Nagar, Pune',
      phone: '+91 9876543214',
      justdialUrl: 'https://www.justdial.com/Pune/Little-Minds-Clinic-Viman-Nagar/020PXX22-XX22-140522151234-H8J9_BZDET',
      category: 'psychologist',
      city: 'pune',
      qualifications: ['MA Psychology', 'PhD Child Psychology', 'Play Therapy Certification'],
      languages: ['English', 'Hindi', 'Marathi'],
      availability: 'Mon-Sat: 9:00 AM - 5:00 PM',
      treatments: ['Play Therapy', 'Behavioral Therapy', 'ADHD Treatment', 'Autism Spectrum Support']
    },
    {
      id: 6,
      name: 'Dr. Vikram Singh',
      title: 'Consultant Psychiatrist',
      specialization: 'Bipolar & Mood Disorders',
      experience: '18 years',
      rating: 4.8,
      fees: '₹1,800 - ₹2,500',
      clinic: 'Mind Care Institute',
      address: 'Jubilee Hills, Hyderabad',
      phone: '+91 9876543215',
      justdialUrl: 'https://www.justdial.com/Hyderabad/Mind-Care-Institute-Jubilee-Hills/040PXX22-XX22-130415163027-P9Q1_BZDET',
      category: 'psychiatrist',
      city: 'hyderabad',
      qualifications: ['MBBS', 'MD Psychiatry', 'DPM', 'Fellowship in Mood Disorders'],
      languages: ['English', 'Hindi', 'Telugu'],
      availability: 'Mon-Fri: 10:00 AM - 7:00 PM, Sat: 10:00 AM - 2:00 PM',
      treatments: ['Medication Management', 'ECT', 'TMS Therapy', 'Mood Stabilization']
    }
  ];

  const filteredProfessionals = professionals.filter(prof => {
    const categoryMatch = selectedCategory === 'all' || prof.category === selectedCategory;
    const cityMatch = prof.city === selectedCity;
    return categoryMatch && cityMatch;
  });

  const getCategoryColor = (category) => {
    switch(category) {
      case 'psychiatrist': return '#FF6B6B';
      case 'psychologist': return '#6C5CE7';
      case 'therapist': return '#4ECDC4';
      case 'counselor': return '#FFD93D';
      default: return '#00b4d8';
    }
  };

  const openJustDial = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      className="dashboard-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="dashboard-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1>👨‍⚕️ Connect with Mental Health Professionals</h1>
        <p>Find and connect with qualified doctors, therapists, and counselors in your area</p>
      </motion.div>

      {/* Filter Controls */}
      <motion.div 
        className="dashboard-stats"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="stat-card">
          <h3>🏥 Specialty</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  background: selectedCategory === category.id ? '#00b4d8' : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>{category.icon}</span> {category.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="stat-card">
          <h3>📍 City</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            {cities.map((city) => (
              <button
                key={city.id}
                onClick={() => setSelectedCity(city.id)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  background: selectedCity === city.id ? '#00b4d8' : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  transition: 'all 0.3s ease'
                }}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="feature-icon">📊</div>
          <h3>Available Doctors</h3>
          <p className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {filteredProfessionals.length}
          </p>
          <p style={{ fontSize: '0.9rem' }}>In {cities.find(c => c.id === selectedCity)?.name}</p>
        </div>
      </motion.div>

      {/* Professionals Grid */}
      <motion.div 
        className="features-grid"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {filteredProfessionals.map((professional, index) => (
          <motion.div
            key={professional.id}
            className="feature-card"
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            onClick={() => setSelectedProfessional(professional)}
            style={{ cursor: 'pointer' }}
          >
            {/* Professional Avatar */}
            <div style={{
              width: '80px',
              height: '80px',
              background: getCategoryColor(professional.category),
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              marginBottom: '1rem',
              margin: '0 auto 1rem auto'
            }}>
              {professional.category === 'psychiatrist' ? '🧠' : 
               professional.category === 'psychologist' ? '💭' :
               professional.category === 'therapist' ? '🤝' : '💬'}
            </div>
            
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{professional.name}</h3>
            <p style={{ color: getCategoryColor(professional.category), fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {professional.title}
            </p>
            
            <p style={{ 
              fontSize: '0.9rem',
              color: '#e0e0e0',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              {professional.specialization}
            </p>
            
            {/* Quick Info */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '0.5rem', 
              marginBottom: '1rem',
              fontSize: '0.8rem'
            }}>
              <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 'bold', color: '#FFD93D' }}>⭐ {professional.rating}</div>
                <div style={{ opacity: 0.8 }}>Rating</div>
              </div>
              <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 'bold', color: '#4ECDC4' }}>{professional.experience}</div>
                <div style={{ opacity: 0.8 }}>Experience</div>
              </div>
            </div>
            
            {/* Fees */}
            <div style={{ 
              background: 'rgba(0, 180, 216, 0.2)',
              padding: '0.5rem',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              <strong style={{ color: '#00b4d8' }}>{professional.fees}</strong>
            </div>
            
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openJustDial(professional.justdialUrl);
                }}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  borderRadius: '25px',
                  border: 'none',
                  background: 'linear-gradient(45deg, #FF6B6B, #FF8E8E)',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                📞 JustDial
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`tel:${professional.phone}`, '_self');
                }}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  borderRadius: '25px',
                  border: 'none',
                  background: 'linear-gradient(45deg, #4ECDC4, #45B7AF)',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                📱 Call
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredProfessionals.length === 0 && (
        <motion.div 
          className="features-grid"
          style={{ gridTemplateColumns: '1fr' }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div className="feature-card">
            <div className="feature-icon" style={{ fontSize: '3rem' }}>🔍</div>
            <h3>No Professionals Found</h3>
            <p>No mental health professionals found for the selected filters. Try changing the city or specialty.</p>
          </motion.div>
        </motion.div>
      )}

      {/* Back to Dashboard Button */}
      <motion.div 
        className="dashboard-stats"
        style={{ marginTop: '3rem' }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <motion.button
          className="feature-button"
          style={{ width: '100%', padding: '1.2rem 2rem' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
        >
          ← Back to Dashboard
        </motion.button>
      </motion.div>

      {/* Professional Detail Modal */}
      <AnimatePresence>
        {selectedProfessional && (
          <motion.div
            className="feature-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProfessional(null)}
          >
            <motion.div
              className="feature-modal"
              style={{ maxWidth: '90%', width: '900px', maxHeight: '90vh', overflow: 'auto' }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: getCategoryColor(selectedProfessional.category),
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem'
                }}>
                  {selectedProfessional.category === 'psychiatrist' ? '🧠' : 
                   selectedProfessional.category === 'psychologist' ? '💭' :
                   selectedProfessional.category === 'therapist' ? '🤝' : '💬'}
                </div>
                <div>
                  <h2 style={{ marginBottom: '0.5rem' }}>{selectedProfessional.name}</h2>
                  <p style={{ color: getCategoryColor(selectedProfessional.category), fontSize: '1.1rem' }}>
                    {selectedProfessional.title}
                  </p>
                </div>
              </div>
              
              {/* Professional Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                
                {/* Basic Info */}
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '10px' }}>
                  <h4 style={{ color: '#00b4d8', marginBottom: '0.75rem' }}>📋 Basic Information</h4>
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.8' }}>
                    <p><strong>Specialization:</strong> {selectedProfessional.specialization}</p>
                    <p><strong>Experience:</strong> {selectedProfessional.experience}</p>
                    <p><strong>Rating:</strong> ⭐ {selectedProfessional.rating}/5</p>
                    <p><strong>Fees:</strong> {selectedProfessional.fees}</p>
                  </div>
                </div>
                
                {/* Contact Info */}
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '10px' }}>
                  <h4 style={{ color: '#00b4d8', marginBottom: '0.75rem' }}>📞 Contact Information</h4>
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.8' }}>
                    <p><strong>Clinic:</strong> {selectedProfessional.clinic}</p>
                    <p><strong>Address:</strong> {selectedProfessional.address}</p>
                    <p><strong>Phone:</strong> {selectedProfessional.phone}</p>
                    <p><strong>Hours:</strong> {selectedProfessional.availability}</p>
                  </div>
                </div>
              </div>
              
              {/* Qualifications */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#00b4d8', marginBottom: '0.75rem' }}>🎓 Qualifications</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedProfessional.qualifications.map((qual, i) => (
                    <span key={i} style={{
                      background: 'rgba(0, 180, 216, 0.2)',
                      color: '#00b4d8',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '15px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}>
                      {qual}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Languages */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#00b4d8', marginBottom: '0.75rem' }}>🌐 Languages Spoken</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedProfessional.languages.map((lang, i) => (
                    <span key={i} style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '15px',
                      fontSize: '0.9rem'
                    }}>
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Treatments */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#00b4d8', marginBottom: '0.75rem' }}>💊 Treatment Specialties</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedProfessional.treatments.map((treatment, i) => (
                    <span key={i} style={{
                      background: getCategoryColor(selectedProfessional.category) + '20',
                      color: getCategoryColor(selectedProfessional.category),
                      padding: '0.25rem 0.75rem',
                      borderRadius: '15px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}>
                      {treatment}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <motion.button
                  className="feature-button"
                  style={{ background: 'linear-gradient(45deg, #FF6B6B, #FF8E8E)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openJustDial(selectedProfessional.justdialUrl)}
                >
                  📞 View on JustDial
                </motion.button>
                
                <motion.button
                  className="feature-button"
                  style={{ background: 'linear-gradient(45deg, #4ECDC4, #45B7AF)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.open(`tel:${selectedProfessional.phone}`, '_self')}
                >
                  📱 Call Now
                </motion.button>
                
                <motion.button
                  className="feature-button"
                  style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedProfessional(null)}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Professionals; 