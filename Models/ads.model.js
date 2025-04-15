const { default: mongoose } = require("mongoose");

const AdSchema = new mongoose.Schema(
    {
        head: {
            type: String,
            trim: true,
            required: [true, "Head is required"],
        },
        body: {
            type: String,
            trim: true,
            required: [true, "Body is required"],
        },
        page: {
            type: String,
            trim: true,
            required: [true, "Page is required"],
        },
        url: {
            type: String,
            trim: true,
            required: [true, "Web site url is required"],
        },
        isActive: {
            type: Boolean,
            required: [true, "Is Active is required"],
        }
    },
    {
        timestamps: true,
    }
);

const Ad = mongoose.model("Ad", AdSchema);

module.exports = Ad;