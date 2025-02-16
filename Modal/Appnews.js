const { default: mongoose } = require("mongoose");

const AppnewsSchema = new mongoose.Schema(
  {
    news: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const AppnewsModal = mongoose.model("News", AppnewsSchema);

module.exports = AppnewsModal;
