const joi = require("joi");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const WithdrawThePointVideos = require("../Models/withdrawThePointVideos.model");

exports.withdrawThePointVideosValidation = asyncHandler(async (req, res, next) => {
    const schema = joi.object({
        points: joi.number().min(1).required(),
        price: joi.number().min(1).required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return next(new ApiError(400, error.details[0].message));
    }

    next();
});

exports.sendRequestWithdrawThePointVideosValidation = asyncHandler(async (req, res, next) => {
    const schema = joi.object({
        offer_id: joi.objectId().required(),
    });

    const { value, error } = schema.validate(req.body);

    if (value?.offer_id) {
        const data = await WithdrawThePointVideos.findOne({ _id: value.offer_id }).select("-__v -createdAt -updatedAt");
        req.body.points = data.points;
        req.body.price = data.price;
    };

    if (error) {
        return next(new ApiError(400, error.details[0].message));
    }

    next();
});