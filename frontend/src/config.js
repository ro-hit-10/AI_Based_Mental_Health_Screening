const config = {
  // Set REACT_APP_API_URL in Vercel (e.g. https://mindcare-backend.onrender.com).
  // Falls back to the local backend during development.
  API_BASE_URL: (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '')
};

export default config;
