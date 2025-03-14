const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const WithdrawTheBalance = require("../Models/withdrawTheBalance");
const User = require("../Models/users.model");
const sanitize = require("../utils/sanitizeData/WithdrawTheBalance/sanitize");
const SendEmailMessage = require("../utils/sendEmailMessage");
const Voucher = require("../Models/vouchers.model");
const maskVoucherCode = require("../utils/maskVoucherCode");
const uuidv4 = require("uuid").v4;

/**
 * @desc SEND REQUEST TO WITHDRAW THE BALANCE
 * @route /api/v1/withdrawTheBalance/
 * @method POST
 * @access private
 */
exports.requestToWithdrawTheBalance = asyncHandler(async (req, res, next) => {
    const {choose,price, email, game_id, password, username} = req.body;

    const user_id = req.user.id;

    const check_user = await User.findOne({_id: user_id});

    const user_dollars = check_user.score.AccountBalance.dollars - price;

    if(user_dollars < 0){
        return next(new ApiError(400, "You don't have enough balance to withdraw."));
    };

    let new_request = {
        user_id,
        choose,
        price,
    };

    if(email) new_request.email = email;
    if(game_id) new_request.game_id = game_id;
    if(password) new_request.password = password;
    if(username) new_request.username = username;
    if(price) new_request.price = price;

    await new WithdrawTheBalance(new_request).save();

    check_user.score.AccountBalance.dollars -= price;

    await check_user.save();

    res
        .status(201)
        .json({
            status: "success",
            message: "Request to withdraw the balance sent successfully, Your request will be reviewed.",
        });
});

/**
 * @desc GET REQUESTS TO WITHDRAW THE BALANCE
 * @route /api/v1/withdrawTheBalance/
 * @method get
 * @access private (admin)
 */
exports.GetRequestsToWithdrawTheBalance = asyncHandler(async (req, res, next) => {
    let { page, limit } = req.query;

    if (!page) page = 1;
    if (!limit) limit = process.env.DEFAULT_LENGTH_ITEMS;

    const offset = (page - 1) * limit;
    
    const requests = await WithdrawTheBalance.find({ done: { $ne: true }, user_id: { $ne: null } })
        .populate({
            path: "user_id",
            select: "score.level.points",
        })
        .skip(offset)
        .limit(limit);

    const rankUsersByPoints = (requests) => {
        const rankedUsers = requests.reduce((acc, current) => {
        const points = current.user_id.score.level.points;
        if (!acc[points]) {
            acc[points] = [];
        }
        acc[points].push(current);
        return acc;
        }, {});

        const sortedUsers = Object.keys(rankedUsers)
        .sort((a, b) => b - a)
        .map((key) => rankedUsers[key]);

        return sortedUsers.flat();
    };

    const finalResult = await rankUsersByPoints(requests);

    const data = await sanitize.sanitizeWithdrawTheBalances(finalResult);

    const length = data.length;

    const countDocuments = await WithdrawTheBalance.find({done: {$ne: true}}).countDocuments();

    const numberOfPages = Math.ceil(countDocuments / limit);

    const pageNow = Number(page) || 1;

    res.status(200).json({
        status: "success",
        results: length,
        pagination: {
            numberOfPages,
            currentPage: pageNow,
        },
        data,
    });
});

/**
 * @desc UPDATE STATUS REQUEST TO WITHDRAW THE BALANCE
 * @route /api/v1/withdrawTheBalance/:id
 * @method PUT
 * @access private (admin)
 */
exports.requestStatusUpdateToWithdrawTheBalance = asyncHandler(async (req, res, next) => {
    let { name, color } = req.body;

    const { id } = req.params;

    const checkRequest = await WithdrawTheBalance.findById(id).populate({
        path: "user_id",
        select: "score.level.points",
    });

    if (!checkRequest) {
        return next(new ApiError(404, "Request to withdraw the balance does not exist!!"));
    }

    checkRequest.status.name = name;
    checkRequest.status.color = color;
    
    if(name == "paid"){
        const user = await User.findById(checkRequest.user_id._id);

        user.notifications.push("Your request to withdraw the balance has been paid!!");
        
        if(user.referredBy && user.score.AccountBalance.countMyRewardClaimed == 0){
            const voucherCode = uuidv4().replace(/-/g, "").slice(0, 15); // generate 6-digit UUID

            const voucher = await new Voucher({
                voucher: voucherCode,
                price: 3,
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

            user.notifications.push(`You got a voucher because you register with referral code, voucher code is ${result_voucher} and sent it also to your email !!`);
        };

        if(!user.gift_three_claims_done && user.rewardClaimedWithMe == 3){
            const voucherCode = uuidv4().replace(/-/g, "").slice(0, 15); // generate 6-digit UUID

            const voucher = await new Voucher({
                voucher: voucherCode,
                price: 3,
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

            user.notifications.push(`You got a voucher because you 3 friends claimed with your referral code, voucher code is ${result_voucher} and sent it also to your email !!`);

            user.gift_three_claims_done = true;
        };

        user.score.AccountBalance.countMyRewardClaimed += 1;

        await user.save();
    }else if(name == "rejected"){
        checkRequest.done = true;
        const user = await User.findById(checkRequest.user_id._id);

        user.score.AccountBalance.dollars += checkRequest.price;

        user.notifications.push("Your request to withdraw the balance has been rejected!!");

        await user.save();
    };

    if(name == "paid"){
        checkRequest.done = true;
    };

    await checkRequest.save();

    res
        .status(200)
        .json({
            status: "success",
            message: "Request to withdraw the balance updated successfully!!",
        });
});

/**
 * @desc GET MY REQUESTS TO WITHDRAW THE BALANCE
 * @route /api/v1/withdrawTheBalance/history
 * @method GET
 * @access private
 */
exports.GetMyRequestsToWithdrawTheBalance = asyncHandler(async (req, res, next) => {
    const { id } = req.user;

    const requests = await WithdrawTheBalance.find({ user_id: id }).select("-__v -createdAt -updatedAt -user_id -done");

    if (!requests) {
        return next(new ApiError(404, "Request to withdraw the balance does not exist!!"));
    }

    res
        .status(200)
        .json({
            status: "success",
            data: requests
        });
});