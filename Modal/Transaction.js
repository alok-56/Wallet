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
    type: {
      type: String,
      required: true,
      enum: ["credit", "debit"],
    },
    Balance: {
      type: String,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Success", "Failure", "Reject"],
      default: "Pending",
    },
    Remarks: {
      type: String,
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

const TransactionModal = mongoose.model("Transaction", TransactionSchema);
module.exports = TransactionModal;
