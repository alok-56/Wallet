const express = require("express");
const { body } = require("express-validator");
const {
  SignUpAdmin,
  SignInAdmin,
  GetAdminProfile,
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

module.exports = AdminRouter;
