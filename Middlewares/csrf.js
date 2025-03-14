const { tokens, secret } = require("../Controllers/csrf-token.controller");
const ApiError = require("../utils/ApiError");

const verifyToken = (req, res,next) => {
  const token = req.headers["x-csrf-token"];

  if (!tokens.verify(secret, token)) {
    return next(new ApiError(403, "Invalid CSRF token!!"));
  }
  
  next();
};

module.exports = {verifyToken};