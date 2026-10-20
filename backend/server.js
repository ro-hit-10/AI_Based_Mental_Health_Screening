const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const phqRoutes = require("./routes/phqRoutes");
const screeningRoutes = require("./routes/screeningRoutes");
const reportRoutes = require("./routes/reportRoutes");

dotenv.config();
connectDB();

const app = express();

// Configure CORS - add deployed frontends via CORS_ORIGINS (comma separated, "*.vercel.app" style wildcards allowed)
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', ...(process.env.CORS_ORIGINS || '').split(',')]
  .map((o) => o.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => allowedOrigins.some((allowed) => {
  if (allowed.startsWith('*.')) return origin.endsWith(allowed.slice(1));
  return origin === allowed;
});

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (no Origin header) and listed origins
    if (!origin || isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));

app.use(express.json());

// Health check for Render
app.get("/", (req, res) => res.json({ status: "ok", service: "mindcare-backend" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/phq", phqRoutes);
app.use("/api/screening", screeningRoutes);
app.use("/api/reports", reportRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));