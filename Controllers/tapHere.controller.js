const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const Level = require("../Models/levels.model");

/**
 * @desc POST TAP HERE
 * @route /api/v1/tapHere
 * @method POST
 * @access private
 */
const clickTapHere = asyncHandler(async (req, res, next) => {
    const user = req.user;

    const date = new Date();

    user.tapHere.day = date.toDateString();

    if(user.tapHere.day == date.toDateString() && user.tapHere.length == +process.env.COLLECT_POINTS_AT_DAY){
        return next(new ApiError(400, "You have already collected points today!!"));
    };

    user.tapHere.length += 1;
    // Add points to AccountBalance
    user.score.AccountBalance.points += user.score.level.plus;

    // Add points score level
    user.score.level.points += 1;
    user.hideLevelPoints += 1;

    // Add new date for last tap
    user.lastTap = new Date();

    const pointsUser = user?.score?.level?.points;

    // Find the level that the user has and return it
    const level = await Level.findOne({ min: { $lte: pointsUser } }).sort({min: -1});
    user.score.level.image = level?.image?.url;
    user.score.level.name = level?.name;
    user.score.level.plus = level?.plus;  

    // Add num to clicked 
    user.clicked = 1;
    await user.save();

    res.status(200).json({ success: "success", message: "Clicked successfully!!" });
});

module.exports = clickTapHere;