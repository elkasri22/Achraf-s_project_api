const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const Voucher = require("../Models/vouchers.model");
const WithdrawThePointVideos = require("../Models/withdrawThePointVideos.model");
const User = require("../Models/users.model");
const maskVoucherCode = require("../utils/maskVoucherCode");
const SendEmailMessage = require("../utils/sendEmailMessage");
const uuidv4 = require("uuid").v4;

/**
 * @desc CREATE OFFER CONVERT POINT VIDEO TO VOUCHER
 * @route /api/v1/payments/
 * @method POST
 * @method POST
 * @access private (admin)
 */
exports.gets = asyncHandler(async (req, res, next) => {
    const data = await WithdrawThePointVideos.find().select("-__v -createdAt -updatedAt");

    res.status(200).json({ status: "success", data });
});

/**
 * @desc CREATE OFFER CONVERT POINT VIDEO TO VOUCHER
 * @route /api/v1/payments/
 * @method POST
 * @access private (admin)
 */
exports.create = asyncHandler(async (req, res, next) => {

    const { points, price} = req.body;

    const newWithdrawThePointVideos = await new WithdrawThePointVideos({
        points,
        price,
    });

    await newWithdrawThePointVideos.save();

    res.status(200).json({ status: "success", message: "Offer created successfully!!" });
});

/**
 * @desc CREATE OFFER CONVERT POINT VIDEO TO VOUCHER
 * @route /api/v1/payments/
 * @method POST
 * @access private (admin)
 */
exports.sendRequestTowWithdrawPointVideos = asyncHandler(async (req, res, next) => {

    const { points, price} = req.body;
    const { id } = req.user;

    const user = await User.findById(id);
    const userPointsVideos = user.score.AccountBalance.pointsVideos;

    if(userPointsVideos < points){
        return next(new ApiError(400, "You don't have enough points to redeem this voucher!!"));
    };

    const voucherCode = uuidv4().replace(/-/g, "").slice(0, 15); // generate 6-digit UUID

    const voucher = await new Voucher({
        voucher: voucherCode,
        price,
        isActive: true,
        isReserved: true
    });

    const saveVoucher = await voucher.save();

    const result_voucher = await maskVoucherCode(saveVoucher.voucher, 15);

    const htmlTemplate = `
        <h6>Congratulations, you have a new voucher</h6>
        <p>Redeem this voucher in your account to get the equivalent dollar value!</p>
        <b style="text-decoration: underline;">
            Your voucher code is: ${result_voucher}
        </b>
    `;

    await SendEmailMessage(user.email, "Congratulations, you have a new voucher.", htmlTemplate);

    user.notifications.push(`You have received a new voucher ${result_voucher}, and sent it also to your email!!`);

    // Decrement points
    user.score.AccountBalance.pointsVideos -= points;

    await user.save();

    res.status(200).json({ status: "success", message: "Withdraw the point videos successfully!!" });
});