const asyncHandler = require("express-async-handler");
const Level = require("../Models/levels.model");
const path = require("path");
const fs = require("fs");
const { cloudinaryUploadImage, cloudinaryDeleteImage } = require("../utils/cloudinary");
const sanitize = require("../utils/sanitizeData/Levels/sanitize");
const ApiError = require("../utils/ApiError");

/**
 * @desc CREATE LEVEL
 * @route /api/v1/levels
 * @method POST
 * @access private (admin)
 */
exports.create = asyncHandler(async (req, res, next) => {
    const { name, plus, min, TransitionPoints } = req.body;

    const levels = await Level.findOne({ name });

    if (levels) {
        return next(new ApiError(400, "Level already exists!!"));
    };

    const imagePath = path.join(__dirname, "../uploads", req.file.filename);

    // upload image to cloudinary
    const result = await cloudinaryUploadImage(imagePath);

    const level = await Level.create({
        name,
        plus,
        image: {
            url: result.secure_url,
            public_id: result.public_id,
        },
        min,
        TransitionPoints,
    });

    const newLevel = await level.save();

    const data = await sanitize.sanitizeLevel(newLevel);

    res.status(201).json({
        status: "success",
        message: "Level created successfully",
        data,
    });

    await fs.unlinkSync(imagePath);
});

/**
 * @desc GET LEVELS
 * @route /api/v1/levels
 * @method GET
 * @access private
 */
exports.gets = asyncHandler(async (req, res, next) => {

    const levels = await Level.find();

    const data = await sanitize.sanitizeGets(levels);

    res.status(200).json({
        status: "success",
        data,
    });
});

/**
 * @desc UPDATE LEVEL
 * @route /api/v1/levels
 * @method PUT
 * @access private (admin)
 */
exports.update = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const { name, plus, min, TransitionPoints } = req.body;

    const level = await Level.findOne({ _id: id });

    if (!level) {
        return next(new ApiError(404, "Level does not exist!!"));
    };

    let newLevel = {};

    if(name) newLevel.name = name;
    if(plus) newLevel.plus = plus;
    if(min) newLevel.min = min;
    if(TransitionPoints) newLevel.TransitionPoints = TransitionPoints;
    if(req.file) {
        const imagePath = path.join(__dirname, "../uploads", req.file.filename);

        // upload image to cloudinary
        const result = await cloudinaryUploadImage(imagePath);

        newLevel.image = {
            url: result.secure_url,
            public_id: result.public_id,
        };

        await fs.unlinkSync(imagePath);

        // remove image to cloudinary
        const public_id = level?.image?.public_id;
        await cloudinaryDeleteImage(public_id);
    };

    const updateLevel = await Level.findOneAndUpdate({ _id: id }, newLevel, {
        new: true,
    });

    const data = await sanitize.sanitizeLevel(updateLevel);

    res.status(200).json({
        status: "success",
        data,
    });
});

/**
 * @desc GET LEVEL
 * @route /api/v1/levels/:id
 * @method GET
 * @access private
 */
exports.getOne = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const level = await Level.findOne({ _id: id });

    if (!level) {
        return next(new ApiError(404, "Level does not exist!!"));
    };

    const data = await sanitize.sanitizeLevel(level);

    res.status(200).json({
        status: "success",
        data,
    });
});

/**
 * @desc DELETE LEVEL
 * @route /api/v1/levels/:id
 * @method DELETE
 * @access private (admin)
 */
exports.delete = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const level = await Level.findOne({ _id: id });

    if (!level) {
        return next(new ApiError(404, "Level does not exist!!"));
    };

    // remove image to cloudinary
    const public_id = level?.image?.public_id;
    await cloudinaryDeleteImage(public_id);

    await Level.findOneAndDelete({ _id: id });

    res.status(200).json({
        status: "success",
        message: "Level deleted successfully",
    });
});