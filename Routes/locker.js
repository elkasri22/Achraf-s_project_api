const express = require("express");
const router = express.Router();
const { verifyTokenJwt } = require("../Middlewares/auth/verifyTokenJwt");
const csrf = require("../Middlewares/csrf");
const allowTo = require("../Middlewares/auth/allowTo");
const locker = require("../Controllers/locker.controller");

router
    .route("/:id")
    .put(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        locker.update
    )
    
router
    .route("/")
    .get(
        locker.get
    );


module.exports = router;