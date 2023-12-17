const jwt = require("jsonwebtoken");
const HttpError = require("../models/error");
const dotenv = require("dotenv");
dotenv.config();

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.cookies;
    if (!token) {
      throw new Error("Authentication failed!:");
    }
    const decodedToken = jwt.verify(token.jwtToken, process.env.TOKEN_SECRET);
    req.userData = { userId: decodedToken.userId, image: decodedToken.image };
    next();
  } catch (error) {
    return next(new HttpError("Authentication failed!", 401));
  }
};
