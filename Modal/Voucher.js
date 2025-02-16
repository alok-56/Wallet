const { Schema, default: mongoose } = require("mongoose");

const VoucherSchema = new Schema(
  {
    UserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    month: {
      type: Number,
      required: true,
    },
    Year: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    totalmonthamount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Paid", "Transfer"],
      default: "Paid",
    },
  },
  {
    timestamps: true,
  }
);

const VoucherModal = mongoose.model("Voucher", VoucherSchema);
module.exports = VoucherModal;
