const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const Ad = require("../Models/ads.model");
const sanitize = require("../utils/sanitizeData/Ads/sanitize");

/**
 * @desc ADD ADS
 * @route /api/v1/ads
 * @method GET
 * @access public
 */
const get = asyncHandler(async (req, res, next) => {
    const { url, page } = req.query;

    if (url && page) {
        const ads = await Ad.findOne({url, page, isActive: true});

        if (!ads) {
            return next(new ApiError(404, "Ad not found or not active!!"));
        };
        
        const data = await sanitize.sanitizeOne(ads);

        return res.status(200).json({
            status: "success",
            data,
        });
    };

    const ads = await Ad.find();

    const data = await sanitize.sanitizeGets(ads);

    res.status(200).json({
        status: "success",
        data,
    });
});

/**
 * @desc ADD ADS
 * @route /api/v1/ads
 * @method POST
 * @access private
 */
const create = asyncHandler(async (req, res, next) => {

    const { head, body, page, url, isActive } = req.body;

    const newAd = await new Ad({
        head,
        body,
        page,
        url,
        isActive
    });

    const ads = await newAd.save();

    const data = await sanitize.sanitizeOne(ads);

    res.status(201).json({
        status: "success",
        data,
    });
});

/**
 * @desc Create ads
 * @route /api/v1/ads/:id
 * @method PUT
 * @access private
 */
const update = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    
    const check = await Ad.findById(id);

    if (!check) {
        return next(new ApiError(404, "Ad does not exist!!"));
    };

    const updatedAd = await Ad.findOneAndUpdate({ _id: id }, req.body, {
        new: true,
        runValidators: true
    });

    const data = await sanitize.sanitizeOne(updatedAd);

    res.status(200).json({
        status: "success",
        data
    });
});

/**
 * @desc Delete ADS
 * @route /api/v1/ads/:id
 * @method DELETE
 * @access private
 */
const deleteAd = asyncHandler(async (req, res, next) => {

    const { id } = req.params;

    const ad = await Ad.findById(id);

    if (!ad) {
        return next(new ApiError(404, "Ad does not exist!!"));
    };

    await Ad.findOneAndDelete({ _id: id });

    res.status(204).json({status: "success"});
});


module.exports = { get, update, create, deleteAd };