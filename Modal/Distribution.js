const { Schema, default: mongoose } = require("mongoose");

const DistributionSchema = new Schema(
  {
    Level: {
      type: [],
      required: true,
    },
  },
  {
    new: true,
  }
);

const Distributionmodal = mongoose.model("distribution", DistributionSchema);
module.exports = Distributionmodal;
