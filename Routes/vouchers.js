const express = require("express");
const router = express.Router();
const { verifyTokenJwt } = require("../Middlewares/auth/verifyTokenJwt");
const vouchers = require("../Controllers/vouchers.controller");
const { MongoIdValidation } = require("../Validations/global");
const csrf = require("../Middlewares/csrf");
const allowTo = require("../Middlewares/auth/allowTo");
const {
    CreateVoucherValidation,
    UpdateVoucherValidation,
} = require("../Validations/vouchers.validation");

router
    .route("/")
    .get(verifyTokenJwt, allowTo("admin"), vouchers.gets)
    .post(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        CreateVoucherValidation,
        vouchers.create
    );

router
    .route("/:id")
    .get(verifyTokenJwt, allowTo("admin"), MongoIdValidation, vouchers.getOne)
    .put(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        UpdateVoucherValidation,
        vouchers.update
    )
    .delete(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        MongoIdValidation,
        vouchers.delete
    );

router
    .route("/claim-my-gift")
    .post(
        verifyTokenJwt,
        csrf.verifyToken,
        vouchers.giveMyGift
    );

router
    .route("/get-value-voucher")
    .post(
        verifyTokenJwt,
        csrf.verifyToken,
        vouchers.getValueVoucher
    );


module.exports = router;