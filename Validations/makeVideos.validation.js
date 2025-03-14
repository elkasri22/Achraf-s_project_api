const joi = require("joi");
joi.objectId = require("joi-objectid")(joi);
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const { UriYoutubeVideo } = require("../utils/regex");

exports.CreateMakeVideoValidation = asyncHandler(async (req, res, next) => {
    const schema = joi.object({
        url_video: joi.string().trim().uri().regex(UriYoutubeVideo).required().messages({
            "string.pattern.base": "Invalid URL",
        }),
        screenshot: joi.any().required(),
    });

    const { error } = schema.validate({ ...req.body, screenshot: req.file });

    if (error) {
        return next(new ApiError(400, error.details[0].message));
    }

    next();
});

exports.UpdateStatusMakeVideoValidation = asyncHandler(async (req, res, next) => {
    const schema = joi.object({
        id: joi.objectId().required(),
        name: joi.string().trim().lowercase().valid("pending", "approved", "paid", "rejected").required(),
        color: joi.string().trim().valid("#E9AB00", "#64EA00", "#0F2EC6", "#EC0000").required(),
        isActiveVoucher: joi.bool().valid(true, false).optional(),
        price: joi.number().min(1).optional(),
        pointsVideos: joi.number().min(1).optional(),
    });

    const { value, error } = schema.validate({ id: req.params.id, ...req.body });

    if (error) {
        return next(new ApiError(400, error.details[0].message));
    }

    if (value?.pointsVideos) {
        if (value?.isActiveVoucher) {
            return next(new ApiError(400, "You can't send points videos if you want send voucher!!"));
        };
    };

    if (value?.isActiveVoucher) {
        if (!value?.price) {
            return next(new ApiError(400, "Price is required if you want send voucher!!"));
        };
    };

    next();
});