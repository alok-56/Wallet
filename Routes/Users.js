const express = require("express");
const {
  SignUp,
  SignIn,
  OtpSend,
  VeriFyOtp,
  PasswordChange,
  GetProfile,
  UpdateProfile,
  GetDirectMember,
  GetLevelWisemember,
} = require("../Controller/Users");
const { body } = require("express-validator");
const IsUser = require("../Middleware/isUser");
const UserRouter = express.Router();

UserRouter.post(
  "/signup",
  body("Name").notEmpty().withMessage("Name is required"),
  body("Email").notEmpty().withMessage("Email is required"),
  body("Password").notEmpty().withMessage("Password is required"),
  SignUp
);

UserRouter.post(
  "/signin",
  body("Email").notEmpty().withMessage("Email is required"),
  body("Password").notEmpty().withMessage("Password is required"),
  SignIn
);

UserRouter.post(
  "/otpsend",
  body("Email").notEmpty().withMessage("Email is required"),
  OtpSend
);

UserRouter.post(
  "/otpverify",
  body("Email").notEmpty().withMessage("Email is required"),
  body("otp").notEmpty().withMessage("OTP is required"),
  VeriFyOtp
);

UserRouter.patch(
  "/updatepassword",
  body("Email").notEmpty().withMessage("Email is required"),
  body("conformpassword").notEmpty().withMessage("conformpassword is required"),
  body("newPassword").notEmpty().withMessage("newPassword is required"),
  PasswordChange
);

UserRouter.get("/profile", IsUser, GetProfile);

UserRouter.patch("/update", IsUser, UpdateProfile);

UserRouter.get("/get/direct/member", IsUser, GetDirectMember);

UserRouter.get("/get/level/member/bussiness", IsUser, GetLevelWisemember);


module.exports = UserRouter;
