const { default: mongoose } = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      trim: true,
      min: [6, "Password must be at least 6 characters"],
      max: [32, "Password must be at most 32 characters"],
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    otp:{
      type: String,
      default: null
    },
    otpExpiresAt: {
        type: Date,
        default: null
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
