const express = require("express");
const router = express.Router();
const { verifyTokenJwt } = require("../Middlewares/auth/verifyTokenJwt");
const { MongoIdValidation } = require("../Validations/global");
const csrf = require("../Middlewares/csrf");
const withdrawThePointVideos = require("../Controllers/withdrawThePointVideos.controller");
const allowTo = require("../Middlewares/auth/allowTo");
const { withdrawThePointVideosValidation, sendRequestWithdrawThePointVideosValidation } = require("../Validations/withdrawThePointVideosValidation.validation");

router
    .route("/")
    .post(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        withdrawThePointVideosValidation,
        withdrawThePointVideos.create
    ).get(
        verifyTokenJwt,
        withdrawThePointVideos.gets
    );

router
    .route("/claim")
    .post(
        verifyTokenJwt,
        csrf.verifyToken,
        sendRequestWithdrawThePointVideosValidation,
        withdrawThePointVideos.sendRequestTowWithdrawPointVideos
    );


module.exports = router;