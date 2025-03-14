const asyncHandler = require("express-async-handler");
/**********************************
 * @route /api/v1/withdrawTheBalance/
 * @desc sanitize withdrawTheBalance
 ***********************************/

exports.sanitizeWithdrawTheBalances = asyncHandler(async (withdrawTheBalances) => {
    return (
        withdrawTheBalances.map((withdrawTheBalance) => {
            return {
                id: withdrawTheBalance._id,
                game_id: withdrawTheBalance.game_id,
                user_id: withdrawTheBalance.user_id._id,
                user_points: withdrawTheBalance.user_id.score.level.points,
                price: withdrawTheBalance.price,
                choose: withdrawTheBalance.choose,
                email: withdrawTheBalance.email,
                password: withdrawTheBalance.password,
                username: withdrawTheBalance.username,
                status: withdrawTheBalance.status,
                done: withdrawTheBalance.done,
                createdAt: withdrawTheBalance.createdAt,
                updatedAt: withdrawTheBalance.updatedAt,
            };
        })
    );
});

exports.sanitizeWithdrawTheBalance = asyncHandler(async (withdrawTheBalance) => {
    return {
        id: withdrawTheBalance._id,
        game_id: withdrawTheBalance.game_id,
        user_id: withdrawTheBalance.user_id._id,
        user_points: withdrawTheBalance.user_id.score.level.points,
        price: withdrawTheBalance.price,
        choose: withdrawTheBalance.choose,
        email: withdrawTheBalance.email,
        password: withdrawTheBalance.password,
        username: withdrawTheBalance.username,
        status: withdrawTheBalance.status,
        done: withdrawTheBalance.done,
        createdAt: withdrawTheBalance.createdAt,
        updatedAt: withdrawTheBalance.updatedAt,
    };
});