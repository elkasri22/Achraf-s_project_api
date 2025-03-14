const joi = require("joi");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

exports.CreateVoucherValidation = asyncHandler(async (req, res, next) => {
    const schema = joi.object({
        price: joi.number().min(1).required(),
        isActive: joi.bool().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return next(new ApiError(400, error.details[0].message));
    }

    next();
});

exports.UpdateVoucherValidation = asyncHandler(async (req, res, next) => {
    const schema = joi.object({
        id: joi.objectId().required(),
        price: joi.number().min(1),
        isActive: joi.bool(),
    });

    const { error } = schema.validate({ id: req.params.id, ...req.body });

    if (error) {
        return next(new ApiError(400, error.details[0].message));
    }

    next();
});