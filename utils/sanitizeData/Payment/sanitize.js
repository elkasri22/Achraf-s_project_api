const asyncHandler = require("express-async-handler");
/**********************************
 * @route /api/v1/payments/
 * @desc sanitize payments
 ***********************************/

exports.sanitizePayments = asyncHandler(async (payments) => {
    return (
        payments.map((payment) => {
            return {
                id: payment._id,
                name: payment.name,
                type: payment.type,
                enter: payment.enter
            };
        })
    );
});

exports.sanitizePayment = asyncHandler(async (payment) => {
    return {
        id: payment._id,
        name: payment.name,
        type: payment.type,
        enter: payment.enter
    };
});