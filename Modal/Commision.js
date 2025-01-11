const { Schema, default: mongoose } = require("mongoose");

const commisionSchema = new Schema(
  {
    min: {
      type: Number,
      required: true,
    },
    max: {
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
