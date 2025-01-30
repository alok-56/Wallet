const { validationResult } = require("express-validator");
const AppErr = require("../Helper/AppError");
const CommisionModal = require("../Modal/Commision");
const UserModal = require("../Modal/Users");
const TransactionModal = require("../Modal/Transaction");
const { default: mongoose } = require("mongoose");
const emailQueue = require("../Helper/EmailJobs");
const Distributionmodal = require("../Modal/Distribution");

const CreateDistributionPer = async (req, res, next) => {
  try {
    let { Level } = req.body;

    if (Level.length === 0) {
      return next(new AppErr("Level cannot be empty", 400));
    }

    let leveltype = await Distributionmodal.find();
    if (leveltype.length === 1) {
      return next(new AppErr("Level should be only one", 400));
    }

    let response = await Distributionmodal.create(req.body);

    response.status(200).json({
      status: true,
      code: 200,
      data: res,
      message: "Distribution created Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const UpdateDistributionPer = async (req, res, next) => {
  try {
    let { Level } = req.body;
    let { id } = req.params;

    if (Level.length === 0) {
      return next(new AppErr("Level cannot be empty", 400));
    }

    let response = await Distributionmodal.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.status(200).json({
      status: true,
      code: 200,
      data: response,
      message: "Distribution Updated Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const GetDistributionPer = async (req, res, next) => {
  try {
    let leveltype = await Distributionmodal.find();

    res.status(200).json({
      status: true,
      code: 200,
      data: leveltype,
      message: "Distribution Fetched Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const distributeRewards = async (session, userId, amount) => {
  let currentUser = await UserModal.findById(userId);
  let level = 1;
  let rewardlevelmodal = await Distributionmodal.find();
  const rewardPercentages = rewardlevelmodal.Level;
  let rewardsDistributed = [];

  while (
    currentUser &&
    currentUser.referredBy &&
    level <= rewardPercentages.length
  ) {
    const referrer = await UserModal.findOne(
      { referralCode: currentUser.referredBy },
      null,
      { session }
    );

    if (!referrer) {
      await logReferralFailure(userId, amount, session);
      break;
    }

    const reward = (amount * rewardPercentages[level - 1]) / 100;
    rewardsDistributed.push({ referrerId: referrer._id, reward });

    if (!referrer.levelRewards || !(referrer.levelRewards instanceof Map)) {
      referrer.levelRewards = new Map();
    }
    referrer.levelRewards.set(
      `Level ${level}`,
      (referrer.levelRewards.get(`Level ${level}`) || 0) + reward
    );

    referrer.rewards += reward;

    try {
      await referrer.save({ session });
    } catch (error) {
      await logReferralFailure(userId, amount, session);
      break;
    }

    const transaction = new TransactionModal({
      UserId: referrer._id,
      triggeredBy: currentUser._id,
      amount: reward,
      status: "Success",
      type: "referral",
    });

    await transaction.save({ session });

    currentUser = referrer;
    level++;
  }

  return rewardsDistributed;
};

const logReferralFailure = async (userId, amount, session) => {
  try {
    const failedTransaction = new TransactionModal({
      UserId: userId,
      amount: amount,
      status: "Failure",
    });
    await failedTransaction.save({ session });
  } catch (error) {
    console.error("Failed to log referral failure:", error);
  }
};

// Add Fund
const addFund = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validation
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { amount, token } = req.body;
    req.body.UserId = req.user;
    req.body.status = "Success";
    req.body.type = "addfund";

    let user = await UserModal.findById(req.user);

    let returnpercentage = await CommisionModal.findOne({
      $and: [{ min: { $lt: amount } }, { max: { $gt: amount } }],
    });

    if (!returnpercentage) {
      return next(new AppErr("No commission found for your amount"));
    }

    req.body.returnPercentage = returnpercentage.commision;

    const fundTransaction = new TransactionModal(req.body);
    await fundTransaction.save({ session });

    const rewardsDistributed = await distributeRewards(
      session,
      req.user,
      amount
    );

    emailQueue.add({
      email: user.Email,
      subject: "FundAdded",
      name: user.Name,
      extraData: { amountAdded: amount },
    });

    await session.commitTransaction();

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Fund Added Successfully",
      data: fundTransaction,
      rewards: rewardsDistributed,
    });
  } catch (error) {
    await session.abortTransaction();
    return next(new AppErr(error.message, 500));
  } finally {
    session.endSession();
  }
};

// get fund

const getfund = async (req, res, next) => {
  try {
    let { type, status, userId } = req.query;

    let filter = {};

    if (type) {
      filter.type = type;
    }
    if (status) {
      filter.status = status;
    }
    if (userId) {
      filter.UserId = userId;
    }

    let funds = await TransactionModal.find(filter).populate(
      "UserId",
      "-Password"
    );

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Fund Fetched Successfully",
      data: funds,
    });
  } catch (error) {
    return next(new AppErr(error.message));
  }
};

// my transaction
const myfund = async (req, res, next) => {
  try {
    let { type, status } = req.query;
    let filter = { UserId: req.user };

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    let funds = await TransactionModal.find(filter)
      .populate("UserId", "-Password")
      .populate("triggeredBy", "-Password");

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Fund Fetched Successfully",
      data: funds,
    });
  } catch (error) {
    return next(new AppErr(error.message));
  }
};

// earning sources

const getDownline = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid user ID",
      });
    }

    const user = await UserModal.findById(userId).populate(
      "downline",
      "Name Email referralCode rewards levelRewards"
    );
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Downline fetched successfully",
      data: user.downline,
    });
  } catch (error) {
    console.error("Error fetching downline:", error);
    return next(new AppErr(error.message, 500));
  }
};

