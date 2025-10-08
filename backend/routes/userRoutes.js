// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { getProfile, updateProfile, getDashboardData } = require("../controllers/userController");
const { protect } = require("../utils/authMiddleware");

// Get user profile
router.get("/profile", protect, getProfile);

// Update user profile
router.put("/profile", protect, updateProfile);

// Get dashboard data
router.get("/dashboard", protect, getDashboardData);

module.exports = router;
