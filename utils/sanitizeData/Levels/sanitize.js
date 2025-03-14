const asyncHandler = require("express-async-handler");
/**********************************
 * @route /api/v1/levels/
 * @desc sanitize levels
 ***********************************/

exports.sanitizeLevel = asyncHandler(async (level) => {
    return {
        id: level._id,
        name: level.name,
        image: level?.image?.url,
        plus: level.plus,
        min: level.min,
        TransitionPoints: level.TransitionPoints,
    };
});

exports.sanitizeGets = asyncHandler(async (levels) => {
    return (
        levels.map((level) => {
            return {
                id: level._id,
                name: level.name,
                image: level?.image?.url,
                plus: level.plus,
                min: level.min,
                TransitionPoints: level.TransitionPoints,
            };
        })
    );
});