const express = require("express");
const router = express.Router();
const { verifyTokenJwt } = require("../Middlewares/auth/verifyTokenJwt");
const apps = require("../Controllers/apps.controller");
const allowTo = require("../Middlewares/auth/allowTo");
const csrf = require("../Middlewares/csrf");
const { MongoIdValidation } = require("../Validations/global");
const { CreateAppValidation, UpdateAppValidation } = require("../Validations/apps.validation");

router
    .route("/")
    .post(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        CreateAppValidation,
        apps.create
    ).get(apps.gets);

router
    .route("/:id")
    .put(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        UpdateAppValidation,
        apps.update
    ).get(
        MongoIdValidation,
        apps.getOne
    ).delete(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        MongoIdValidation,
        apps.delete
    );

module.exports = router;