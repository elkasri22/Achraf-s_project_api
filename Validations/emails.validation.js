const joi = require("joi");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

exports.createEmailValidation = asyncHandler(async (req, res, next) => {
    const schema = joi.object({
        url: joi.string().uri().trim().required(),
        email: joi.string().trim().email().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return next(new ApiError(400, error.details[0].message));
    }

    next();
});