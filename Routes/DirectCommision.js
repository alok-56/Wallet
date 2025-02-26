const express = require("express");
const { body } = require("express-validator");
const {UpdateDirectCommision, GetDirectCommision, GetDirectCommisionById, GetDirectCommisionByUserId, CreateDirectCommision, GetDirectCommisionByUserIdCount } = require("../Controller/DirectCommision");
const IsUser = require("../Middleware/isUser");
const IsAdmin = require("../Middleware/IsAdmin");

const DirectCommisionRouter = express.Router();

DirectCommisionRouter.post("/direct/add",
    body("amount").notEmpty().withMessage("amount is required"),
    body("UserId").notEmpty().withMessage("amount is required"), IsAdmin, CreateDirectCommision);

DirectCommisionRouter.patch("/direct/update/:id",
    IsAdmin, UpdateDirectCommision);

DirectCommisionRouter.get("/direct/get", IsAdmin, GetDirectCommision);
DirectCommisionRouter.get("/direct/get/:id", IsAdmin, GetDirectCommisionById);
DirectCommisionRouter.get("/direct/get/userid", IsUser, GetDirectCommisionByUserId);
DirectCommisionRouter.get("/direct/get/userid/count/new", IsUser, GetDirectCommisionByUserIdCount);



module.exports = DirectCommisionRouter;
