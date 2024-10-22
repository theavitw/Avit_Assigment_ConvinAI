const express = require("express");

// addded corse for allowing different cross-origin
const cors = require("cors");

//env import 
const dotenv = require("dotenv");
dotenv.config();

// DB coonection Import
const connectdb = require("./DB/db");

// Routes Import
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

// App Init
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectdb();

// Use routes
app.use("/", authRoutes);
app.use("/users", userRoutes);
app.use("/expenses", expenseRoutes);

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
