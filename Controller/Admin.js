const { validationResult } = require("express-validator");
const AdminModal = require("../Modal/Admin");
const AppErr = require("../Helper/AppError");
const generateToken = require("../Helper/GenerateToken");
const UserModal = require("../Modal/Users");
const emailQueue = require("../Helper/EmailJobs");
const buildUserTree = require("../Helper/buildtree");
const UserModel = require("../Modal/Users");
const TransactionModal = require("../Modal/Transaction");
const CommisionModal = require("../Modal/Commision");
const VoucherModal = require("../Modal/Voucher");

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

// Update Admin Details
const UpdateAdminDetails = async (req, res, next) => {
  try {
    let { Name, Email, Password } = req.body;

    let user = await AdminModal.findById(req.user);
    if (!user) {
      return next(new AppErr("User Not Found", 404));
    }

    if (Email) {
      let emailcheck = await AdminModal.findOne({ Email: Email });
      if (emailcheck) {
        return next(new AppErr("Email Already Exists", 400));
      }
    }

    await AdminModal.updateOne(
      {
        _id: req.user,
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

// Add User
const AddUser = async (req, res, next) => {
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
          email: referrer?.Email,
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
      message: "User Added Successfully",
      data: user,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Update User
const UpdateUser = async (req, res, next) => {
  try {
    let { id } = req.params;
    let { Name, Email, Password, Rank, PublicKey } = req.body;

    let user = await UserModal.findById(id);
    if (!user) {
      return next(new AppErr("User Not Found", 404));
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
    await UserModal.findByIdAndDelete(id);

    res.status(200).json({
      status: true,
      code: 200,
      message: "User Activity updated  Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get User downline true
const DownlineTree = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return next(new AppErr("UserId is required", 400));
    }
    const tree = await buildUserTree(userId);

    if (!tree) {
      return next(new AppErr("No tree Found", 404));
    }

    res.status(200).json({ status: true, code: 200, data: tree });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Admin Count
const AdminDashboardCount = async (req, res, next) => {
  try {
    const totalMembers = await UserModel.countDocuments();
    const totalActive = await UserModel.countDocuments({ active: true });
    const totalInactive = await UserModel.countDocuments({ active: false });

    const totalTransaction = await TransactionModal.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalCommision = await CommisionModal.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$commision" },
        },
      },
    ]);

    const totalPaid = await VoucherModal.aggregate([
      {
        $match: { status: "Paid" },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totaltransfer = await VoucherModal.aggregate([
      {
        $match: { status: "Transfer" },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    res.status(200).json({
      status: true,
      code: 200,
      data: {
        totalActive,
        totalInactive,
        totalMembers,
        totalCommision,
        totalTransaction,
        totalPaid,
        totaltransfer,
      },
    });
  } catch (error) {
    return next(new AppErr(error.message));
  }
};

// Trnsaction by month
const TrnsactionBymonth = async (req, res, next) => {
  try {
    const monthlyTransactions = await TransactionModal.aggregate([
      {
        $group: {
          _id: "$month",
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyData = Array(12).fill(0);
    monthlyTransactions.forEach(({ _id, totalAmount }) => {
      monthlyData[_id - 1] = totalAmount;
    });

    res.status(200).json({
      status: true,
      code: 200,
      data: {
        lable: months,
        data: monthlyData,
      },
    });
  } catch (error) {
    return next(new AppErr(error.message));
  }
};

// member by month
const MemberBymonth = async (req, res, next) => {
  try {
    const monthlyMembers = await UserModel.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyMemberData = Array(12).fill(0);
    monthlyMembers.forEach(({ _id, totalCount }) => {
      monthlyMemberData[_id - 1] = totalCount;
    });

    res.status(200).json({
      status: true,
      code: 200,
      data: {
        lable: months,
        data: monthlyMemberData,
      },
    });
  } catch (error) {
    return next(new AppErr(error.message));
  }
};

// commision by month
const CommisionBymonth = async (req, res, next) => {
  try {
    const monthlyTransactions = await CommisionModal.aggregate([
      {
        $group: {
          _id: "$month",
          totalAmount: { $sum: "$commision" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyData = Array(12).fill(0);
    monthlyTransactions.forEach(({ _id, totalAmount }) => {
      monthlyData[_id - 1] = totalAmount;
    });

    res.status(200).json({
      status: true,
      code: 200,
      data: {
        lable: months,
        data: monthlyData,
      },
    });
  } catch (error) {
    return next(new AppErr(error.message));
  }
};

// Total balance Report

const TotalBalanceReport = async (req, res, next) => {
  try {
    const voucherTotals = await VoucherModal.aggregate([
      {
        $group: {
          _id: {
            userId: "$UserId",
            status: "$status",
          },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const creditTotals = await TransactionModal.aggregate([
      { $match: { type: "credit" } },
      {
        $group: {
          _id: "$UserId",
          totalCredit: { $sum: "$amount" },
        },
      },
    ]);

    const users = await UserModal.find({}).lean();

    let userMap = {};

    voucherTotals.forEach((item) => {
      const userId = item._id.userId.toString();
      if (!userMap[userId]) {
        userMap[userId] = {
          totalPaid: 0,
          totalTransferred: 0,
          totalCredit: 0,
          user: null,
        };
      }
      if (item._id.status === "Paid") {
        userMap[userId].totalPaid = item.totalAmount;
      }
      if (item._id.status === "Transfer") {
        userMap[userId].totalTransferred = item.totalAmount;
      }
    });

    creditTotals.forEach((item) => {
      const userId = item._id.toString();
      if (!userMap[userId]) {
        userMap[userId] = {
          totalPaid: 0,
          totalTransferred: 0,
          totalCredit: 0,
          user: null,
        };
      }
      userMap[userId].totalCredit = item.totalCredit;
    });

    users.forEach((user) => {
      const userId = user._id.toString();
      if (!userMap[userId]) {
        userMap[userId] = {
          totalPaid: 0,
          totalTransferred: 0,
          totalCredit: 0,
          user,
        };
      } else {
        userMap[userId].user = user;
      }
    });

    const result = Object.values(userMap);

    res.json({
      status: true,
      code: 200,
      data: result,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  SignUpAdmin,
  SignInAdmin,
  GetAdminProfile,
  UpdateAdminDetails,
  GetAllUser,
  GetUserById,
  AddUser,
  BlockUser,
  UpdateUser,
  DownlineTree,
  AdminDashboardCount,
  TrnsactionBymonth,
  MemberBymonth,
  CommisionBymonth,
  TotalBalanceReport,
};
