const { default: mongoose } = require("mongoose");

const PaymentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            unique: true,
            uppercase: true,
            min: [3, "Payment name must be at least 3 characters"],
            max: [32, "Payment name must be at most 32 characters"],
            required: [true, "Payment name is required"],
        },
        enter: [
            {
                type: String,
                trim: true,
                lowercase: true,
                max: [32, "Payment name must be at most 32 characters"],
                required: [true, "Payment name is required"],
            }
        ]
    },
    {
        timestamps: true,
    }
);

const Payment = mongoose.model("Payment", PaymentSchema);

module.exports = Payment;