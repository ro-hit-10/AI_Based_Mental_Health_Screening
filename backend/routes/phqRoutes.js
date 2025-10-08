// backend/routes/phqRoutes.js
const express = require("express");
const router = express.Router();
const { 
  submitPHQ, 
  getPHQHistory, 
  getLatestPHQ, 
  getPHQDetails 
} = require("../controllers/phqController");
const { protect } = require("../utils/authMiddleware");

// Submit PHQ-9 test
router.post("/submit", protect, submitPHQ);

// Get PHQ-9 history
router.get("/history", protect, getPHQHistory);

// Get latest PHQ-9 test
router.get("/latest", protect, getLatestPHQ);

// Get specific PHQ-9 test details
router.get("/details/:testId", protect, getPHQDetails);

module.exports = router;
