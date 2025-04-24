const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

exports.CreateMatchValidation = asyncHandler(async (req, res, next) => {
    const schema = Joi.object({
        status: Joi.string().trim().required().valid("live", "upcoming"),
        type: Joi.string().trim().required().valid("football", "basketball", "tennis", "AM-football", "hockey"),
        league_name: Joi.string().trim().required(),
        league_logo: Joi.string().trim().required(),
        homeTeam_name: Joi.string().trim().required(),
        homeTeam_logo: Joi.string().trim().required(),
        homeTeam_score: Joi.number().integer().default(0),
        awayTeam_name: Joi.string().trim().required(),
        awayTeam_logo: Joi.string().trim().required(),
        awayTeam_score: Joi.number().integer().default(0),
        date: Joi.string().trim().required(),
        time: Joi.string().trim().required(),
        end_time: Joi.string().trim().required(),
        type_match: Joi.string().trim().required().valid("video", "iframe"),
        isFirst: Joi.boolean().default(false),
        matchUrl: Joi.string().uri().trim().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return next(new ApiError(400, error.details[0].message));
    }

    next();
});

exports.UpdateMatchValidation = asyncHandler(async (req, res, next) => {
    const schema = Joi.object({
        id: Joi.objectId().required(),
        status: Joi.string().trim().valid("live", "upcoming"),
        type: Joi.string().trim().valid("football", "basketball", "tennis", "AM-football", "hockey"),
        league_name: Joi.string().trim(),
        league_logo: Joi.string().trim(),
        homeTeam_name: Joi.string().trim(),
        homeTeam_logo: Joi.string().trim(),
        homeTeam_score: Joi.number().integer().default(0),
        awayTeam_name: Joi.string().trim(),
        awayTeam_logo: Joi.string().trim(),
        awayTeam_score: Joi.number().integer().default(0),
        date: Joi.string().trim(),
        time: Joi.string().trim(),
        end_time: Joi.string().trim(),
        type_match: Joi.string().trim().valid("video", "iframe"),
        isFirst: Joi.boolean().default(false),
        matchUrl: Joi.string().uri().trim(),
    });

    const { error } = schema.validate({...req.body, id: req.params.id});

    if (error) {
        return next(new ApiError(400, error.details[0].message));
    }

    next();
});