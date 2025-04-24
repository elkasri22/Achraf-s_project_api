const { default: mongoose } = require("mongoose");

const MatchSchema = new mongoose.Schema(
    {
        status: {
            type: String,
            trim: true,
            enum: ["live", "upcoming"],
            required: [true, "Category is required"],
        },
        type: {
            type: String,
            trim: true,
            enum: ["football", "basketball", "tennis", "AM-football", "hockey"],
            required: [true, "Type is required"],
        },
        league: {
            name: {
                type: String,
                trim: true,
                required: [true, "League name is required"],
            },
            logo: {
                type: String,
                trim: true,
                required: [true, "League logo is required"],
            }
        },
        homeTeam: {
            name: {
                type: String,
                trim: true,
                required: [true, "Home team name is required"],
            },
            logo: {
                type: String,
                trim: true,
                required: [true, "Home team logo is required"],
            },
            score: {
                type: Number,
                trim: true,
                default: 0
            }
        },
        awayTeam: {
            name: {
                type: String,
                trim: true,
                required: [true, "Away team name is required"],
            },
            logo: {
                type: String,
                trim: true,
                required: [true, "Away team logo is required"],
            },
            score: {
                type: Number,
                trim: true,
                default: 0
            }
        },
        date: {
            type: String,
            trim: true,
            required: [true, "Date is required"],
        },
        time: {
            type: String,
            trim: true,
            required: [true, "Time is required"],
        },
        end_time: {
            type: String,
            trim: true,
            required: [true, "End is required"],
        },
        type_match: {
            type: String,
            trim: true,
            enum: ["video", "iframe"],
            required: [true, "Type match is required"],
        },
        isFirst: {
            type: Boolean,
            default: false
        },
        matchUrl: {
            type: String,
            trim: true
        },
    },
    {
        timestamps: true,
    }
);

const Match = mongoose.model("Match", MatchSchema);

module.exports = Match;