const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const sanitizeInput = (email, password) => {
  const sanitizedEmail = validator.normalizeEmail(email, {
    gmail_remove_dots: false,
  });
  const escapedEmail = validator.escape(sanitizedEmail);
  const escapedPassword = validator.escape(password);

  return { email: escapedEmail, password: escapedPassword };
};

userSchema.statics.signup = async function (email, password) {
  const sanitized = sanitizeInput(email, password);
  email = sanitized.email;
  password = sanitized.password;

  if (!email || !password) {
    throw Error("All fields must be filled");
  }
  if (!validator.isEmail(email)) {
    throw Error("Incorrect log in details");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Incorrect format");
  }

  const exists = await this.findOne({ email });

  if (exists) {
    throw Error(
      "This email address is not available. Please use another address."
    );
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const user = await this.create({ email, password: hash });

  return user;
};

userSchema.statics.login = async function (email, password) {
  const sanitized = sanitizeInput(email, password);
  email = sanitized.email;
  password = sanitized.password;

  // Final check, should be redundant as frontend validates before submit
  if (!email || !password) {
    throw Error("All fields must be filled");
  }

  const user = await this.findOne({ email });

  if (!user) {
    throw Error("Incorrect log in details");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Incorrect log in details");
  }

  return user;
};

module.exports = mongoose.model("User", userSchema);
