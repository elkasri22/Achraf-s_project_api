const { default: mongoose } = require("mongoose");

const LevelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            uppercase: true,
            unique: true,
            min: [3, "Level name must be at least 3 characters"],
            max: [32, "Level name must be at most 32 characters"],
            required: [true, "Level name is required"],
        },
        image: {
            url: {
                type: String,
                default: null,
                required: [true, "Image is required"],
            },
            public_id: {
                type: String,
                default: null,
                required: [true, "Image is required"],
            },
        },
        plus: {
            type: Number,
            trim: true,
            required: [true, "Plus is required"],
        },
        min: {
            type: Number,
            trim: true,
            required: [true, "Min is required"],
        },
        TransitionPoints: {
            type: Number,
            trim: true,
            required: [true, "TransitionPoints is required"],
        }
    },
    {
        timestamps: true,
    }
);

const Level = mongoose.model("Level", LevelSchema);

module.exports = Level;