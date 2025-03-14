const asyncHandler = require("express-async-handler");
/**********************************
 * @route /api/v1/auth/
 * @desc sanitize auth
 ***********************************/

exports.sanitizeRegister = asyncHandler(async (user) => {
    return {
        username: user.username,
        email: user.email,
        country: user.country,
        myReferralCode: user.myReferralCode,
        avatar: user?.avatar?.url,
    };
});

exports.sanitizeLogin = asyncHandler(async (user) => {
    return {
        id: user._id,
        username: user.username,
        email: user.email,
        country: user.country,
        myReferralCode: user.myReferralCode,
        avatar: user?.avatar?.url,
        role: user.role,
        score: user.score,
        isOnline: user.isOnline,
        isTakeGift: user.isTakeGift,
        countRegisteredWithMe: user.countRegisteredWithMe,
        rewardClaimedWithMe: user.rewardClaimedWithMe,
        notifications: user.notifications,
        referredBy: user.referredBy,
    };
});