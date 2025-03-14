const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../Models/users.model");
const ApiError = require("../utils/ApiError");
const path = require("path");
const fs = require("fs");
const { cloudinaryUploadImage, cloudinaryDeleteImage } = require("../utils/cloudinary");
const { generateReferralCode } = require("../utils/generateReferralCode");
const sanitize = require("../utils/sanitizeData/Auth/sanitize");
const { v4: uuidv4 } = require("uuid");
const Level = require("../Models/levels.model");
const SendEmailMessage = require("../utils/sendEmailMessage");
const MakeVideo = require("../Models/makeVideos.model");
const WithdrawTheBalance = require("../Models/withdrawTheBalance");

/**
 * @desc REGISTER
 * @route /api/v1/register
 * @method POST
 * @access public
 */
exports.register = asyncHandler(async (req, res, next) => {
  let { username, email, country, password, referredBy } = req.body;

  const check_user = await User.findOne({
    $or: [{ email: email }, { username: username }],
  });

  if (check_user) {
    return next(
      new ApiError(
        400,
        "User already exists choose another username or email!!"
      )
    );
  }

  let new_user = {
    username,
    email,
    country,
  };

  if (req.file) {
    const imagePath =
      path.join(__dirname, "../uploads", req.file.filename) || null;

    const result = await cloudinaryUploadImage(imagePath);

    new_user.avatar = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    await fs.unlinkSync(imagePath);
  }

  let user_referrer = {};

  if (referredBy) {
    user_referrer = await User.findOne({ myReferralCode: referredBy });

    if (!user_referrer) {
      return next(new ApiError(400, "Referrer does not exist!!"));
    }

    new_user.referredBy = referredBy;
  }

  // Generate referral code for each user
  new_user.myReferralCode = await generateReferralCode();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  new_user.password = hashedPassword;

  let user = await new User({
    ...new_user,
  });

  await user.save();

  if (referredBy) {
    user_referrer.countRegisteredWithMe += 1;
    user_referrer.registeredWithMe.push(user._id);
    user_referrer.score.level.points += +process.env.PLUS_LEVEL_POINTS;
    user_referrer.hideLevelPoints += +process.env.PLUS_LEVEL_POINTS;
    await user_referrer.save();
  }

  const token = jwt.sign(
    { id: user._id, isOnline: user.isOnline },
    process.env.SECRET_AUTH,
    {
      expiresIn: process.env.JWT_EXPIRE_TIME,
    }
  );

  const data = await sanitize.sanitizeRegister(user);

  res.status(201).json({ status: "success", data, token });
});

/**
 * @desc LOGIN
 * @route /api/v1/login
 * @method POST
 * @access public
 */
exports.login = asyncHandler(async (req, res, next) => {
  let { username, password } = req.body;

  let check_user = await User.findOne({ username });

  if (!check_user) {
    return next(new ApiError(401, "Invalid username or password!!"));
  }

  const isMatch = await bcrypt.compare(password, check_user.password);

  if (!isMatch) {
    return next(new ApiError(401, "Invalid username or password!!"));
  }

  check_user.isOnline = true;
  check_user.lastLogin = new Date();
  if (!check_user.lastTap) {
    check_user.lastTap = new Date();
  }

  const ids = await check_user?.registeredWithMe;

  const myReferredUsers = await User.find({ _id: { $in: ids } });
  const countMyRewardClaimed = myReferredUsers.filter(
    (user) => user.score.AccountBalance.countMyRewardClaimed > 0
  ).length;

  check_user.rewardClaimedWithMe = countMyRewardClaimed;

  const pointsUser = check_user?.score?.level?.points;

  // Find the level that the user has and return it
  const level = await Level.findOne({ min: { $lte: pointsUser } }).sort({
    min: -1,
  });
  check_user.score.level.image = level?.image?.url;
  check_user.score.level.name = level?.name;
  check_user.score.level.plus = level?.plus;

  await check_user.save();

  const user = await sanitize.sanitizeLogin(check_user);

  const token = jwt.sign(
    { id: check_user._id, isOnline: check_user.isOnline },
    process.env.SECRET_AUTH,
    {
      expiresIn: process.env.JWT_EXPIRE_TIME,
    }
  );

  res.status(200).json({ 
    status: "success", 
    data: {user},
    token,
  });
});

