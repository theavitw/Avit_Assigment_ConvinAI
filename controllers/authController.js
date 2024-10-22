const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Register a new user
exports.registerUser = async (req, res) => {
  const { email, name, mobileNumber, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    
    // Check if user already exists
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      email,
      name,
      mobileNumber,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).json({ message: "User created", user: { email, name, mobileNumber } });
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
};

// Login a user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    
    // Check if user exists
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Check if password is correct using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT token for authentication
    const token = jwt.sign({ userId: user._id }, process.env.JWT_KEY, {
      expiresIn: "1h",
    });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
};
