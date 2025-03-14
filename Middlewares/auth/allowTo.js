const ApiError = require("../../utils/ApiError");

const allowTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, "You are not allowed to access this route"));
        }
        next();
    };
};

module.exports = allowTo;