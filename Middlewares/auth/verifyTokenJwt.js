const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../../Models/users.model");
const ApiError = require("../../utils/ApiError");

exports.verifyTokenJwt = asyncHandler(async (req, res, next) => {
  // 1) Check if token exist, if exist get
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token || token === "null") {
    return next(new ApiError(401,"You are not logged in! Please log in to get access."));
  }

  // 2) Verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.SECRET_AUTH);

  // 3) Check if user exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new ApiError(
        401,
        "The user that belong to this token does no longer exist",
      )
    );
  };

  req.user = currentUser;
  next();
});
