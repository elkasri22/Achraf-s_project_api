const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const Payment = require("../Models/payment.model");
const sanitize = require("../utils/sanitizeData/Payment/sanitize");
const TypePayment = require("../Models/typeMethodPayment.model");

/**
 * @desc GET PAYMENT METHODs
 * @route /api/v1/payments/
 * @method GET
 * @access private
 */
exports.gets = asyncHandler(async (req, res, next) => {
  const payments = await Payment.find();

  const data = await sanitize.sanitizePayments(payments);

  res.status(200).json({ status: "success", data });
});

/**
 * @desc CREATE PAYMENT METHOD
 * @route /api/v1/payments/
 * @method POST
 * @access private (admin)
 */
exports.createPaymentMethod = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  const check_payment = await Payment.findOne({ name });

  if (check_payment) {
    return next(new ApiError(400, "Payment method already exists!!"));
  }

  const enter = req.body["enter[]"].split(",");

  let newPaymentMethod = {
    name,
    enter,
    type: null,
  };

  const payment = await new Payment(newPaymentMethod);

  await payment.save();

  res.status(201).json({
    status: "success",
    message: "Payment method created successfully",
  });
});

/**
 * @desc UPDATE PAYMENT METHOD
 * @route /api/v1/payments/:id
 * @method PUT
 * @access private (admin)
 */
exports.UpdatePaymentMethod = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const paymentMethod = await Payment.findOne({ _id: id });

  const { name } = req.body;

  const enter = req.body["enter[]"]?.split(",");

  if (!name && !enter) {
    return next(new ApiError(400, "You need to enter at least one field!!"));
  }

  if (!paymentMethod) {
    return next(new ApiError(404, "Payment method does not exist!!"));
  }

  let updatePaymentMethod = {};

  if (name) updatePaymentMethod.name = name;
  if (enter) updatePaymentMethod.enter = enter;

  const updatedPaymentMethod = await Payment.findOneAndUpdate(
    { _id: id },
    updatePaymentMethod,
    {
      new: true,
    }
  );

  const data = await sanitize.sanitizePayment(updatedPaymentMethod);

  res.status(200).json({
    status: "success",
    message: "Payment method updated successfully",
    data,
  });
});

/**
 * @desc GET PAYMENT METHOD
 * @route /api/v1/payments/:id
 * @method GET
 * @access private
 */
exports.GetPaymentMethod = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const paymentMethod = await Payment.findOne({ _id: id });

  if (!paymentMethod) {
    return next(new ApiError(404, "Payment method does not exist!!"));
  }

  const data = await sanitize.sanitizePayment(paymentMethod);

  res.status(200).json({
    status: "success",
    data,
  });
});

/**
 * @desc DELETE PAYMENT METHOD
 * @route /api/v1/payments/:id
 * @method DELETE
 * @access private (admin)
 */
exports.DeletePaymentMethod = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const paymentMethod = await Payment.findOne({ _id: id });

  if (!paymentMethod) {
    return next(new ApiError(404, "Payment method does not exist!!"));
  }

  await Payment.findByIdAndDelete(id).exec();

  await TypePayment.deleteMany({ with: id });

  res.status(200).json({
    status: "success",
    message: "Payment method deleted successfully",
  });
});

/**
 * @desc CREATE TYPE PAYMENT METHOD
 * @route /api/v1/payments/:id
 * @method POST
 * @access private (admin)
 */
exports.CreateTypePaymentMethod = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const { name, price } = req.body;

  const newTypePaymentMethod = await new TypePayment({
    name,
    price,
    with: id,
  });

  await newTypePaymentMethod.save();

  res.status(201).json({
    status: "success",
    message: "Type payment method created successfully",
  });
});

/**
 * @desc UPDATE TYPE PAYMENT METHOD
 * @route /api/v1/payments/:id/edit-type/:typeId
 * @method PUT
 * @access private (admin)
 */
exports.UpdateTypePaymentMethod = asyncHandler(async (req, res, next) => {
  const { id, typeId } = req.params;

  const { name, price } = req.body;

  if (!name && !price) {
    return next(new ApiError(400, "You need to enter at least one field!!"));
  }

  const TypePaymentMethods = await TypePayment.findOne({
    with: id,
    _id: typeId,
  });

  if (!TypePaymentMethods) {
    return next(new ApiError(404, "Type payment method does not exist!!"));
  }

  let updateType = {};

  if (name) updateType.name = name;
  if (price) updateType.price = price;

  await TypePayment.findByIdAndUpdate(typeId, updateType, { new: true }).exec();

  res.status(200).json({
    status: "success",
    message: "Type payment method updated successfully",
  });
});

/**
 * @desc GET ONE TYPE PAYMENT METHOD
 * @route /api/v1/payments/:id/get-type/:typeId
 * @method GET
 * @access private
 */
exports.GetOneTypePaymentMethod = asyncHandler(async (req, res, next) => {
  const { id, typeId } = req.params;

  // return price, name, _id, with
  const TypePaymentMethod = await TypePayment.findOne({
    with: id,
    _id: typeId,
  }).select("name price _id with");

  if (!TypePaymentMethod) {
    return next(new ApiError(404, "Type payment method does not exist!!"));
  }

  res.status(200).json({
    status: "success",
    data: TypePaymentMethod,
  });
});

/**
 * @desc DELETE TYPE PAYMENT METHOD
 * @route /api/v1/payments/:id/delete-type/:typeId
 * @method DELETE
 * @access private (admin)
 */
exports.DeleteTypePaymentMethod = asyncHandler(async (req, res, next) => {
  const { id, typeId } = req.params;

  const TypePaymentMethod = await TypePayment.findOne({
    with: id,
    _id: typeId,
  });

  if (!TypePaymentMethod) {
    return next(new ApiError(404, "Type payment method does not exist!!"));
  }

  await TypePayment.findByIdAndDelete(typeId).exec();

  res.status(200).json({
    status: "success",
    message: "Type payment method deleted successfully",
  });
});

/**
 * @desc GET TYPE PAYMENTS OF PAYMENT METHOD
 * @route /api/v1/payments/:id/with/:typeId
 * @method GET
 * @access private
 */
exports.GetTypePaymentMethodWithPaymentMethod = asyncHandler(
    async (req, res, next) => {
    const { id } = req.params;

    // return price, name, _id, with
    const TypePaymentMethod = await TypePayment.find({ with: id }).select(
        "name price _id with"
    );

    if (!TypePaymentMethod) {
        return next(new ApiError(404, "Type payment method does not exist!!"));
    }

        res.status(200).json({
            status: "success",
            data: TypePaymentMethod,
        });
    }
);