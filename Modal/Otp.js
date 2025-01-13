const { Schema, default: mongoose } = require("mongoose");

const OtpSchema = new Schema(
  {
    otp: {
      type: Number,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: () => Date.now() + 1 * 60 * 1000,
    },
  },
  { timestamps: true }
);

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const OtpModal = mongoose.model("otp", OtpSchema);

module.exports = OtpModal;
