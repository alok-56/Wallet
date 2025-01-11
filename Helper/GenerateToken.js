require("dotenv").config();
const jwt = require("jsonwebtoken");

const generateToken = async (id) => {
  try {
    return jwt.sign({ id: id }, process.env.JWT_SECRECT, { expiresIn: "24h" });
  } catch (error) {
    throw new Error("Token generation failed");
  }
};

module.exports = generateToken;
