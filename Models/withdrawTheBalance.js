const { default: mongoose } = require("mongoose");

const WithdrawTheBalanceSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.ObjectId,
            ref : "User",
            trim: true,
            required: [true, "User is required"],
        },
        choose: {
            type: String,
            trim: true,
            required: [true, "Choose is required"],
        },
        email: {
            type: String,
            trim: true,
            default: null,
        },
        game_id: {
            type: String,
            trim: true,
            default: null,
        },
        password: {
            type: String,
            trim: true,
            default: null,
        },
        username: {
            type: String,
            trim: true,
            default: null,
        },
        price: {
            type: Number,
            trim: true,
            required: [true, "Price is required"],
        },
        status: {
            color: {
                type: String,
                default: "#E9AB00",
            },
            name: {
                type: String,
                default: "Pending",
            },
        },
        done: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    }
);

const WithdrawTheBalance = mongoose.model("WithdrawTheBalance", WithdrawTheBalanceSchema);

module.exports = WithdrawTheBalance;