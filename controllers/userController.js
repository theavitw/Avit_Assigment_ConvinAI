const User = require("../models/user");
const mongoose = require("mongoose");

exports.getUserDetails = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.userId);

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving user details" });
  }
};
