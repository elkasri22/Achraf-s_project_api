const joi = require("joi");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

exports.createAdValidation = asyncHandler(async (req, res, next) => {
    const schema = joi.object({
        head: joi.string().trim().required(),
        body: joi.string().trim().required(),
        page: joi.string().trim().required(),
        url: joi.string().uri().trim().required(),
        isActive: joi.boolean().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return next(new ApiError(400, error.details[0].message));
    }

    next();
});

exports.UpdateAdValidation = asyncHandler(async (req, res, next) => {
    const schema = joi.object({
        head: joi.string().trim(),
        body: joi.string().trim(),
        page: joi.string().trim(),
        url: joi.string().uri().trim(),
        isActive: joi.boolean(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return next(new ApiError(400, error.details[0].message));
    }

    next();
});