const express = require("express");
const router = express.Router();
const {
  registerValidation,
  loginValidation,
  sendEmailValidation,
  sendOtpValidation,
  sendForgotPasswordValidation,
  editProfileValidation,
} = require("../Validations/auth.validation");
const auth = require("../Controllers/auth.controller");
const { verifyTokenJwt } = require("../Middlewares/auth/verifyTokenJwt");
const csrf = require("../Middlewares/csrf");
const allowTo = require("../Middlewares/auth/allowTo");

router.route("/register").post(registerValidation, auth.register);

router.route("/login").post(loginValidation, auth.login);

router.route("/get-otp").post(sendEmailValidation, auth.sendOtp);

router.route("/verify-otp").post(sendOtpValidation, auth.verifyOtp);

router
  .route("/forgot-password")
  .post(sendForgotPasswordValidation, auth.forgotPassword);

router.route("/me").get(verifyTokenJwt, allowTo("admin"), auth.me);

router
  .route("/me/edit-profile")
  .put(
    verifyTokenJwt,
    csrf.verifyToken,
    allowTo("admin"),
    editProfileValidation,
    auth.editProfile
  );

module.exports = router;