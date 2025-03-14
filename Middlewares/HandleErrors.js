const ApiError = require("../utils/ApiError");

const NotFound = (req, res,next) => {
    const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
    next(error);
};

const ErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") sendErrorDev(err, req, res, next); 
    else if (process.env.NODE_ENV === "production") sendErrorProd(err, req, res, next);
};

const sendErrorDev = (err, req, res, next) => {
    return res.status(err.statusCode).json({
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (err, req, res, next) => {
    return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
};

module.exports = {
    NotFound,
    ErrorHandler
}