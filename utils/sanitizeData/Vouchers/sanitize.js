const asyncHandler = require("express-async-handler");
/**********************************
 * @route /api/v1/vouchers/
 * @desc sanitize vouchers
 ***********************************/

exports.sanitizeVouchers = asyncHandler(async (vouchers) => {
    return (
        vouchers.map((voucher) => {
            return {
                id: voucher._id,
                price: voucher.price,
                voucher: voucher.voucher,
                isActive: voucher.isActive,
                isReserved: voucher.isReserved,
            };
        })
    );
});

exports.sanitizeVoucher = asyncHandler(async (voucher) => {
    return {
        id: voucher._id,
        price: voucher.price,
        voucher: voucher.voucher,
        isActive: voucher.isActive,
        isReserved: voucher.isReserved,
    };
});