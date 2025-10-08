// backend/routes/screeningRoutes.js
const express = require("express");
const router = express.Router();
const { 
  runScreening, 
  saveScreeningResult, 
  getScreeningHistory, 
  getScreeningDetails,
  getSuggestions
} = require("../controllers/screeningController");
const { protect } = require("../utils/authMiddleware");

// Start screening session (generate questions)
router.post("/start", protect, runScreening);

// Save and analyze screening result
router.post("/save", protect, saveScreeningResult);

// Get screening history
router.get("/history", protect, getScreeningHistory);

// Get specific screening session details
router.get("/details/:sessionId", protect, getScreeningDetails);

// Get suggestions only
router.post("/suggestions", protect, getSuggestions);

module.exports = router;
