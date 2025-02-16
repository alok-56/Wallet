const { Schema, default: mongoose } = require("mongoose");

const DistributionSchema = new Schema(
  {
    Rank: {
      type: Number,
      required: true,
    },
    Commision: {
      type: Number,
      required: true,
    },
    Active: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Distributionmodal = mongoose.model("Ranking", DistributionSchema);
module.exports = Distributionmodal;
