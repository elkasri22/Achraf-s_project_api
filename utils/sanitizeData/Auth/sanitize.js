const asyncHandler = require("express-async-handler");
/**********************************
 * @route /api/v1/auth/
 * @desc sanitize auth
 ***********************************/

exports.sanitizeLogin = asyncHandler(async (user) => {
    return {
        id: user._id,
        email: user.email,
        role: user.role,
    };
});