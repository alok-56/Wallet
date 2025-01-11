const { Schema, default: mongoose } = require("mongoose");

const TransactionSchema = new Schema(
  {
    UserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    amount: {
      type: Number,
      required: true,
    },
    token: {
      type: String,
    },
    type: {
      type: String,
      required: true,
      enum: ["addfund", "profit", "referral"],
    },
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    returnPercentage: {
      type: Number,
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Success", "Failure","Reject"],
      default: "Pending",
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const TransactionModal = mongoose.model("Transaction", TransactionSchema);
module.exports = TransactionModal;
