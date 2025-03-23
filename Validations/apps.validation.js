const joi = require("joi");
joi.objectId = require("joi-objectid")(joi);
const { check } = require("express-validator");
const validatorMiddleware = require("../Middlewares/middlewareValidator");

exports.CreateAppValidation = [
    check("title").isString().trim().notEmpty().withMessage("Title is required"),
    check("type").isString().trim().notEmpty().withMessage("Type is required"),
    check("icon_app").isString().trim().notEmpty().withMessage("Icon app is required"),
    check("bg_app").isString().trim().notEmpty().withMessage("Background app is required"),
    check("content").isString().trim().notEmpty().withMessage("Content is required"),
    check("rating").isNumeric().trim().notEmpty().withMessage("Rating is required"),
    check("size").isString().trim().notEmpty().withMessage("Size is required"),
    check("download").isString().trim().notEmpty().withMessage("Download is required"),
    check("developer").isString().trim().notEmpty().withMessage("Developer is required"),
    check("category").isString().trim().notEmpty().withMessage("Category is required"),
    check("trending").isBoolean().notEmpty().withMessage("Trending is required"),
    check("slider").isBoolean().notEmpty().withMessage("Slider is required"),
    check("supportedDevices")
        .optional()
        .isArray()
        .notEmpty()
        .withMessage("Supported devices is required")
        .custom((value) => {
            if (!Array.isArray(value)) {
                return false;
            }
            return value.every((device) => typeof device === "string" && device.trim().length > 0);
        }),
    check("it").trim().isString(),
    check("key").trim().isString(),
    validatorMiddleware
];

exports.UpdateAppValidation = [
    check("id").isString().trim().isMongoId().withMessage("Invalid id format").notEmpty().withMessage("Id is required"),
    check("title").isString().trim().optional(),
    check("type").isString().trim().optional(),
    check("icon_app").isString().trim().optional(),
    check("bg_app").isString().trim().optional(),
    check("content").isString().trim().optional(),
    check("rating").isNumeric().trim().optional(),
    check("size").isString().trim().optional(),
    check("download").isString().trim().optional(),
    check("developer").isString().trim().optional(),
    check("category").isString().trim().optional(),
    check("supportedDevices")
        .optional()
        .isArray()
        .optional()
        .custom((value) => {
            if (!Array.isArray(value)) {
                return false;
            }
            return value.every((device) => typeof device === "string" && device.trim().length > 0);
        }),
    check("it").trim().isString().optional(),
    check("key").trim().isString().optional(),
    validatorMiddleware
];