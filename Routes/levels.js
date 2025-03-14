const express = require("express");
const router = express.Router();
const uploads = require("../Middlewares/uploads");
const { verifyTokenJwt } = require("../Middlewares/auth/verifyTokenJwt");
const levels = require("../Controllers/levels.controller");
const allowTo = require("../Middlewares/auth/allowTo");
const csrf = require("../Middlewares/csrf");
const {
    CreateLevelValidation,
    UpdateLevelValidation,
} = require("../Validations/levels.validation");
const { MongoIdValidation } = require("../Validations/global");

router
    .route("/")
    .post(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        uploads.single("image"),
        CreateLevelValidation,
        levels.create
    )
    .get(verifyTokenJwt, levels.gets);

router
    .route("/:id")
    .put(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        uploads.single("image"),
        UpdateLevelValidation,
        levels.update
    )
    .get(verifyTokenJwt, MongoIdValidation, levels.getOne)
    .delete(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        MongoIdValidation,
        levels.delete
    );

module.exports = router;