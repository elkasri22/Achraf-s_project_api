const { default: mongoose } = require("mongoose");

const WithdrawThePointVideosSchema = new mongoose.Schema(
    {
        points: {
            type: Number,
            trim: true,
            required: [true, "Points is required"],
        },
        price: {
            type: Number,
            trim: true,
            required: [true, "Price is required"],
        },
    },
    {
        timestamps: true,
    }
);

const WithdrawThePointVideos = mongoose.model("WithdrawThePointVideos", WithdrawThePointVideosSchema);

module.exports = WithdrawThePointVideos;