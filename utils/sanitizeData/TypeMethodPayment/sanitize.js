const asyncHandler = require("express-async-handler");
/**********************************
 * @route /api/v1/payments/
 * @desc sanitize payments
 ***********************************/

exports.sanitizeTypePaymentMethods = asyncHandler(async (typePaymentMethods) => {
    return (
        typePaymentMethods.map((typePaymentMethod) => {
            return {
                id: typePaymentMethod._id,
                name: typePaymentMethod.name,
                price: typePaymentMethod.price,
            };
        })
    );
});