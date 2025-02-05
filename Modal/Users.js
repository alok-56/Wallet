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

const UserModal = mongoose.model("user", UserSchema);
module.exports = UserModal;
