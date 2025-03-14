const express = require("express");
const router = express.Router();
const { csrfTokenController } = require("../Controllers/csrf-token.controller");
const { verifyTokenJwt } = require("../Middlewares/auth/verifyTokenJwt");

router.get("/", verifyTokenJwt, csrfTokenController);

module.exports = router;