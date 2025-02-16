const { Schema, default: mongoose } = require("mongoose");

const WithdrawSchema = new Schema(
  {
    UserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    Sponser: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    amount: {
      type: Number,
      required: true,
    },
    commision: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Success", "Failure", "Reject"],
      default: "Pending",
    },
    month: {
      type: Number,
      required: true,
    },
    Year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const WithdrawModal = mongoose.model("WithdrawCommision", WithdrawSchema);
module.exports = WithdrawModal;
