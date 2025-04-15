const express = require("express");
const router = express.Router();
const { verifyTokenJwt } = require("../Middlewares/auth/verifyTokenJwt");
const csrf = require("../Middlewares/csrf");
const allowTo = require("../Middlewares/auth/allowTo");
const ads = require("../Controllers/ads.controller");
const { createAdValidation, UpdateAdValidation } = require("../Validations/ads.validation");
const { MongoIdValidation } = require("../Validations/global");

router.route("/")
    .post(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        createAdValidation,
        ads.create
    ).get(ads.get);

router.route("/:id")
    .put(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        UpdateAdValidation,
        ads.update
    ).delete(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        MongoIdValidation,
        ads.deleteAd
    );

module.exports = router;