const { default: mongoose } = require("mongoose");

const VoucherSchema = new mongoose.Schema(
    {
        voucher: {
            type: String,
            trim: true,
            uppercase: true,
            unique: true,
            required: [true, "Voucher is required"],
        },
        price: {
            type: Number,
            trim: true,
            required: [true, "Price is required"],
        },
        isActive: {
            type: Boolean,
            default: false,
            required: [true, "isActive is required"],
        },
        isReserved: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Voucher = mongoose.model("Voucher", VoucherSchema);

module.exports = Voucher;