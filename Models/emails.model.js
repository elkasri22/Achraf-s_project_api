const { default: mongoose } = require("mongoose");

const EmailSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            trim: true,
            required: [true, "Url is required"],
        },
        email: {
            type: String,
            trim: true,
            unique: true,
            required: [true, "Email is required"],
        },
    },
    {
        timestamps: true,
    }
);

const Email = mongoose.model("Email", EmailSchema);

module.exports = Email;