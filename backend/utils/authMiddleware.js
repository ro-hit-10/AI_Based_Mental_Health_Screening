const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
      
      // Get user from the token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: "Server error in auth middleware" });
  }
};

module.exports = { protect };
