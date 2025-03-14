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
const uploads = require("../Middlewares/uploads");
const auth = require("../Controllers/auth.controller");
const { verifyTokenJwt } = require("../Middlewares/auth/verifyTokenJwt");
const { MongoIdValidation } = require("../Validations/global");
const csrf = require("../Middlewares/csrf");
const allowTo = require("../Middlewares/auth/allowTo");

router
  .route("/register")
  .post(uploads.single("avatar"), registerValidation, auth.register);

router.route("/login").post(loginValidation, auth.login);

router.route("/logout").post(verifyTokenJwt,csrf.verifyToken, auth.logout);

router.route("/get-otp").post(sendEmailValidation, auth.sendOtp);

router.route("/verify-otp").post(sendOtpValidation, auth.verifyOtp);

router
  .route("/forgot-password")
  .post(sendForgotPasswordValidation, auth.forgotPassword);

router.route("/me").get(verifyTokenJwt, auth.me);

router
  .route("/me/edit-profile")
  .put(
    verifyTokenJwt,
    csrf.verifyToken,
    uploads.single("avatar"),
    editProfileValidation,
    auth.editProfile
  );

router
  .route("/me/delete-my-account")
  .delete(
    verifyTokenJwt,
    csrf.verifyToken,
    MongoIdValidation,
    auth.deleteAnAccount
  );

router
  .route("/users/:id")
  .get(
    verifyTokenJwt,
    allowTo("admin"),
    MongoIdValidation,
    auth.getOneUser
  );

module.exports = router;