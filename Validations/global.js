const joi = require("joi");
joi.objectId = require("joi-objectid")(joi);
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

exports.MongoIdValidation = asyncHandler(async (req, res, next) => {
    const schema = joi.object({
        id: joi.objectId().required(),
    });

    const id = req.params.id || req.user.id;

    const { error } = schema.validate({ id });

    if (error) {
        return next(new ApiError(400, error.details[0].message));
    }

    next();
});