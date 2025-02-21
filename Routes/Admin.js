const express = require("express");
const { body } = require("express-validator");
const {
  SignUpAdmin,
  SignInAdmin,
  GetAdminProfile,
  AddUser,
  UpdateUser,
  DownlineTree,
  UpdateAdminDetails,
  GetAllUser,
  GetUserById,
  BlockUser,
  AdminDashboardCount,
  TrnsactionBymonth,
  CommisionBymonth,
  MemberBymonth,
  TotalBalanceReport,
  SponserTeam,
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
AdminRouter.get("/alluser", IsAdmin, GetAllUser);
AdminRouter.get("/user/:id", IsAdmin, GetUserById);
AdminRouter.delete("/blockuser/:id", IsAdmin, BlockUser);
AdminRouter.patch("/update/user/:id", IsAdmin, UpdateUser);
AdminRouter.get("/downline/tree/:userId", IsAdmin, DownlineTree);
AdminRouter.patch("/update/details", IsAdmin, UpdateAdminDetails);
AdminRouter.get("/dashboard/count", IsAdmin, AdminDashboardCount);
AdminRouter.get("/dashboard/transaction/month", IsAdmin, TrnsactionBymonth);
AdminRouter.get("/dashboard/commision/month", IsAdmin, CommisionBymonth);
AdminRouter.get("/dashboard/member/month", IsAdmin, MemberBymonth);
AdminRouter.get("/balance/report", IsAdmin, TotalBalanceReport);
AdminRouter.get("/users/sponserteam", IsAdmin, SponserTeam);

module.exports = AdminRouter;
