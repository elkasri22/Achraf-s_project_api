const express = require("express");
const router = express.Router();
const { verifyTokenJwt } = require("../Middlewares/auth/verifyTokenJwt");
const csrf = require("../Middlewares/csrf");
const allowTo = require("../Middlewares/auth/allowTo");
const {
    CreateRequestToWithdrawTheBalanceValidation,
    UpdateRequestStatusToWithdrawTheBalanceValidation,
} = require("../Validations/withdrawTheBalance.validation");
const withdrawTheBalance = require("../Controllers/withdrawTheBalance.controller");

router
    .route("/")
    .post(
        verifyTokenJwt,
        csrf.verifyToken,
        CreateRequestToWithdrawTheBalanceValidation,
        withdrawTheBalance.requestToWithdrawTheBalance
    )
    .get(
        verifyTokenJwt,
        allowTo("admin"),
        withdrawTheBalance.GetRequestsToWithdrawTheBalance
    );

router
    .route("/:id")
    .put(
        verifyTokenJwt,
        csrf.verifyToken,
        allowTo("admin"),
        UpdateRequestStatusToWithdrawTheBalanceValidation,
        withdrawTheBalance.requestStatusUpdateToWithdrawTheBalance
    )

router
    .route("/history")
    .get(
        verifyTokenJwt,
        withdrawTheBalance.GetMyRequestsToWithdrawTheBalance
    );

module.exports = router;