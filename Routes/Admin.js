const express = require("express");
const { body } = require("express-validator");
const {
  SignUpAdmin,
  SignInAdmin,
  GetAdminProfile,
  AddUser,
  UpdateUser,
  TotalCount,
  DownlineTree,
  totalReferralCountByMonth,
  totalReferralAmountByMonth,
  totalTransactionCountByMonth,
  totalTransactionAmountByMonth,
  UpdateAdminDetails,
  PendingPayouts,
  ApprovedPayouts,
} = require("../Controller/Admin");
const IsAdmin = require("../Middleware/IsAdmin");
const AdminRouter = express.Router();

AdminRouter.post(
  "/signup",
  body("Name").notEmpty().withMessage("Name is required"),
  body("Email").notEmpty().withMessage("Email is required"),
  body("Password").notEmpty().withMessage("Password is required"),
  SignUpAdmin
);

AdminRouter.post(
  "/signin",
  body("Email").notEmpty().withMessage("Email is required"),
  body("Password").notEmpty().withMessage("Password is required"),
  SignInAdmin
);

AdminRouter.get("/profile", IsAdmin, GetAdminProfile);

AdminRouter.post(
  "/add/user",
  body("Name").notEmpty().withMessage("Name is required"),
  body("Email").notEmpty().withMessage("Email is required"),
  body("Password").notEmpty().withMessage("Password is required"),
  IsAdmin,
  AddUser
);

AdminRouter.patch("/update/user/:id", IsAdmin, UpdateUser);

AdminRouter.get("/app/count", IsAdmin, TotalCount);
AdminRouter.get("/downline/tree/:userId", IsAdmin, DownlineTree);
AdminRouter.get("/graph/referal/count", IsAdmin, totalReferralCountByMonth);
AdminRouter.get("/graph/referal/amount", IsAdmin, totalReferralAmountByMonth);
AdminRouter.get(
  "/graph/transaction/count",
  IsAdmin,
  totalTransactionCountByMonth
);
AdminRouter.get(
  "/graph/transaction/amount",
  IsAdmin,
  totalTransactionAmountByMonth
);

AdminRouter.patch("/update/details", IsAdmin, UpdateAdminDetails);

AdminRouter.get("/pending/payouts", IsAdmin, PendingPayouts);
AdminRouter.get("/approved/payouts", IsAdmin, ApprovedPayouts);

module.exports = AdminRouter;
