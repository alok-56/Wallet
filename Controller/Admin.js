const { validationResult } = require("express-validator");
const AdminModal = require("../Modal/Admin");
const AppErr = require("../Helper/AppError");
const generateToken = require("../Helper/GenerateToken");
const UserModal = require("../Modal/Users");
const emailQueue = require("../Helper/EmailJobs");
const TransactionModal = require("../Modal/Transaction");
const buildUserTree = require("../Helper/buildtree");

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

    const newReferralCode = Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase();

    let { Name, Email, Password, referralCode, PublicKey, Rank } = req.body;

    let emailcheck = await UserModal.findOne({ Email: Email });
    if (emailcheck) {
      return next(new AppErr("Email Already Exists", 400));
    }

    const user = new UserModal({
      Name,
      Email,
      Password,
      referralCode: newReferralCode,
      PublicKey,
      Rank,
    });

    //add referal downline
    if (referralCode) {
      const referrer = await UserModal.findOne({ referralCode });
      
      if (referrer) {
        if(Rank>=referrer.Rank || Rank<0){
          return next(new AppErr(`Rank Must be Less than ${referrer.Rank} `, 400));
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
    let { Name, Email, Password } = req.body;

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

// Get Total Api
const TotalCount = async (req, res, next) => {
  try {
    let activeuser = await UserModal.countDocuments({ active: true });
    let unactiveuser = await UserModal.countDocuments({ active: false });
    let totalreferall = await TransactionModal.countDocuments({
      type: "referral",
    });
    let totalfund = await TransactionModal.aggregate([
      { $match: { type: "addfund" } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);
    let totalprofit = await TransactionModal.aggregate([
      { $match: { type: "profit" } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);
    let totalReferralCommission = await TransactionModal.aggregate([
      { $match: { type: "referral" } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);
    let totalvalue = await TransactionModal.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);
    res.status(200).json({
      status: true,
      code: 200,
      data: {
        activeUserCount: activeuser,
        unactiveUserCount: unactiveuser,
        totalReferralCount: totalreferall,
        totalFundAmount: totalfund[0]?.totalAmount || 0,
        totalProfitcredited: totalprofit[0]?.totalAmount || 0,
        totalReferralCommission: totalReferralCommission[0]?.totalAmount || 0,
        totalTransactionValue: totalvalue[0]?.totalAmount || 0,
      },
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

// total referal count by months
const totalReferralCountByMonth = async (req, res, next) => {
  try {
    const referralCount = await TransactionModal.aggregate([
      { $match: { type: "referral" } },
      {
        $project: {
          monthYear: {
            $dateToString: {
              format: "%B %Y",
              date: "$createdAt",
            },
          },
        },
      },
      {
        $group: {
          _id: "$monthYear", // Use monthYear as the custom _id
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          monthYear: "$_id", // Rename _id to monthYear
          count: 1,
          _id: 0, // Remove the default _id
        },
      },
    ]);

    res.status(200).json({ status: true, code: 200, data: referralCount });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const totalReferralAmountByMonth = async (req, res, next) => {
  try {
    const referralAmount = await TransactionModal.aggregate([
      { $match: { type: "referral" } },
      {
        $project: {
          monthYear: {
            $dateToString: {
              format: "%B %Y", // Full month name and year (e.g., January 2023)
              date: "$createdAt",
            },
          },
          amount: 1,
        },
      },
      {
        $group: {
          _id: "$monthYear", // Use monthYear as the custom _id
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          monthYear: "$_id", // Rename _id to monthYear
          totalAmount: 1,
          _id: 0, // Remove the default _id
        },
      },
    ]);

    res.status(200).json({ status: true, code: 200, data: referralAmount });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const totalTransactionCountByMonth = async (req, res, next) => {
  try {
    const transactionCount = await TransactionModal.aggregate([
      {
        $project: {
          monthYear: {
            $dateToString: {
              format: "%B %Y", // Full month name and year (e.g., January 2023)
              date: "$createdAt",
            },
          },
        },
      },
      {
        $group: {
          _id: "$monthYear", // Use monthYear as the custom _id
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          monthYear: "$_id", // Rename _id to monthYear
          count: 1,
          _id: 0, // Remove the default _id
        },
      },
    ]);

    res.status(200).json({ status: true, code: 200, data: transactionCount });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const totalTransactionAmountByMonth = async (req, res, next) => {
  try {
    const transactionAmount = await TransactionModal.aggregate([
      {
        $project: {
          monthYear: {
            $dateToString: {
              format: "%B %Y",
              date: "$createdAt",
            },
          },
          amount: 1,
        },
      },
      {
        $group: {
          _id: "$monthYear",
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          monthYear: "$_id",
          totalAmount: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json({ status: true, code: 200, data: transactionAmount });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Pending Payouts
const PendingPayouts = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(currentDate.getDate() - 30);

    const transactions = await TransactionModal.aggregate([
      {
        $match: {
          $or: [
            {
              type: "addfund",
              status: "Success",
              LastPaymentDate: { $lte: thirtyDaysAgo },
            },
            {
              type: "referral",
              status: "Pending",
            },
          ],
        },
      },
    ]);

    // Send the response with the filtered transactions
    res.status(200).json({
      status: true,
      code: 200,
      message: "Success",
      data: transactions,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Approved Payouts
const ApprovedPayouts = async (req, res, next) => {
  try {
    const transactions = await TransactionModal.aggregate([
      {
        $match: {
          $or: [
            {
              type: "profit",
              status: "Success",
            },
            {
              type: "referral",
              status: "Success",
            },
          ],
        },
      },
    ]);

    res.status(200).json({
      status: true,
      code: 200,
      message: "Success",
      data: transactions,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  SignUpAdmin,
  SignInAdmin,
  GetAdminProfile,
  AddUser,
  UpdateUser,
  TotalCount,
  DownlineTree,
  totalReferralAmountByMonth,
  totalReferralCountByMonth,
  totalTransactionAmountByMonth,
  totalTransactionCountByMonth,
  UpdateAdminDetails,
  PendingPayouts,
  ApprovedPayouts,
};
