const joi = require("joi");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const Payment = require("../Models/payment.model");
const TypePayment = require("../Models/typeMethodPayment.model");

exports.CreateRequestToWithdrawTheBalanceValidation = asyncHandler(async (req, res, next) => {
    const schema = joi.object({
        id_payment_method: joi.objectId().required(),
        type: joi.objectId(),
        choose: joi.string().trim().optional(),
        price: joi.number().min(1).optional(),
        email: joi.string().trim().lowercase().email().optional(),
        game_id: joi.string().trim().optional(),
        password: joi.string().trim().optional(),
        username: joi.string().trim().optional(),
    });

    const { value, error } = schema.validate(req.body);

    if(value?.id_payment_method){
        const check_payment = await Payment.findOne({ _id: value.id_payment_method });

        const typeMethodPayment = await TypePayment.find({ with: value.id_payment_method });

        if(typeMethodPayment.length > 0 && !value.type){
            return next(new ApiError(400, "Type payment method is required!!"));
        };

        const enter = check_payment.enter;

        for(let rule of enter){
            if(!value[rule]){
                return next(new ApiError(400, `${rule} is required`));
            };
        };

        if(value?.type){
            const chooseIt = await TypePayment.findOne({with: value.id_payment_method, _id: value.type });
            req.body.choose = chooseIt.name;
            req.body.price = chooseIt.price;
        }else {
            req.body.choose = check_payment.name;
            if(!value.price) return next(new ApiError(400, "Price is required, how much you want to withdraw!!"));
        };
    };

    if (error) {
        return next(new ApiError(400, error.details[0].message));
    }

    next();
});

exports.UpdateRequestStatusToWithdrawTheBalanceValidation = asyncHandler(async (req, res, next) => {
    const schema = joi.object({
        name: joi.string().trim().lowercase().required(),
        color: joi.string().trim().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return next(new ApiError(400, error.details[0].message));
    }

    next();
});