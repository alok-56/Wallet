const { validationResult } = require("express-validator");
const AppErr = require("../Helper/AppError");
const UserModal = require("../Modal/Users");
const generateToken = require("../Helper/GenerateToken");
const SendEmail = require("../Helper/Email");
const OtpModal = require("../Modal/Otp");
const emailQueue = require("../Helper/EmailJobs");
const {
  getAllLevelsBusiness,
  getMembersAtLevel,
} = require("../Helper/GenerateLevelMember");

// Sign Up
const SignUp = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { Name, Email, Password, referralCode, PublicKey, Rank } = req.body;

    let emailcheck = await UserModal.findOne({ Email: Email });
    if (emailcheck) {
      return next(new AppErr("Email Already Exists", 400));
    }

    const user = new UserModal({
      Name,
      Email,
      Password,
      PublicKey,
      Rank,
    });

    //add referal downline
    if (referralCode) {
      const referrer = await UserModal.findOne({ referralCode });

      if (referrer) {
        if (Rank >= referrer.Rank || Rank < 0) {
          return next(
            new AppErr(`Rank Must be Less than ${referrer.Rank} `, 400)
          );
        }
        user.referredBy = referralCode;
        referrer.downline.push(user._id);
        await referrer.save();

        emailQueue.add({
          email: referrer.Email,
          subject: "ReferralPersonJoined",
          name: referrer.Name,
          extraData: { referralName: Name },
        });
      }
    }

    await user.save();

    emailQueue.add({
      email: Email,
      subject: "WelcomeUser",
      name: Name,
      extraData: null,
    });

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

// Update Profile
const UpdateProfile = async (req, res, next) => {
  try {
    let  id  = req.user;
    console.log(id)
    let { Name, Email, Password, PublicKey } = req.body;

    let user = await UserModal.findById(id);
    if (!user) {
      return next(new AppErr("User Not Found", 404));
    }

    if (Email) {
      let emailcheck = await UserModal.findOne({ Email: Email });
      if (emailcheck) {
        return next(new AppErr("Email Already Exists", 400));
      }
    }

    await UserModal.updateOne(
      {
        _id: id,
      },
      {
        $set: req.body,
      }
    );

    return res.status(200).json({
      status: true,
      code: 200,
      message: "User Updated Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Direct Member
const GetDirectMember = async (req, res, next) => {
  try {
    const  id  = req.user;
    const user = await UserModal.findById(id);
    if (!user) {
      return next(new AppErr("User not Found", 404));
    }

    const directMembers = await UserModal.find({
      referredBy: user.referralCode,
    });

    return res.status(200).json({
      status: true,
      code: 200,
      data: directMembers,
      message: "User Fetched Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Level Wise Member
const GetLevelWisemember = async (req, res, next) => {
  try {
    const  id  = req.user;
    const { level } = req.query;
    const user = await UserModal.findById(id);
    if (!user) {
      return next(new AppErr("User not Found", 404));
    }
    let totalBusiness = 0;
    let allLevelsData = [];

    if (!level) {
      const { totalBusiness: business, levels } = await getAllLevelsBusiness(
        user.referralCode
      );
      totalBusiness = business;
      allLevelsData = levels;
    } else {
      const { totalBusiness: business, members } = await getMembersAtLevel(
        user.referralCode,
        parseInt(level)
      );
      totalBusiness = business;
      allLevelsData.push({
        level: parseInt(level),
        totalBusiness: business,
        members: members,
      });
    }

    return res.status(200).json({
      status: true,
      code: 200,
      business: totalBusiness,
      data: allLevelsData,
      message: "User Fetched Successfully",
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
  UpdateProfile,
  GetDirectMember,
  GetLevelWisemember,
};
