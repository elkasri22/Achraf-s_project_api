const { default: mongoose } = require("mongoose");

const MakeVideoSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.ObjectId,
            ref : "User",
            trim: true,
            required: [true, "User is required"],
        },
        url_video: {
            type: String,
            trim: true,
            unique: true,
            required: [true, "Voucher is required"],
        },
        screenshot: {
            url: {
                type: String,
                default: null,
                required: [true, "Screenshot is required"],
            }, 
            public_id: {
                type: String,
                default: null,
                required: [true, "Screenshot is required"],
            },
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
        voucher: {
            type: String,
            default: null,
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

const MakeVideo = mongoose.model("MakeVideo", MakeVideoSchema);

module.exports = MakeVideo;