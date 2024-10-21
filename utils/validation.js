const { body, validationResult } = require("express-validator");

exports.validateRegistration = [
    body("email").isEmail().withMessage("Please provide a valid email."),
    body("name").notEmpty().withMessage("Name is required."),
    body("mobileNumber").isLength({ min: 10, max: 10 }).withMessage("Mobile number must be 10 digits."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ];
  