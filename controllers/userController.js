const User = require("../models/user");
const mongoose = require("mongoose");

// Controller to get user details by their ID, excluding their password.
exports.getUserDetails = async (req, res) => {
  // Convert the user ID from the request to a Mongoose ObjectId.
  const userId = new mongoose.Types.ObjectId(req.userId);

  try {
    // Find the user by ID and exclude the password field from the returned data.
    const user = await User.findById(userId).select("-password");

    // If the user is not found, return a 404 status with an appropriate message.
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If the user is found, return their details with a 200 status.
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving user details" });
  }
};
