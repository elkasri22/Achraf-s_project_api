const asyncHandler = require("express-async-handler");
const Tokens = require('csrf');
const ApiError = require("../utils/ApiError");
const tokens = new Tokens();
const secret = tokens.secretSync(process.env.SECRET_CSRF);

/**
 * @desc GET CSRF TOKEN
 * @route /api/v1/csrf-token
 * @method GET
 * @access public
 */
const csrfTokenController = asyncHandler(async (req, res, next) => {
    const token = tokens.create(secret);

    if(!token) {
        return next(new ApiError(400, "Something went wrong!!"));
    }

    res.status(200).json({ csrfToken: token});
});

module.exports = {
    tokens,
    secret,
    csrfTokenController,
};