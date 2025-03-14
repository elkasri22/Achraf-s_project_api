const { default: mongoose } = require("mongoose");

const TypePaymentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            uppercase: true,
            max: [32, "Name type must be at most 32 characters"],
            required: [true, "Name type name is required"],
        },
        price: {
            type: Number,
            trim: true,
            required: [true, "Price is required"],
        },
        with: {
            type: mongoose.Schema.ObjectId,
            ref : "Payment",
            trim: true,
            required: [true, "Payment is required"],
        },
    },
    {
        timestamps: true,
    }
);

const TypePayment = mongoose.model("TypePayment", TypePaymentSchema);

module.exports = TypePayment;