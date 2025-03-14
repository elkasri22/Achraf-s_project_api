const express = require("express");
const router = express.Router();
const { verifyTokenJwt } = require("../Middlewares/auth/verifyTokenJwt");
const clickTapHere = require("../Controllers/tapHere.controller");
const csrf = require("../Middlewares/csrf");

router.post("/", verifyTokenJwt, csrf.verifyToken, clickTapHere);

module.exports = router;