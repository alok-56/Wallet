const { Schema, default: mongoose } = require("mongoose");

const UserSchema = new Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
    },
    Password: {
      type: String,
      required: true,
    },
    referralCode: {
      type: String,
      unique: true,
    },
    referredBy: {
      type: String,
    },
    Rank: {
      type: Number,
      required: true,
    },
    downline: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    rewards: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
    levelRewards: {
      type: Map,
      of: Number,
      default: () => new Map(),
    },
    role: {
      type: String,
      default: "user",
    },
    PublicKey: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const lastUser = await this.constructor
        .findOne()
        .sort({ referralCode: -1 });
      const lastReferralCode = lastUser
        ? parseInt(lastUser.referralCode, 10)
        : 999;
      this.referralCode = (lastReferralCode + 1).toString();
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

const UserModel = mongoose.model("user", UserSchema);
module.exports = UserModel;