// add profit
const AddProfit = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { amount, token, UserId } = req.body;

    req.body.UserId = UserId;
    req.body.status = "Success";
    req.body.type = "profit";

    let fund = await TransactionModal.create(req.body);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Fund Credited Successfully",
      data: fund,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// TransactionCount count
const TransactionCount = async (req, res, next) => {
  try {
    const objectId = new mongoose.Types.ObjectId(req.user);
    const transactionAmounts = await TransactionModal.aggregate([
      {
        $match: { UserId: objectId, status: "Success" },
      },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const result = {
      addfund: 0,
      referral: 0,
      profit: 0,
    };

    transactionAmounts.forEach((item) => {
      if (item._id === "addfund") result.addfund = item.totalAmount;
      if (item._id === "referral") result.referral = item.totalAmount;
      if (item._id === "profit") result.profit = item.totalAmount;
    });

    return res.status(200).json({
      status: true,
      message: "Transaction amounts fetched successfully",
      data: result,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Approve  referal
const Approvereferal = async (req, res, next) => {
  try {
    let { UserId, transactionId, status } = req.body;
    const statusdata = ["Pending", "Success", "Failure", "Reject"];
    let user = await UserModal.findById(UserId);
    if (!user) {
      return next(new AppErr("user not found", 500));
    }

    let trans = await TransactionModal.findById(transactionId);
    if (!trans) {
      return next(new AppErr("Transaction not found", 500));
    }

    if (!statusdata.includes(status)) {
      return next(
        new AppErr(`status must be any one of these ${statusdata}`, 500)
      );
    }

    if (trans.type !== "referral") {
      return next(
        new AppErr(`only referral Transacation can be approved `, 500)
      );
    }

    await TransactionModal.updateOne(
      { _id: transactionId },
      {
        $set: {
          status: status,
        },
      },
      { runValidators: true }
    );

    emailQueue.add({
      email: user.Email,
      subject: "ReferralApproved",
      name: user.Name,
      extraData: { reward: trans.amount },
    });

    res.status(200).json({
      status: true,
      code: 200,
      message: "Approved Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  addFund,
  getfund,
  myfund,
  getDownline,
  AddProfit,
  TransactionCount,
  Approvereferal,
  CreateDistributionPer,
  UpdateDistributionPer,
  GetDistributionPer,
};
