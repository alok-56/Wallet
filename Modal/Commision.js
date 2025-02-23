const { Schema, default: mongoose } = require("mongoose");

const CommisionSchema = new Schema(
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
    depositby: {
      type: mongoose.Schema.Types.ObjectId,
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

const CommisionModal = mongoose.model("Commision", CommisionSchema);
module.exports = CommisionModal;
