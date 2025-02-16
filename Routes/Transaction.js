const express = require("express");
const { body } = require("express-validator");
const IsUser = require("../Middleware/isUser");
const {
  addFund,

  addFundbyAdmin,
  GenerateProfit,
  Withdwralrequest,
  Gettransaction,
  GetmyTransaction,
  GetCommision,
  GetmyCommision,
  GetVoucher,
  UpdateProfit,
  GetVoucherbyUsetId,
  ActionWithdwralrequest,
  ExceptedMonthlyPayment,
} = require("../Controller/Transaction");
const IsAdmin = require("../Middleware/IsAdmin");

const TransactionRouter = express.Router();

TransactionRouter.post(
  "/addfund",
  body("amount").notEmpty().withMessage("amount is required"),
  IsUser,
  addFund
);

TransactionRouter.get("/getfund", IsAdmin, Gettransaction);

TransactionRouter.get("/myfund", IsUser, GetmyTransaction);

TransactionRouter.get("/getcommision", IsAdmin, GetCommision);

TransactionRouter.get("/mycommision", IsUser, GetmyCommision);

TransactionRouter.post(
  "/addfund/admin",
  body("amount").notEmpty().withMessage("amount is required"),
  body("UserId").notEmpty().withMessage("UserId is required"),
  IsAdmin,
  addFundbyAdmin
);

TransactionRouter.post(
  "/withdraw/request",
  body("amount").notEmpty().withMessage("amount is required"),
  IsUser,
  Withdwralrequest
);

TransactionRouter.patch(
  "/withdraw/approve/:id",
  body("status").notEmpty().withMessage("status is required"),
  body("message").notEmpty().withMessage("message is required"),
  IsAdmin,
  ActionWithdwralrequest
);

TransactionRouter.post("/admin/addprofit", IsAdmin, GenerateProfit);

TransactionRouter.get("/admin/getprofit", IsAdmin, GetVoucher);

TransactionRouter.patch("/admin/updateprofit/:id", IsAdmin, UpdateProfit);

TransactionRouter.get("/users/getprofit", IsUser, GetVoucherbyUsetId);

TransactionRouter.get("/admin/excepted/earning/:month/:year", IsAdmin, ExceptedMonthlyPayment);

module.exports = TransactionRouter;
