const { default: mongoose } = require("mongoose");

const TicketSchema = new mongoose.Schema(
  {
    ticketNo: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
    },
    reopenremarks: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ["Open", "Closed", "Resolved", "Reopen"],
      default: "Open",
    },
  },
  { timestamps: true }
);

const TicketModal = mongoose.model("ticket", TicketSchema);

module.exports = TicketModal;
