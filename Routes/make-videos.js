const express = require("express");
const router = express.Router();
const { verifyTokenJwt } = require("../Middlewares/auth/verifyTokenJwt");
const csrf = require("../Middlewares/csrf");
const allowTo = require("../Middlewares/auth/allowTo");
const makeVideos = require("../Controllers/make-videos.controller");
const uploads = require("../Middlewares/uploads");
const {
    CreateMakeVideoValidation,
    UpdateStatusMakeVideoValidation,
} = require("../Validations/makeVideos.validation");

router
    .route("/")
    .post(
        verifyTokenJwt,
        csrf.verifyToken,
        uploads.single("screenshot"),
        CreateMakeVideoValidation,
        makeVideos.create
    )
    .get(verifyTokenJwt, allowTo("admin"), makeVideos.gets);

router
    .route("/:id")
    .put(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        UpdateStatusMakeVideoValidation,
        makeVideos.update
    );

router
    .route("/history")
    .get(
        verifyTokenJwt,
        makeVideos.history
    );

module.exports = router;