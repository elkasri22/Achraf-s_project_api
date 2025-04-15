const asyncHandler = require("express-async-handler");
const Locker = require("../Models/locker.model");
const ApiError = require("../utils/ApiError");

/**
 * @desc Update status locker
 * @route /api/v1/locker
 * @method PUT
 * @access public
 */
const update = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const locker = await Locker.findById(id);

    if (!locker) {
        return next(new ApiError(404, "This locker does not exist!!"));
    };

    const data = await Locker.findOneAndUpdate({ _id: id }, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ status: "success", data });
});

/**
 * @desc Add locker
 * @route /api/v1/locker
 * @method PUT
 * @access public
 */
const get = asyncHandler(async (req, res, next) => {

    const locker = await Locker.find({}).limit(1);

    if (!locker) {
        return next(new ApiError(404, "New Version does not exist!!"));
    };

    res.status(200).json({ status: "success", data: locker });
});

module.exports = {
    update,
    get
};