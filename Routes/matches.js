const express = require("express");
const router = express.Router();
const matches = require("../Controllers/matches.controller");
const { verifyTokenJwt } = require("../Middlewares/auth/verifyTokenJwt");
const csrf = require("../Middlewares/csrf");
const allowTo = require("../Middlewares/auth/allowTo");
const { CreateMatchValidation, UpdateMatchValidation } = require("../Validations/matches.validation");
const { MongoIdValidation } = require("../Validations/global");

router
    .route("/")
    .get(matches.getAll)
    .post(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        CreateMatchValidation,
        matches.create
    );

router
    .route("/:id")
    .get(
        MongoIdValidation,
        matches.getOne
    )
    .put(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        UpdateMatchValidation,
        matches.update
    )
    .delete(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        MongoIdValidation,
        matches.delete
    );

module.exports = router;
