const joi = require("joi");
const asyncHandler = require("express-async-handler");
const { RegexStrongPassword } = require("../utils/regex");
const ApiError = require("../utils/ApiError");

exports.registerValidation = asyncHandler(async (req, res, next) => {
  const schema = joi.object({
    username: joi.string().trim().lowercase().min(3).max(32).required(),
    avatar: joi.any().optional(),
    email: joi.string().trim().lowercase().email().required(),
    country: joi.string().trim().required(),
    password: joi
      .string()
      .trim()
      .min(8)
      .max(32)
      .required()
      .regex(new RegExp(RegexStrongPassword))
      .messages({
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      }),
    referredBy: joi.string().trim().lowercase().optional(),
  });

  const { error } = schema.validate({ ...req.body, avatar: req.file });

  if (error) {
    return next(new ApiError(400, error.details[0].message));
  }

  next();
});

exports.loginValidation = asyncHandler(async (req, res, next) => {
  const schema = joi.object({
    username: joi.string().trim().lowercase().min(3).max(32).required(),
    password: joi
      .string()
      .trim()
      .min(8)
      .max(32)
      .required()
      .regex(new RegExp(RegexStrongPassword))
      .messages({
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      }),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return next(new ApiError(400, error.details[0].message));
  }

  next();
});

exports.sendEmailValidation = asyncHandler(async (req, res, next) => {
  const schema = joi.object({
    email: joi.string().trim().lowercase().email().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return next(new ApiError(400, error.details[0].message));
  }

  next();
});

exports.sendOtpValidation = asyncHandler(async (req, res, next) => {
  const schema = joi.object({
    otp: joi.string().trim().lowercase().min(6).max(6).required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return next(new ApiError(400, error.details[0].message));
  }

  next();
});

exports.sendForgotPasswordValidation = asyncHandler(async (req, res, next) => {
  const schema = joi.object({
    otp: joi.string().trim().lowercase().min(6).max(6).required(),
    password: joi
      .string()
      .trim()
      .min(8)
      .max(32)
      .required()
      .regex(new RegExp(RegexStrongPassword))
      .messages({
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      }),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return next(new ApiError(400, error.details[0].message));
  }

  next();
});

exports.editProfileValidation = asyncHandler(async(req , res , next) => {
  const schema = joi.object({
      id: joi.objectId().required(),
      username: joi.string().trim().lowercase().min(3).max(32),
      avatar: joi.any(),
      email: joi.string().trim().lowercase().email(),
      country: joi.string().trim(),
      password: joi.string().trim().min(8).max(32).regex(new RegExp(RegexStrongPassword)).messages({
          "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      }),
  });

  const { error } = schema.validate({id: req.user.id,...req.body, avatar: req.file});

  if (error) {
      return next(new ApiError(400, error.details[0].message));
  };

  next();
});