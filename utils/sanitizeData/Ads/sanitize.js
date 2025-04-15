const asyncHandler = require("express-async-handler");

/**********************************
 * @route /api/v1/levels/
 * @desc sanitize levels
 ***********************************/

exports.sanitizeOne = asyncHandler(async (ad) => {
    return {
        id: ad._id,
        head: ad.head,
        body: ad.body,
        page: ad.page,
        url: ad.url,
        isActive: ad.isActive,
        createdAt: ad.createdAt
    };
});

exports.sanitizeGets = asyncHandler(async (ads) => {
    return (
        ads.map((ad) => {
            return {
                id: ad._id,
                head: ad.head,
                body: ad.body,
                page: ad.page,
                url: ad.url,
                isActive: ad.isActive,
                createdAt: ad.createdAt
            };
        })
    );
});