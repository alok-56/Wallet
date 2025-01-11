const { validationResult } = require("express-validator");
const AdminModal = require("../Modal/Admin");
const AppErr = require("../Helper/AppError");
const generateToken = require("../Helper/GenerateToken");

// Sign Up
const SignUpAdmin = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { Name, Email, Password } = req.body;

    const admin = new AdminModal({
      Name,
      Email,
      Password,
    });

    await admin.save();

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Addmin Created Successfully",
      data: admin,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};
// Sign In

const SignInAdmin = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { Email, Password } = req.body;

    let Emailcheck = await AdminModal.findOne({ Email: Email });
    if (!Emailcheck) {
      return next(new AppErr("Incorrect Email", 400));
    }
    if (Emailcheck.Password !== Password) {
      return next(new AppErr("Incorrect Password", 400));
    }

    let token = await generateToken(Emailcheck._id);
    console.log(token);
    return res.status(200).json({
      status: true,
      code: 200,
      message: "Admin Login Successfully",
      data: Emailcheck,
      token: token,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get Profile
const GetAdminProfile = async (req, res, next) => {
  try {
    let user = await AdminModal.findById(req.user);

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

module.exports = {
  SignUpAdmin,
  SignInAdmin,
  GetAdminProfile,
};
