const { default: mongoose } = require("mongoose");

const LockerSchema = new mongoose.Schema(
    {
        seconds: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

const Locker = mongoose.model("Locker", LockerSchema);

module.exports = Locker;