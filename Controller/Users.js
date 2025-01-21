const { validationResult } = require("express-validator");
const AppErr = require("../Helper/AppError");
const UserModal = require("../Modal/Users");
const generateToken = require("../Helper/GenerateToken");
const SendEmail = require("../Helper/Email");
const OtpModal = require("../Modal/Otp");
const emailQueue = require("../Helper/EmailJobs");

// Sign Up
const SignUp = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    const newReferralCode = Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase();

    let { Name, Email, Password, referralCode } = req.body;

    let emailcheck = await UserModal.findOne({ Email: Email });
    if (emailcheck) {
      return next(new AppErr("Email Already Exists", 400));
    }

    const user = new UserModal({
      Name,
      Email,
      Password,
      referralCode: newReferralCode,
    });

    //add referal downline
    if (referralCode) {
      const referrer = await UserModal.findOne({ referralCode });
      if (referrer) {
        user.referredBy = referralCode;
        referrer.downline.push(user._id);
        await referrer.save();
      }

      emailQueue.add(
        SendEmail(referrer.Email, "ReferralPersonJoined", referrer.Name, {
          referralName: Name,
        })
      );
    }

    await user.save();

    emailQueue.add(SendEmail(Email, "WelcomeUser", Name, null));

    return res.status(200).json({
      status: true,
      code: 200,
      message: "User SignUp Successfully",
      data: user,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Sign In

const SignIn = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { Email, Password } = req.body;

    let Emailcheck = await UserModal.findOne({ Email: Email });
    if (!Emailcheck) {
      return next(new AppErr("Incorrect Email", 400));
    }
    if (Emailcheck.Password !== Password) {
      return next(new AppErr("Incorrect Password", 400));
    }

    let token = await generateToken(Emailcheck._id);

   
      await SendEmail(Email, "WelcomeUser", Emailcheck.Name, {
        referralName: "Company",
      })
    

    return res.status(200).json({
      status: true,
      code: 200,
      message: "User Login Successfully",
      data: Emailcheck,
      token: token,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Otp Send

const OtpSend = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }
    let { Email } = req.body;
    let Emailcheck = await UserModal.findOne({ Email: Email });
    if (!Emailcheck) {
      return next(new AppErr("Email Not Found", 404));
    }
    const otp = Math.floor(1000 + Math.random() * 9000);
    const otpcreate = new OtpModal({
      otp: otp,
    });
    await otpcreate.save();
    await SendEmail(Email, "OTP", null, {
      otp,
    });
    return res.status(200).json({
      status: true,
      code: 200,
      message: "OTP Send Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Verify Otp

const VeriFyOtp = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { Email, otp } = req.body;
    let Emailcheck = await UserModal.findOne({ Email: Email });
    if (!Emailcheck) {
      return next(new AppErr("User Not Found", 404));
    }
    let otpcheck = await OtpModal.findOne({ otp: otp });

    if (!otpcheck) {
      return next(new AppErr("Incorrect Otp", 404));
    }

    await OtpModal.findByIdAndDelete(otpcheck._id);
    return res.status(200).json({
      status: true,
      code: 200,
      message: "User Verified  Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Password Change

const PasswordChange = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { Email, newPassword, conformpassword } = req.body;

    let Emailcheck = await UserModal.findOne({ Email: Email });
    if (!Emailcheck) {
      return next(new AppErr("User Not  Found", 400));
    }
    if (newPassword !== conformpassword) {
      return next(
        new AppErr("New Password and Conform Password not matched", 400)
      );
    }
    await UserModal.updateOne(
      {
        _id: Emailcheck._id,
      },
      {
        $set: {
          Password: newPassword,
        },
      },
      { runValidators: true }
    );

    return res.status(200).json({
      status: true,
      code: 200,
      message: "User Password Changed  Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get My Profile

const GetProfile = async (req, res, next) => {
  try {
    let user = await UserModal.findById(req.user);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Profile Fetched  Successfully",
      data: user,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get All User
const GetAllUser = async (req, res, next) => {
  try {
    let user = await UserModal.find();

    return res.status(200).json({
      status: true,
      code: 200,
      message: "User Fetched  Successfully",
      data: user,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get User By Id

const GetUserById = async (req, res, next) => {
  try {
    let { id } = req.params;
    let user = await UserModal.findById(id);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "User Fetched  Successfully",
      data: user,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Block User
const BlockUser = async (req, res, next) => {
  try {
    let { id } = req.params;
    await UserModal.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          active: false,
        },
      },
      { runValidators: true }
    );

    res.status(200).json({
      status: true,
      code: 200,
      message: "User Blocked  Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  SignUp,
  SignIn,
  OtpSend,
  VeriFyOtp,
  PasswordChange,
  GetProfile,
  GetAllUser,
  GetUserById,
  BlockUser,
};
