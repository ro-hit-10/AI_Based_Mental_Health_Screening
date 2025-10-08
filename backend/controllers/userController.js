// backend/controllers/userController.js
const User = require("../models/User");
const PHQTest = require("../models/PHQTest");
const Screening = require("../models/Screening");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's PHQ-9 tests and screenings using userId field
    const phqTests = await PHQTest.find({ userId: req.user.id });
    const screenings = await Screening.find({ userId: req.user.id });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        hasCompletedScreening: screenings.length > 0
      },
      stats: {
        phqTests: phqTests.length,
        screenings: screenings.length,
        reports: phqTests.length + screenings.length
      }
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    res.status(500).json({ 
      message: "Error fetching dashboard data",
      error: error.message 
    });
  }
};
