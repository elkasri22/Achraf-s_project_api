const express = require("express");
const router = express.Router();
const bot = require("../Controllers/bot.controller");

router.route("/").get(bot.GetAllLeagues);

module.exports = router;