const asyncHandler = require("express-async-handler");
const Voucher = require("../Models/vouchers.model");
const ApiError = require("../utils/ApiError");
const { v4: uuidv4 } = require("uuid");
const sanitize = require("../utils/sanitizeData/Vouchers/sanitize");
const maskVoucherCode = require("../utils/maskVoucherCode");

/**
 * @desc GET VOUCHERS
 * @route /api/v1/vouchers/
 * @method GET
 * @access private (admin)
 */
exports.gets = asyncHandler(async (req, res, next) => {
  let { price, isActive, isReserved, page, limit } = req.query;

  if (!page) page = 1;
  if (!limit) limit = process.env.DEFAULT_LENGTH_ITEMS;

  const offset = (page - 1) * limit;

  let vouchers = await Voucher.find().skip(offset).limit(limit);
  let countDocuments = await Voucher.find().countDocuments();

  if (price) {
    vouchers = await Voucher.find({ price }).skip(offset).limit(limit);
    countDocuments = await Voucher.find({ price }).countDocuments();
  }
  if (isActive) {
    vouchers = await Voucher.find({ isActive }).skip(offset).limit(limit);
    countDocuments = await Voucher.find({ isActive }).countDocuments();
  }
  if (isReserved) {
    vouchers = await Voucher.find({ isReserved }).skip(offset).limit(limit);
    countDocuments = await Voucher.find({ isReserved }).countDocuments();
  }

  const data = await sanitize.sanitizeVouchers(vouchers);

  const length = data.length;

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
 * @desc CREATE VOUCHER
 * @route /api/v1/vouchers/
 * @method POST
 * @access private (admin)
 */
exports.create = asyncHandler(async (req, res, next) => {
  const { price, isActive } = req.body;

  const voucherCode = uuidv4().replace(/-/g, "").slice(0, 15); // generate 6-digit UUID

  const voucher = await new Voucher({
    voucher: voucherCode,
    price,
    isActive,
  });

  const saveVoucher = await voucher.save();

  const data = await sanitize.sanitizeVoucher(saveVoucher);

  res.status(201).json({
    status: "success",
    data,
  });
});

/**
 * @desc UPDATE VOUCHER
 * @route /api/v1/vouchers/:id
 * @method PUT
 * @access private (admin)
 */
exports.update = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { price, isActive } = req.body;

  if (!price && !isActive) {
    return next(
      new ApiError(400, "Please provide at least one field to update")
    );
  }

  const voucher = await Voucher.findOne({ _id: id });

  if (!voucher) {
    return next(new ApiError(404, "Voucher does not exist!!"));
  }

  const update_voucher = {};

  if (price) update_voucher.price = price;
  if (isActive) update_voucher.isActive = isActive;

  const saveVoucher = await Voucher.findOneAndUpdate(
    { _id: id },
    update_voucher,
    {
      new: true,
    }
  );

  const data = await sanitize.sanitizeVoucher(saveVoucher);

  res.status(200).json({
    status: "success",
    data,
  });
});

/**
 * @desc GET VOUCHER
 * @route /api/v1/vouchers/:id
 * @method GET
 * @access private (admin)
 */
exports.getOne = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const voucher = await Voucher.findOne({ _id: id });

  if (!voucher) {
    return next(new ApiError(404, "Voucher does not exist!!"));
  }

  const data = await sanitize.sanitizeVoucher(voucher);

  res.status(200).json({ status: "success", data });
});

/**
 * @desc DELETE VOUCHER
 * @route /api/v1/vouchers/:id
 * @method DELETE
 * @access private (admin)
 */
exports.delete = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const voucher = await Voucher.findOne({ _id: id });

  if (!voucher) {
    return next(new ApiError(400, "Voucher isn't exist!!"));
  }

  await Voucher.findByIdAndDelete(id);

  res
    .status(200)
    .json({ status: "success", message: "Voucher deleted successfully" });
});

/**
 * @desc POST GIVE MY GIFT AND DELETE IT
 * @route /api/v1/vouchers/claim-my-gift
 * @method POST
 *      AND
 * @method DELETE
 * @access private
 */
exports.giveMyGift = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const level_name = user.score.level.name;

  if (level_name == "BRONZE") {
    return next(new ApiError(400, "You are not eligible to claim a gift!!"));
  }

  const isTakeGift = user.isTakeGift;

  if (isTakeGift) {
    return next(new ApiError(400, "You have already claimed a gift!!"));
  };

  const voucherCode = uuidv4().replace(/-/g, "").slice(0, 15); // generate 6-digit UUID

  let id_voucherReserved = user.score.level.id_voucherReserved;

  if (!id_voucherReserved) {
    const voucher = await new Voucher({
      voucher: voucherCode,
      price: 1,
      isActive: true,
      isReserved: true,
    });

    await voucher.save();

    user.score.level.id_voucherReserved = voucher._id;

    user.score.level.length_show += 5;

    const gift = await maskVoucherCode(voucher.voucher, user.score.level.length_show);

    user.score.level.my_gift_voucher = gift;
    
    await user.save();

    return res.status(200).json({ status: "success", message: "Voucher created successfully" });
  };

  const voucher = await Voucher.findOne({ _id: id_voucherReserved });

  if (level_name == "SILVER") {
    user.score.level.length_show = 5;

    const gift = await maskVoucherCode(voucher.voucher, user.score.level.length_show);

    user.score.level.my_gift_voucher = gift;

    await user.save();

    return res.status(200).json({ status: "success", message: "Voucher created successfully" });

  } else if (level_name == "GOLDEN") {

    user.score.level.length_show = 10;

    const gift = await maskVoucherCode(voucher.voucher, user.score.level.length_show);

    user.score.level.my_gift_voucher = gift;

    await user.save();

    return res.status(200).json({ status: "success", message: "Voucher created successfully" });

  } else if (level_name == "DIAMOND") {

    user.score.level.length_show = 15;
    user.isTakeGift = true;

    const gift = await maskVoucherCode(voucher.voucher, user.score.level.length_show);

    user.score.level.my_gift_voucher = gift;

    await user.save();

    return res.status(200).json({ status: "success", message: "Voucher created successfully" });
  };
});


/**
 * @desc POST GET VALUE VOUCHER AND DELETE IT
 * @route /api/v1/vouchers/get-value-voucher
 * @method POST
 *      AND
 * @method DELETE
 * @access private
 */
exports.getValueVoucher = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const voucherCode = req.body.voucher;

  const id_voucherReserved = user.score.level.id_voucherReserved;

  let voucher = await Voucher.findOne({voucher: voucherCode});

  if (!voucher)
    return next(new ApiError(404, "Voucher isn't exist or has been used!!"));

  const price = voucher.price;
  
  const pointsYouLost = 100 * price;

  if(user.score.AccountBalance.points < pointsYouLost) return next(new ApiError(400, "You don't have enough points to redeem this voucher!!"));

  user.score.AccountBalance.dollars += price;

  user.score.AccountBalance.points -= pointsYouLost;

  if(id_voucherReserved == voucher._id) user.score.level.id_voucherReserved = null;

  await user.save();

  res.status(200).json({ status: "success", message: "The value of the voucher has been transferred to the balance in your account." });

  await Voucher.findByIdAndDelete(voucher._id).exec();
  return;
});