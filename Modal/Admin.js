const { Schema, default: mongoose } = require("mongoose");

const AdminSchema = new Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
    },
    Password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "admin",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const AdminModal = mongoose.model("admin", AdminSchema);
module.exports = AdminModal;
