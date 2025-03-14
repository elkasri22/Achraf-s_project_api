const { default: mongoose } = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      min: [3, "Username must be at least 3 characters"],
      max: [32, "Username must be at most 32 characters"],
      required: [true, "Username is required"],
    },
    avatar: {
      url: {
        type: String,
        default: `${process.env.BASE_API}/avatar.webp`,
      },
      public_id: {
        type: String,
        default: null,
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, "Email is required"],
    },
    country: {
      type: String,
      require: [true, "Country is required"],
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
    myReferralCode: {
      type: String,
      unique: true,
      required: [true, "Referral code is required"],
    },
    referredBy: {
      type: String,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    score: {
      AccountBalance: {
        dollars: {
          type: Number,
          default: 0,
        },
        points: {
          type: Number,
          default: 0,
        },
        pointsVideos: {
          type: Number,
          default: 0,
        },
        countMyRewardClaimed: {
          type: Number,
          default: 0,
        },
      },
      level: {
        id_voucherReserved: {
          type: String,
          default: null,
        },
        my_gift_voucher: {
          type: String,
          default: null,
        },
        length_show: {
          type: Number,
          default: 0,
        },
        image: {
          type: String,
          default: null,
        },
        points: {
          type: Number,
          default: 0,
        },
        name: {
          type: String,
          default: null,
        },
        plus: {
          type: Number,
          default: 0,
        },
      },
    },
    lastTap: {
      type: Date,
      default: null,
    },
    isTakeGift: {
      type: Boolean,
      default: false,
    },
    countRegisteredWithMe: {
      type: Number,
      default: 0,
    },
    registeredWithMe: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        default: null,
      },
    ],
    rewardClaimedWithMe: {
      type: Number,
      default: 0,
    },
    notifications: [
        {
            type: String,
            default: null
        },
    ],
    otp:{
        type: String,
        default: null
    },
    otpExpiresAt: {
        type: Date,
        default: null
    },
    tapHere:{
      day: {
        type: String,
        default: null
      },
      length: {
        type: Number,
        default: 0
      }
    },
    clicked: {
      type: Number,
      default: 0
    }, 
    gift_three_claims_done: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
