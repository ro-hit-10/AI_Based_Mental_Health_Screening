// backend/routes/reportRoutes.js
const express = require("express");
const router = express.Router();
const { generateReport, getReports, downloadPDF, getPatientData } = require("../controllers/reportController");
const { protect } = require("../utils/authMiddleware");

router.post("/generate", protect, generateReport);
router.get("/", protect, getReports);
router.get("/patient-data", protect, getPatientData);
router.post("/download", protect, downloadPDF);

module.exports = router;
