const joi = require("joi");
joi.objectId = require("joi-objectid")(joi);
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const { check } = require("express-validator");
const validatorMiddleware = require("../Middlewares/middlewareValidator");

exports.CreateTypePaymentMethodValidation = asyncHandler(async (req, res, next) => {
    const schema = joi.object({
        id: joi.objectId().required(),
        name: joi.string().trim().uppercase().min(3).max(32).required(),
        price: joi.number().min(1).required(),
    });

    const { error } = schema.validate({ id: req.params.id, ...req.body });

    if (error) {
        return next(new ApiError(400, error.details[0].message));
    }

    next();
});

exports.CreatePaymentMethodValidation = [
    check("name").isString().trim().toUpperCase().isLength({ min: 3, max: 32 }),
    check("enter")
        .optional()
        .isArray()
        .withMessage("Enter should be array of string"),
    validatorMiddleware
];

exports.UpdatePaymentMethodValidation = [
    check("name").isString().trim().toUpperCase().isLength({ min: 3, max: 32 }).optional(),
    check("enter")
        .optional()
        .isArray()
        .withMessage("Enter should be array of string"),
    validatorMiddleware
];

exports.UpdateTypePaymentMethodValidation = asyncHandler(async (req, res, next) => {
    const schema = joi.object({
        id: joi.objectId().required(),
        typeId: joi.objectId().required(),
        name: joi.string().trim().uppercase().min(3).max(32).optional(),
        price: joi.number().min(1).optional(),
    });

    const { error } = schema.validate({ id: req.params.id, typeId: req.params.typeId, ...req.body });

    if (error) {
        return next(new ApiError(400, error.details[0].message));
    }

    next();
});

exports.MongoIdTypePaymentMethodValidation = asyncHandler(async (req, res, next) => {
    const schema = joi.object({
        id: joi.objectId().required(),
        typeId: joi.objectId().required(),
    });

    const { error } = schema.validate({ id: req.params.id, typeId: req.params.typeId, ...req.body });

    if (error) {
        return next(new ApiError(400, error.details[0].message));
    }

    next();
});