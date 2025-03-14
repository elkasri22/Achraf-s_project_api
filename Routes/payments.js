const express = require("express");
const router = express.Router();
const { verifyTokenJwt } = require("../Middlewares/auth/verifyTokenJwt");
const csrf = require("../Middlewares/csrf");
const allowTo = require("../Middlewares/auth/allowTo");
const payments = require("../Controllers/payment.controller");
const {
    CreatePaymentMethodValidation,
    CreateTypePaymentMethodValidation,
    UpdateTypePaymentMethodValidation,
    MongoIdTypePaymentMethodValidation,
    UpdatePaymentMethodValidation,
} = require("../Validations/payments.validation");
const { MongoIdValidation } = require("../Validations/global");

router
    .route("/")
    .post(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        CreatePaymentMethodValidation,
        payments.createPaymentMethod
    )
    .get(verifyTokenJwt, payments.gets);

router
    .route("/:id")
    .post(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        CreateTypePaymentMethodValidation,
        payments.CreateTypePaymentMethod
    )
    .get(
        verifyTokenJwt,
        MongoIdValidation,
        payments.GetPaymentMethod
    )
    .put(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        UpdatePaymentMethodValidation,
        payments.UpdatePaymentMethod
    )
    .delete(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        MongoIdValidation,
        payments.DeletePaymentMethod
    );

router
    .route("/:id/edit-type/:typeId")
    .put(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        UpdateTypePaymentMethodValidation,
        payments.UpdateTypePaymentMethod
    );

router
    .route("/:id/delete-type/:typeId")
    .delete(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        MongoIdTypePaymentMethodValidation,
        payments.DeleteTypePaymentMethod
    );

router
    .route("/:id/get-type/:typeId")
    .get(
        verifyTokenJwt,
        MongoIdTypePaymentMethodValidation,
        payments.GetOneTypePaymentMethod
    );

router
    .route("/with/:id")
    .get(
        verifyTokenJwt,
        MongoIdValidation,
        payments.GetTypePaymentMethodWithPaymentMethod
    );

module.exports = router;