/**
 * @desc LOGOUT
 * @route /api/v1/logout
 * @method POST
 * @access private
 */
exports.logout = asyncHandler(async (req, res, next) => {
  const currentUser = req.user;

  currentUser.isOnline = false;

  await currentUser.save();

  res
    .status(200)
    .json({ status: "success", message: "Logged out successfully" });
});

/**
 * @desc SEND OTP
 * @route /api/v1/get-otp
 * @method POST
 * @access public
 */
exports.sendOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ApiError(404, "User does not exist!!"));
  }

  const otp = uuidv4().slice(0, 6); // generate 6-digit UUID

  const htmlTemplate = `
        <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="X-UA-Compatible" content="ie=edge" />
          <title>Static Template</title>

          <link
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
            rel="stylesheet"
          />
        </head>
        <body
          style="
            margin: 0;
            font-family: 'Poppins', sans-serif;
            background: #ffffff;
            font-size: 14px;
          "
        >
          <div
            style="
              max-width: 680px;
              margin: 0 auto;
              padding: 45px 30px 60px;
              background: #f4f7ff;
              background-image: url(https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner);
              background-repeat: no-repeat;
              background-size: 800px 452px;
              background-position: top center;
              font-size: 14px;
              color: #434343;
            "
          >
            <header>
              <table style="width: 100%;">
                <tbody>
                  <tr style="height: 0;">
                    <td style="text-align: right;">
                      <span
                        style="font-size: 16px; line-height: 30px; color: #ffffff;"
                        >${new Date().toLocaleString()}</span
                      >
                    </td>
                  </tr>
                </tbody>
              </table>
            </header>

            <main>
              <div
                style="
                  margin: 0;
                  margin-top: 70px;
                  padding: 92px 30px 115px;
                  background: #ffffff;
                  border-radius: 30px;
                  text-align: center;
                "
              >
                <div style="width: 100%; max-width: 489px; margin: 0 auto;">
                  <p
                    style="
                      margin: 0;
                      margin-top: 17px;
                      font-size: 16px;
                      font-weight: 500;
                    "
                  >
                    Hey ${user.username},
                  </p>
                  <p
                    style="
                      margin: 0;
                      margin-top: 17px;
                      font-weight: 500;
                      letter-spacing: 0.56px;
                    "
                  >
                    Hello, 
                  You are receiving this email because you requested to reset your password.
                  Please enter the following OTP to reset your password:
                  
                  <p
                    style="
                      margin: 10px 0;
                      font-size: 40px;
                      font-weight: 600;
                      letter-spacing: 25px;
                      color: #ba3d4f;
                    "
                  >${otp}</p>
          
                  This OTP is valid for 5 minutes only. If you do not enter the OTP within this time frame, you will need to request a new OTP.
                  Best regards,
                  </p>

                </div>
              </div>

            </main>
          </div>
        </body>
      </html>
  `;

  await SendEmailMessage(user.email, "Password Reset OTP", htmlTemplate);

  user.otp = otp;
  user.otpExpiresAt = Date.now() + +process.env.OTP_EXPIRE_AT;

  await user.save();

  res
    .status(200)
    .json({ status: "success", message: "Password reset otp sent" });
});

/**
 * @desc VERIFY OTP
 * @route /api/v1/verify-otp
 * @method POST
 * @access public
 */
exports.verifyOtp = asyncHandler(async (req, res, next) => {
  const { otp } = req.body;

  const user = await User.findOne({ otp });

  if (!user) {
    return next(new ApiError(404, "Otp is invalid!!"));
  }

  if (user.otpExpiresAt < Date.now()) {
    return next(new ApiError(401, "OTP has expired"));
  }

  if (user.otp !== otp) {
    return next(new ApiError(401, "Invalid OTP"));
  }

  res
    .status(200)
    .json({ status: "success", message: "OTP verified successfully" });
});

