const express = require("express");
const { body } = require("express-validator");
const {
  CreateRanking,
  GetRanking,
  UpdateRanking,
  DeleteRanking,
} = require("../Controller/Ranking");
const IsAdmin = require("../Middleware/IsAdmin");
const RankingRouter = express.Router();

RankingRouter.post(
  "/add",
  body("Rank").notEmpty().withMessage("Rank is required"),
  body("Commision").notEmpty().withMessage("Commision is required"),
  IsAdmin,
  CreateRanking
);

RankingRouter.get("/get/all", IsAdmin, GetRanking);

RankingRouter.patch("/update/:id", IsAdmin, UpdateRanking);

RankingRouter.delete("/delete/:id", IsAdmin, DeleteRanking);

module.exports = RankingRouter;
