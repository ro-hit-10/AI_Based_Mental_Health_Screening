import React from 'react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  return (
    <motion.div 
      className="p-6 mt-20"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-3xl font-semibold text-gray-800 mb-4">Welcome Back!</h2>
      <p className="text-gray-600">Track your mental wellness and see suggestions tailored for you.</p>
    </motion.div>
  );
};

export default Dashboard;