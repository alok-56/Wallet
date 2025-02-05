const express = require("express");
const { body } = require("express-validator");
const IsUser = require("../Middleware/isUser");
const {
  addFund,
  getfund,
  myfund,
  getDownline,
  AddProfit,
  TransactionCount,
  Approvereferal,
  addFundbyAdmin,
} = require("../Controller/Transaction");
const IsAdmin = require("../Middleware/IsAdmin");

const TransactionRouter = express.Router();

TransactionRouter.post(
  "/addfund",
  body("amount").notEmpty().withMessage("amount is required"),
  IsUser,
  addFund
);

TransactionRouter.get("/getfund", IsAdmin, getfund);

TransactionRouter.get("/myfund", IsUser, myfund);

TransactionRouter.get("/users/earningsource/:userId", IsUser, getDownline);

TransactionRouter.post(
  "/users/addprofit",
  body("amount").notEmpty().withMessage("amount is required"),
  body("UserId").notEmpty().withMessage("UserId is required"),
  body("transactionId").notEmpty().withMessage("transactionId is required"),
  IsAdmin,
  AddProfit
);

TransactionRouter.get("/users/Amount/count", IsUser, TransactionCount);

TransactionRouter.patch(
  "/users/approve/referral",
  body("transactionId").notEmpty().withMessage("transactionId is required"),
  body("UserId").notEmpty().withMessage("UserId is required"),
  body("status").notEmpty().withMessage("status is required"),
  IsAdmin,
  Approvereferal
);

TransactionRouter.post(
  "/addfund/admin",
  body("amount").notEmpty().withMessage("amount is required"),
  body("UserId").notEmpty().withMessage("UserId is required"),
  IsAdmin,
  addFundbyAdmin
);

module.exports = TransactionRouter;
