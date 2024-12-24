const { body, validationResult } = require("express-validator");

const validateAndSanitizeMaterial = [
  body("title")
    .isString()
    .withMessage("Title must be a string.")
    .trim()
    .escape(),

  body("content")
    .isString()
    .withMessage("Content must be a string.")
    .trim()
    .escape(),

body("tags")
  .isArray({ min: 1 })
  .withMessage("Tags must be an array with at least one item.")
  .bail(), 
body("tags.*") 
  .isString()
  .withMessage("Each tag must be a string.")
  .isLength({ max: 15 })
  .withMessage("Each tag must be 15 characters or fewer.")
  .trim()
  .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = validateAndSanitizeMaterial;
