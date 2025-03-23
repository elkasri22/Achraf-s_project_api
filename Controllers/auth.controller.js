const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../Models/users.model");
const ApiError = require("../utils/ApiError");
const sanitize = require("../utils/sanitizeData/Auth/sanitize");
const SendEmailMessage = require("../utils/sendEmailMessage");
const uuidv4 = require("uuid").v4;

/**
 * @desc REGISTER
 * @route /api/v1/auth/register
 * @method POST
 * @access public
 */
exports.register = asyncHandler(async (req, res, next) => {
  let { email, password } = req.body;

  const check_user = await User.findOne({email});

  if (check_user) {
    return next(
      new ApiError(
        400,
        "User already exists choose another username or email!!"
      )
    );
  };

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  password = hash;

  const user = await new User({
    email,
    password,
  });

  await user.save();

  const token = jwt.sign(
    { id: user._id },
        process.env.SECRET_AUTH,
    {
      expiresIn: process.env.JWT_EXPIRE_TIME,
    }
  );

  res.status(201).json({ status: "success", data: {
    user,
  }, token });
});

/**
 * @desc LOGIN
 * @route /api/v1/auth/login
 * @method POST
 * @access public
 */
exports.login = asyncHandler(async (req, res, next) => {
  let { email, password } = req.body;
  
    // return user._id and email and role 
    const user = await User.findOne({ email }).select("-createdAt -updatedAt -__v");
  
    if (!user) {
      return next(new ApiError(404, "User does not exist!!"));
    };
  
    const verifyPassword = await bcrypt.compare(password, user.password);
  
    if (!verifyPassword) {
      return next(new ApiError(401, "Incorrect email or password!!"));
    }
  
    const token = jwt.sign(
      { id: user._id },
        process.env.SECRET_AUTH,
      {
        expiresIn: process.env.JWT_EXPIRE_TIME,
      }
    );
  
    const res_user = await sanitize.sanitizeLogin(user);
  
    res.status(200).json({ 
      status: "success", 
      data: {
        user: res_user
      },
      token,
    });
});

/**
 * @desc SEND OTP
 * @route /api/v1/auth/get-otp
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
                    Hey ${user.email},
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
 * @route /api/v1/auth/verify-otp
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

  if (!user) {
    return next(new ApiError(404, "User does not exist!!"));
  }

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

  let { email, password } = req.body;

  const check_user = await User.findOne({_id: id});

  if (!check_user) {
    return next(
      new ApiError(
        400,
        "User isn't exist!!"
      )
    );
  };

  if(!email && !password){
    return next(
      new ApiError(
        400,
        "Please provide at least one field to update!!"
      )
    );
  };

  let new_user = {};

  if(email) new_user.email = email;

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