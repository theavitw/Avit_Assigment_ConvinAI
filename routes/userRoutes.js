const express = require("express");
const { getUserDetails } = require("../controllers/userController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, getUserDetails);

module.exports = router;
