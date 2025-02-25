const { Schema, default: mongoose } = require("mongoose");

const DirectCommisionSchema = new Schema(
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
        month: {
            type: Number,
            required: true,
        },
        Year: {
            type: Number,
            required: true,
        },
        sendertoken: {
            type: String,
        },
        receivertoken: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

const DirectCommisionmodal = mongoose.model("DirectCommision", DirectCommisionSchema);
module.exports = DirectCommisionmodal;
