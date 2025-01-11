const express = require("express");
const { body } = require("express-validator");
const IsAdmin = require("../Middleware/IsAdmin");
const {
  CreateCommision,
  UpdateCommision,
  GetCommision,
  GetCommisionbyId,
  DeleteCommision,
} = require("../Controller/Commision");
const CommisionRouter = express.Router();

CommisionRouter.post(
  "/create",
  body("min").notEmpty().withMessage("min is required"),
  body("max").notEmpty().withMessage("max is required"),
  body("commision").notEmpty().withMessage("commision is required"),
  IsAdmin,
  CreateCommision
);

CommisionRouter.post("/update/:id", IsAdmin, UpdateCommision);

CommisionRouter.get("/get", GetCommision);
CommisionRouter.get("/get/:id", GetCommisionbyId);
CommisionRouter.delete("/:id", IsAdmin, DeleteCommision);

module.exports = CommisionRouter;
