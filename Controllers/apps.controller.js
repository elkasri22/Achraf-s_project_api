const asyncHandler = require("express-async-handler");
const App = require("../Models/apps.model");
const ApiError = require("../utils/ApiError");

/**
 * @desc CREATE APP
 * @route /api/v1/apps
 * @method POST
 * @access private (admin)
 */
exports.create = asyncHandler(async (req, res, next) => {
    const { title, type, icon_app, bg_app, content, rating, size, download, developer, category, trending , slider, it, key } = req.body;

    const checkApp = await App.findOne({ title });

    if (checkApp) {
        return next(new ApiError(400, "App already exists!!"));
    };

    const supportedDevices = req.body["supportedDevices[]"]?.split(",");

    const app = {
        title,
        type,
        icon_app,
        bg_app,
        content,
        rating,
        size,
        download,
        developer,
        category,
        trending,
        slider,
        supportedDevices,
    };

    if (it) app.it = it;
    if (key) app.key = key;

    const saveApp = await new App({
        ...app
    });

    await saveApp.save();

    res.status(200).json({
        status: "success",
        message: "App created successfully",
    });
});

/**
 * @desc GET APPS
 * @route /api/v1/apps
 * @method GET
 * @access public
 */
exports.gets = asyncHandler(async (req, res, next) => {
    let { page, limit, category } = req.query;

    if (!page) page = 1;
    if (!limit) limit = process.env.DEFAULT_LENGTH_ITEMS;

    const offset = (page - 1) * limit;

    let data = await App.find().sort({ createdAt: -1})
        .skip(offset)
        .limit(limit)
        .select("-createdAt -updatedAt -__v");

    let countDocuments = await App.find().sort({ createdAt: -1 }).countDocuments();

    if(category){
        data = await App.find({category}).sort({ createdAt: -1})
            .skip(offset)
            .limit(limit)
            .select("-createdAt -updatedAt -__v");

        countDocuments = await App.find({category}).sort({ createdAt: -1 }).countDocuments();
    }

    const result = data.length;

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
        data,
    });
});

/**
 * @desc UPDATE APP
 * @route /api/v1/apps
 * @method PUT
 * @access private (admin)
 */
exports.update = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const supportedDevices = req.body["supportedDevices[]"]?.split(",");

    if(supportedDevices) req.body.supportedDevices = supportedDevices;

    const result = await App.findOne({ _id: id });

    if (!result) {
        return next(new ApiError(404, "App does not exist!!"));
    };

    await App.findOneAndUpdate({ _id: id }, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: "success",
        message: "App updated successfully",
    });
});

/**
 * @desc GET A APP
 * @route /api/v1/apps/:id
 * @method GET
 * @access public
 */
exports.getOne = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const result = await App.findOne({ _id: id }).select("-createdAt -updatedAt -__v");

    if (!result) {
        return next(new ApiError(404, "App does not exist!!"));
    };

    res.status(200).json({
        status: "success",
        data: result,
    });
});

/**
 * @desc DELETE A APP
 * @route /api/v1/app/:id
 * @method DELETE
 * @access private (admin)
 */
exports.delete = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const result = await App.findOne({ _id: id });

    if (!result) {
        return next(new ApiError(404, "App does not exist!!"));
    };

    await App.findOneAndDelete({ _id: id });

    res.status(200).json({
        status: "success",
        message: "App deleted successfully",
    });
});