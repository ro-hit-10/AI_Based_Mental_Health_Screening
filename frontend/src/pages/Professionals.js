import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ExternalLink, Star, X, Info } from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import { FilterChips } from '../ui/motion';

const Professionals = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('mumbai');
  const [selectedProfessional, setSelectedProfessional] = useState(null);

  const categories = [
    { id: 'all', name: 'All specialists' },
    { id: 'psychiatrist', name: 'Psychiatrists' },
    { id: 'psychologist', name: 'Psychologists' },
    { id: 'therapist', name: 'Therapists' },
    { id: 'counselor', name: 'Counsellors' }
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

  const filteredProfessionals = professionals.filter((prof) => {
    const categoryMatch = selectedCategory === 'all' || prof.category === selectedCategory;
    const cityMatch = prof.city === selectedCity;
    return categoryMatch && cityMatch;
  });

  const openJustDial = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const initials = (name) => name.replace('Dr. ', '').split(' ').map((p) => p[0]).join('').slice(0, 2);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Professional support"
        title="Find the right expert"
        italic={[3]}
        subtitle="Psychiatrists, psychologists, therapists and counsellors in your city."
      />

      <div className="card card-pad filter-panel">
        <div>
          <span className="stat-label">City</span>
          <FilterChips options={cities} value={selectedCity} onChange={setSelectedCity} layoutId="city-chip" />
        </div>
        <div>
          <span className="stat-label">Specialty</span>
          <FilterChips options={categories} value={selectedCategory} onChange={setSelectedCategory} layoutId="spec-chip" />
        </div>
      </div>

      <div className="alert alert-info" style={{ margin: '1.25rem 0 1.75rem' }}>
        <Info size={18} /> Sample listings for demonstration. Please verify details on JustDial before booking.
      </div>

      <motion.div className="grid grid-3" layout>
        <AnimatePresence mode="popLayout">
          {filteredProfessionals.map((professional, i) => (
            <motion.article
              key={professional.id}
              layout
              className="card card-pad card-hover"
              onClick={() => setSelectedProfessional(professional)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
              exit={{ opacity: 0 }}
            >
              <div className="pro-head">
                <div className="avatar">{initials(professional.name)}</div>
                <div>
                  <h3>{professional.name}</h3>
                  <span className="muted small">{professional.title}</span>
                </div>
              </div>
              <p className="muted small" style={{ marginTop: '1rem' }}>{professional.specialization}</p>
              <dl className="pro-facts">
                <div><dt>Rating</dt><dd><Star size={13} fill="currentColor" /> {professional.rating}</dd></div>
                <div><dt>Experience</dt><dd>{professional.experience}</dd></div>
                <div><dt>Fees</dt><dd>{professional.fees}</dd></div>
              </dl>
              <div className="btn-row" style={{ marginTop: '1.25rem' }}>
                <a className="btn btn-primary btn-sm" style={{ flex: 1 }} href={`tel:${professional.phone}`} onClick={(e) => e.stopPropagation()}>
                  <Phone size={15} /> Call
                </a>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); openJustDial(professional.justdialUrl); }}>
                  JustDial <ExternalLink size={14} />
                </button>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredProfessionals.length === 0 && (
        <div className="card card-pad">
          <h3>No professionals found</h3>
          <p className="muted small">Try another city or specialty.</p>
        </div>
      )}

      <AnimatePresence>
        {selectedProfessional && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProfessional(null)}>
            <motion.div
              className="modal"
              role="dialog"
              aria-label={selectedProfessional.name}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-head">
                <div className="pro-head">
                  <div className="avatar lg">{initials(selectedProfessional.name)}</div>
                  <div>
                    <h2 style={{ fontSize: '2rem' }}>{selectedProfessional.name}</h2>
                    <p className="muted">{selectedProfessional.title}</p>
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedProfessional(null)} aria-label="Close"><X size={18} /></button>
              </div>

              <div className="info-grid">
                <div className="info-box">
                  <h4>Practice</h4>
                  <p><b>Specialization:</b> {selectedProfessional.specialization}</p>
                  <p><b>Experience:</b> {selectedProfessional.experience}</p>
                  <p><b>Rating:</b> {selectedProfessional.rating} / 5</p>
                  <p><b>Fees:</b> {selectedProfessional.fees}</p>
                </div>
                <div className="info-box">
                  <h4>Contact</h4>
                  <p><b>Clinic:</b> {selectedProfessional.clinic}</p>
                  <p><b>Address:</b> {selectedProfessional.address}</p>
                  <p><b>Phone:</b> {selectedProfessional.phone}</p>
                  <p><b>Hours:</b> {selectedProfessional.availability}</p>
                </div>
              </div>

              {[
                ['Qualifications', selectedProfessional.qualifications],
                ['Languages', selectedProfessional.languages],
                ['Treatments', selectedProfessional.treatments]
              ].map(([label, items]) => (
                <div key={label} style={{ marginBottom: '1.1rem' }}>
                  <p className="stat-label" style={{ marginBottom: '0.5rem' }}>{label}</p>
                  <div className="chip-row">
                    {items.map((item) => <span key={item} className="badge">{item}</span>)}
                  </div>
                </div>
              ))}

              <div className="btn-row" style={{ marginTop: '1.5rem' }}>
                <a className="btn btn-primary" href={`tel:${selectedProfessional.phone}`}><Phone size={16} /> Call now</a>
                <button className="btn btn-ghost" onClick={() => openJustDial(selectedProfessional.justdialUrl)}>View on JustDial <ExternalLink size={15} /></button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Professionals;
