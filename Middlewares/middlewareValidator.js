const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// @desc  Finds the validation errors in this request and wraps them in an object with handy functions
const validatorMiddleware = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        if(errors.array()[0].path == 'id'){
            return next(new ApiError(400, errors.array()[0].msg));
        }else return next(new ApiError(400, errors.array()[1].msg));
    }
    next();
};

module.exports = validatorMiddleware;