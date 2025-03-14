const joi = require("joi");
joi.objectId = require("joi-objectid")(joi);
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

exports.CreateLevelValidation = asyncHandler(async (req, res, next) => {
    const schema = joi.object({
        name: joi.string().trim().uppercase().min(3).max(32).required(),
        image: joi.any().required(),
        plus: joi.number().required(),
        min: joi.number().required(),
        TransitionPoints: joi.number().required(),
    });

    const { error } = schema.validate({ ...req.body, image: req.file });

    if (error) {
        return next(new ApiError(400, error.details[0].message));
    }

    next();
});

exports.UpdateLevelValidation = asyncHandler(async (req, res, next) => {
    const schema = joi.object({
        id: joi.objectId().required(),
        name: joi.string().trim().uppercase().min(3).max(32).optional(),
        image: joi.any().optional(),
        plus: joi.number().optional(),
        min: joi.number().optional(),
        TransitionPoints: joi.number().optional(),
    });

    const { error } = schema.validate({
        id: req.params.id,
        ...req.body,
        image: req.file,
    });

    if (error) {
        return next(new ApiError(400, error.details[0].message));
    }

    next();
});