const { validationResult } = require("express-validator");
const AppErr = require("../Helper/AppError");
const CommisionModal = require("../Modal/Commision");
const UserModal = require("../Modal/Users");
const TransactionModal = require("../Modal/Transaction");
const { default: mongoose } = require("mongoose");
const emailQueue = require("../Helper/EmailJobs");
const Distributionmodal = require("../Modal/Ranking");

const distributeRewards = async (session, userId, amount) => {
  let currentUser = await UserModal.findById(userId);
  let level = 0;
  let rewardlevelmodal = await Distributionmodal.find().sort({ Rank: 1 });
  let rewardsDistributed = [];

  let currentUserCommission =
    rewardlevelmodal[currentUser.Rank - 1]?.Commision || 0;

  rewardsDistributed.push({
    referrerId: currentUser._id,
    reward: (amount * currentUserCommission) / 100,
  });

  const transaction = new TransactionModal({
    UserId: currentUser._id,
    triggeredBy: currentUser._id,
    amount: currentUserCommission,
    status: "Pending",
    type: "referral",
  });

  await transaction.save({ session });
  currentUser.rewards += (amount * currentUserCommission) / 100;
  await currentUser.save();

  while (currentUser && currentUser.referredBy && level <= 10) {
    const referrer = await UserModal.findOne(
      { referralCode: currentUser.referredBy },
      null,
      { session }
    );

    let currentreferby = await UserModal.findOne(
      { referralCode: referrer.referredBy },
      null,
      { session }
    );

    if (!currentreferby) {
      await logReferralFailure(userId, amount, session);
      break;
    }

    if (!referrer) {
      await logReferralFailure(userId, amount, session);
      break;
    }

    const referrerCommission =
      rewardlevelmodal[referrer.Rank - 1]?.Commision || 0;

    const currentrefeeredcommision =
      rewardlevelmodal[currentreferby.Rank - 1]?.Commision || 0;

    reward = (amount * (currentrefeeredcommision - referrerCommission)) / 100;
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
      status: "Pending",
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
    req.body.LastPaymentDate = new Date();

    let user = await UserModal.findById(req.user);

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

    let { amount, token, UserId, transactionId } = req.body;

    req.body.UserId = UserId;
    req.body.status = "Success";
    req.body.type = "profit";

    let fund = await TransactionModal.create(req.body);
    await TransactionModal.findByIdAndUpdate(
      transactionId,
      {
        LastPaymentDate: new Date(),
      },
      { new: true }
    );

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

// Add fund by Admin
const addFundbyAdmin = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validation
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { amount, token, UserId } = req.body;
    req.body.UserId = UserId;
    req.body.status = "Success";
    req.body.type = "addfund";
    req.body.LastPaymentDate = new Date();

    let user = await UserModal.findById(UserId);

    const fundTransaction = new TransactionModal(req.body);
    await fundTransaction.save({ session });

    const rewardsDistributed = await distributeRewards(session, UserId, amount);

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

module.exports = {
  addFund,
  getfund,
  myfund,
  getDownline,
  AddProfit,
  TransactionCount,
  Approvereferal,
  addFundbyAdmin,
};
