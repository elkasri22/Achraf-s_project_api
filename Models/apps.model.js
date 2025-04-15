const { default: mongoose } = require("mongoose");

const AppSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            unique: true,
            required: [true, "Title is required"],
        },
        type: {
            type: String,
            trim: true,
            required: [true, "Type is required"],
        },
        icon_app: {
            type: String,
            trim: true,
            required: [true, "Icon app is required"],
        },
        bg_app: {
            type: String,
            trim: true,
            required: [true, "Background app is required"],
        },
        content: {
            type: String,
            trim: true,
            required: [true, "Content is required"],
        },
        rating: {
            type: Number,
            trim: true,
            required: [true, "Rating is required"],
        },
        size: {
            type: String,
            trim: true,
            required: [true, "Size is required"],
        },
        download: {
            type: String,
            trim: true,
            required: [true, "Download is required"],
        },
        developer: {
            type: String,
            trim: true,
            required: [true, "Developer is required"],
        },
        category: {
            type: String,
            trim: true,
            required: [true, "Category is required"],
        },
        trending:{
            type: Boolean,
            required: [true, "Trending is required"],
        },
        slider: {
            type: Boolean,
            required: [true, "Slider is required"],
        },
        supportedDevices: {
            type: Array,
            trim: true,
            required: [true, "Supported Devices is required"],
        },
        it:{
            type: String,
            trim: true,
        },
        key: {
            type: String,
            trim: true,
        },
        isFirst: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

const App = mongoose.model("App", AppSchema);

module.exports = App;