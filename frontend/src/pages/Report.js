import React from 'react';
import { motion } from 'framer-motion';
import '../styles/styles.css';

const Report = ({ reportData }) => {
  return (
    <motion.div className="report-page" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
      <h2>Therapy Report</h2>
      <div className="report-content">
        <p><strong>Name:</strong> {reportData?.name}</p>
        <p><strong>Depression Level:</strong> {reportData?.depression_level}</p>
        <p><strong>Suggestions:</strong> {reportData?.suggestions}</p>
        <a href={reportData?.pdfUrl} target="_blank" rel="noreferrer" className="download-btn">Download PDF</a>
      </div>
    </motion.div>
  );
};

export default Report;