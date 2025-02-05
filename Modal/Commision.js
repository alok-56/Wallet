const { Schema, default: mongoose } = require("mongoose");

const commisionSchema = new Schema(
  {
    UserId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    commision: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const CommisionModal = mongoose.model("commision", commisionSchema);

module.exports = CommisionModal;
