const express = require("express");
const router = express.Router();
const emails = require("../Controllers/emails.controller");
const { createEmailValidation } = require("../Validations/emails.validation");
const { verifyTokenJwt } = require("../Middlewares/auth/verifyTokenJwt");
const csrf = require("../Middlewares/csrf");
const allowTo = require("../Middlewares/auth/allowTo");
const { MongoIdValidation } = require("../Validations/global");

router
    .route("/")
    .post(
        createEmailValidation,
        emails.create
    ).get(
        verifyTokenJwt,
        allowTo("admin"),
        emails.gets
    );

router
    .route("/:id")
    .delete(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        MongoIdValidation,
        emails.delete
    );
module.exports = router;