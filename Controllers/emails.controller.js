const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const Email = require("../Models/emails.model");

/**
 * @desc CREATE EMAIL
 * @route /api/v1/emails
 * @method POST
 * @access private (admin)
 */
exports.create = asyncHandler(async (req, res, next) => {
    const { url, email } = req.body;
    
    const checkEmail = await Email.findOne({ email });

    if (checkEmail) {
        return next(new ApiError(400, "Email already exists!!"));
    };

    const saveEmail = await new Email({
        url,
        email,
    });

    await saveEmail.save();

    res.status(201).json({
        status: "success",
        message: "Email created successfully",
    });
});

/**
 * @desc GET EMAIL
 * @route /api/v1/emails
 * @method GET
 * @access private (admin)
 */
exports.gets = asyncHandler(async (req, res, next) => {
    let { page, limit } = req.query;

    if (!page) page = 1;
    if (!limit) limit = process.env.DEFAULT_LENGTH_ITEMS;

    const offset = (page - 1) * limit;

    const emails = await Email.find().sort({createdAt: -1}).skip(offset)
        .limit(limit).select("-updatedAt -__v");

    const countDocuments = await Email.find().sort({ createdAt: -1 }).countDocuments();
    
    const result = emails.length;

    const numberOfPages = Math.ceil(countDocuments / limit);

    const pageNow = Number(page) || 1;

    const pagination = {
        page: pageNow,
        numberOfPages,
    };

    res.status(200).json({
        status: "success",
        result,
        pagination,
        data: emails,
    });
});

/**
 * @desc DELETE EMAIL
 * @route /api/v1/emails/:id
 * @method DELETE
 * @access private (admin)
 */
exports.delete = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const checkEmail = await Email.findOne({ _id: id });

    if (!checkEmail) {
        return next(new ApiError(400, "Email does'nt exists!!"));
    };

    await Email.findOneAndDelete({ _id: id });

    res.status(200).json({
        status: "success",
        message: "Email deleted successfully",
    });
});
