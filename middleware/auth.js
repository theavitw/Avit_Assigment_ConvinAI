const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const authenticate = (req, res, next) => {
  // Extract the token from the Authorization header.
  const token = req.header("Authorization")?.replace("Bearer ", "");

  // If no token is found, respond with a 401 status.
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    // Verify the teoken using the secret key and extract usr ID.
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.userId = decoded.userId; // Attach userId to the request object.
    next(); // Proceed to the next middleware or route handler.
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { authenticate };
