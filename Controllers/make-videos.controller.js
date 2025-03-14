const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const MakeVideo = require("../Models/makeVideos.model");
const sanitize = require("../utils/sanitizeData/MakeVideos/sanitize");
const path = require("path");
const fs = require("fs");
const {
    cloudinaryUploadImage,
} = require("../utils/cloudinary");
const { v4: uuidv4 } = require("uuid");
const maskVoucherCode = require("../utils/maskVoucherCode");
const Voucher = require("../Models/vouchers.model");
const SendEmailMessage = require("../utils/sendEmailMessage");
const User = require("../Models/users.model");

/**
 * @desc CREATE MAKE VIDEOS
 * @route /api/v1/make-videos/
 * @method POST
 * @access private
 */
exports.create = asyncHandler(async (req, res, next) => {
    const { url_video } = req.body;

    const checkMakeVideo = await MakeVideo.findOne({ url_video });

    if (checkMakeVideo) {
        return next(new ApiError(400, "URL video is already used!!"));
    }

    const { id } = req.user;

    const imagePath = path.join(__dirname, "../uploads", req.file.filename);

    // upload image to cloudinary
    const result = await cloudinaryUploadImage(imagePath);

    const newMakeVideo = {
        user_id: id,
        url_video,
        screenshot: {
        url: result.secure_url,
        public_id: result.public_id,
        },
    };

    const makeVideo = await new MakeVideo({
        ...newMakeVideo,
    });

    await makeVideo.save();

    const data = await sanitize.sanitizeMakeVideo(makeVideo);

    await fs.unlinkSync(imagePath);

    res.status(201).json({
        status: "success",
        data,
    });
});

/**
 * @desc GET MAKE VIDEOS
 * @route /api/v1/make-videos/
 * @method GET
 * @access private (admin)
 */
exports.gets = asyncHandler(async (req, res, next) => {
    let { page, limit } = req.query;

    if (!page) page = 1;
    if (!limit) limit = process.env.DEFAULT_LENGTH_ITEMS;

    const offset = (page - 1) * limit;

    let makeVideos = await MakeVideo.find({ done: { $ne: true }, user_id: { $ne: null } })
        .populate({
            path: "user_id",
            select: "score?.level?.points email",
        })
        .skip(offset)
        .limit(limit);
    
    const rankUsersByPoints = (makeVideos) => {
        const rankedUsers = makeVideos.reduce((acc, current) => {
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

    const finalResult = await rankUsersByPoints(makeVideos);

    const data = await sanitize.sanitizeMakeVideos(finalResult);

    const length = data.length;

    const countDocuments = await MakeVideo.find({done: {$ne: true}}).countDocuments();

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
 * @desc UPDATE STATUS MAKE VIDEOS
 * @route /api/v1/make-videos/:id
 * @method PUT
 * @access private (admin)
 */
exports.update = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const FindMakeVideo = await MakeVideo.findById(id).populate({
            path: "user_id",
            select: "score.level.points email",
        });

    if (!FindMakeVideo || FindMakeVideo.done) {
        return next(new ApiError(404, "This request isn't exist or already done!!"));
    }

    let { name, color, pointsVideos, isActiveVoucher, price } = req.body;

    if(isActiveVoucher) isActiveVoucher = JSON.parse(isActiveVoucher);

    if (isActiveVoucher) {
        const voucherCode = uuidv4().replace(/-/g, "").slice(0, 15); // generate 6-digit UUID

        const newVoucher = await new Voucher({
            voucher: voucherCode,
            price,
            isActive: true,
            isReserved: true
        });
        
        const saveVoucher = await newVoucher.save();

        const voucher = await maskVoucherCode(saveVoucher.voucher, 15);

        const htmlTemplate = `
            <h6>Congratulations, you have a new voucher</h6>
            <p>Redeem this voucher in your account to get the equivalent dollar value!</p>
            <b style="text-decoration: underline;">
                Your voucher code is: ${voucher}
            </b>
        `;

        await SendEmailMessage(FindMakeVideo.user_id.email, "Congratulations, you have a new voucher.", htmlTemplate);

        const user = await User.findById(FindMakeVideo.user_id._id);

        user.notifications.push("You have received a new voucher check your email!!");

        await user.save();

        FindMakeVideo.status.name = name;
        FindMakeVideo.status.color = color;
        FindMakeVideo.done = true;
        FindMakeVideo.voucher = voucher;

        await MakeVideo.findByIdAndUpdate(id, FindMakeVideo);

        return res.status(200).json({
                    status: "success",
                    message: "Voucher sent successfully!!"
                });
    };

    if(pointsVideos){
        const user = await User.findById(FindMakeVideo.user_id._id);
        user.score.AccountBalance.pointsVideos += +pointsVideos;
        user.notifications.push(`You have received ${pointsVideos} points for making videos!!`);
        await user.save();
        FindMakeVideo.done = true;
    };

    if(name == "rejected") {
        FindMakeVideo.done = true;
        FindMakeVideo.status.name = name;
        FindMakeVideo.status.color = color;
    
        await MakeVideo.findByIdAndUpdate(id, FindMakeVideo);
    
        return res.status(200).json({
            status: "success",
            message: "Change status successfully!!",
        });
    };

    FindMakeVideo.status.name = name;
    FindMakeVideo.status.color = color;

    await MakeVideo.findByIdAndUpdate(id, FindMakeVideo);

    if(pointsVideos){
        return res.status(200).json({
            status: "success",
            message: "Points videos sent successfully!!",
        });
    };

    return res.status(200).json({
        status: "success",
        message: "Change status successfully!!",
    });
});

/**
 * @desc ME
 * @route /api/v1/make-video/history
 * @method GET
 * @access private
 */
exports.history = asyncHandler(async (req, res, next) => {
    const { id } = req.user;

    let { page, limit } = req.query;

    if (!page) page = 1;
    if (!limit) limit = process.env.DEFAULT_LENGTH_ITEMS;

    const offset = (page - 1) * limit;

    const histories = await MakeVideo.find({ user_id: id })
        .skip(offset)
        .limit(limit);

    const data = await sanitize.sanitizeMakeVideosInHistories(histories);

    const length = data.length;

    const countDocuments = await MakeVideo.find({ user_id: id }).countDocuments();

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