/**
 * @desc FORGOT PASSWORD
 * @route /api/v1/forgot-password
 * @method POST
 * @access public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  const user = await User.findOne({ otp: req.body.otp });

  if (!user) {
    return next(new ApiError(404, "Otp is invalid!!"));
  }

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  user.password = hash;

  user.otp = null;
  user.otpExpiresAt = null;

  await user.save();

  res
    .status(200)
    .json({ status: "success", message: "Password reset successfully" });
});

/**
 * @desc ME
 * @route /api/v1/auth/me
 * @method GET
 * @access private
 */
exports.me = asyncHandler(async (req, res, next) => {
  const { id } = req.user;

  const user = await User.findById(id);

  const ids = await user?.registeredWithMe;

  const myReferredUsers = await User.find({ _id: { $in: ids } });
  const countMyRewardClaimed = myReferredUsers.filter(
    (user) => user.score.AccountBalance.countMyRewardClaimed > 0
  ).length;

  user.rewardClaimedWithMe = countMyRewardClaimed;

  const pointsUser = user?.score?.level?.points;

  // Find the level that the user has and return it
  const level = await Level.findOne({ min: { $lte: pointsUser } }).sort({
    min: -1,
  });
  user.score.level.image = level?.image?.url;
  user.score.level.name = level?.name;
  user.score.level.plus = level?.plus;

  await user.save();

  const data = await sanitize.sanitizeLogin(user);

  res.status(200).json({ status: "success", data });
});

/**
 * @desc EDIT PROFILE
 * @route /api/v1/auth/edit-profile
 * @method PUT
 * @access private
 */
exports.editProfile = asyncHandler(async (req, res, next) => {
  const { id } = req.user;
  let { username, email, country, password } = req.body;

  const check_user = await User.findOne({_id: id});

  if (!check_user) {
    return next(
      new ApiError(
        400,
        "User isn't exist!!"
      )
    );
  };

  if(!req.file && !username && !email && !country && !password){
    return next(
      new ApiError(
        400,
        "Please provide at least one field to update!!"
      )
    );
  };

  let new_user = {};

  if (req.file) {
    const public_id = check_user?.avatar?.public_id;

    if (public_id) {
      await cloudinaryDeleteImage(public_id);
    }

    const imagePath =
      path.join(__dirname, "../uploads", req.file.filename) || null;

    const result = await cloudinaryUploadImage(imagePath);

    new_user.avatar = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    await fs.unlinkSync(imagePath);
  }

  if(username) new_user.username = username;
  if(email) new_user.email = email;
  if(country) new_user.country = country;

  if(password){

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    new_user.password = hashedPassword;
  
  };

  await User.findByIdAndUpdate(id, new_user, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: "success", message: "User updated successfully" });
});

/**
 * @desc DELETE AN ACCOUNT
 * @route /api/v1/auth/me/delete-my-account
 * @method DELETE
 * @access private
 */
exports.deleteAnAccount = asyncHandler(async (req, res, next) => {
  const { id } = req.user;

  const check_user = await User.findOne({_id: id});

  if (!check_user) {
    return next(
      new ApiError(
        400,
        "User isn't exist!!"
      )
    );
  };

  const public_id = check_user?.avatar?.public_id;

  if (public_id) {
    await cloudinaryDeleteImage(public_id);
  };

  await MakeVideo.updateMany({ user_id: id }, { $set: { user_id: null } });

  await WithdrawTheBalance.updateMany({ user_id: id }, { $set: { user_id: null } });

  await User.findByIdAndDelete(id);

  res.status(200).json({ status: "success", message: "User deleted successfully" });
});

/**
 * @desc GET ONE USER
 * @route /api/v1/auth/users/:id
 * @method GET
 * @access private
 */
exports.getOneUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const check_user = await User.findOne({_id: id});

  if (!check_user) {
    return next(
      new ApiError(
        400,
        "User isn't exist!!"
      )
    );
  };

  const data = await sanitize.sanitizeLogin(check_user);

  res.status(200).json({ status: "success", data });
});
