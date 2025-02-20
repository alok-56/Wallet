const { validationResult } = require("express-validator");
const emailQueue = require("../Helper/EmailJobs");
const AppErr = require("../Helper/AppError");
const TransactionModal = require("../Modal/Transaction");
const Distributionmodal = require("../Modal/Ranking");
const CommisionModal = require("../Modal/Commision");
const WithdrawModal = require("../Modal/WithdrawCommision");
const VoucherModal = require("../Modal/Voucher");
const UserModal = require("../Modal/Users");
const { default: mongoose } = require("mongoose");

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

  const transaction = new CommisionModal({
    UserId: currentUser._id,
    Sponser: currentUser._id,
    amount: amount,
    commision: (amount * currentUserCommission) / 100,
    status: "Success",
    month: new Date().getMonth() + 1,
    Year: new Date().getFullYear(),
  });
  console.log(currentUser.balance, amount);
  await transaction.save({ session });
  currentUser.rewards += (amount * currentUserCommission) / 100;
  currentUser.balance = currentUser.balance + Number(amount);
  console.log(currentUser.balance);
  await currentUser.save({ session });

  while (currentUser && currentUser.referredBy && level <= 10) {
    const referrer = await UserModal.findOne(
      { referralCode: currentUser.referredBy },
      null,
      { session }
    );

    if (!referrer) {
      await logReferralFailure(userId, amount, session);
      break;
    }

    const referrerCommission =
      rewardlevelmodal[referrer.Rank - 1]?.Commision || 0;

    reward = (amount * (referrerCommission - currentUserCommission)) / 100;
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

    const transaction = new CommisionModal({
      UserId: referrer._id,
      Sponser: currentUser._id,
      amount: amount,
      commision: reward,
      status: "Success",
      month: new Date().getMonth() + 1,
      Year: new Date().getFullYear(),
    });

    await transaction.save({ session });
    currentUserCommission = referrerCommission;
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
      type: "credit",
      status: "Failure",
      month: new Date().getMonth() + 1,
      Year: new Date().getFullYear(),
    });
    await failedTransaction.save({ session });
  } catch (error) {
    console.error("Failed to log referral failure:", error);
  }
};

const withdrawdistributeRewards = async (session, userId, amount) => {
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

  const transaction = new WithdrawModal({
    UserId: currentUser._id,
    Sponser: currentUser._id,
    amount: amount,
    commision: (amount * currentUserCommission) / 100,
    status: "Success",
    month: new Date().getMonth() + 1,
    Year: new Date().getFullYear(),
  });

  await transaction.save({ session });
  currentUser.rewards -= (amount * currentUserCommission) / 100;
  currentUser.balance -= amount;
  await currentUser.save({ session });

  while (currentUser && currentUser.referredBy && level <= 10) {
    const referrer = await UserModal.findOne(
      { referralCode: currentUser.referredBy },
      null,
      { session }
    );

    if (!referrer) {
      await withdrawlogReferralFailure(userId, amount, session);
      break;
    }

    const referrerCommission =
      rewardlevelmodal[referrer.Rank - 1]?.Commision || 0;

    reward = (amount * (referrerCommission - currentUserCommission)) / 100;
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
      await withdrawlogReferralFailure(userId, amount, session);
      break;
    }

    const transaction = new WithdrawModal({
      UserId: referrer._id,
      Sponser: currentUser._id,
      amount: amount,
      commision: reward,
      status: "Success",
      month: new Date().getMonth() + 1,
      Year: new Date().getFullYear(),
    });

    await transaction.save({ session });
    currentUserCommission = referrerCommission;
    currentUser = referrer;
    level++;
  }

  return rewardsDistributed;
};

const withdrawlogReferralFailure = async (userId, amount, session) => {
  try {
    const failedTransaction = new TransactionModal({
      UserId: userId,
      amount: amount,
      type: "debit",
      status: "Failure",
      month: new Date().getMonth() + 1,
      Year: new Date().getFullYear(),
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
    req.body.type = "credit";
    req.body.month = new Date().getMonth() + 1;
    req.body.Year = new Date().getFullYear();

    let user = await UserModal.findById(req.user);
    req.body.Balance = user.balance + amount;

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
const Gettransaction = async (req, res, next) => {
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
      message: "Transaction Fetched Successfully",
      data: funds,
    });
  } catch (error) {
    return next(new AppErr(error.message));
  }
};

// my transaction
const GetmyTransaction = async (req, res, next) => {
  try {
    let { type, status } = req.query;
    let filter = { UserId: req.user };

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
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

// get Commsision by admin
const GetCommision = async (req, res, next) => {
  try {
    let { status } = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }

    let funds = await CommisionModal.find(filter)
      .populate("UserId", "-Password")
      .populate("Sponser");

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Commision Fetched Successfully",
      data: funds,
    });
  } catch (error) {
    return next(new AppErr(error.message));
  }
};

// get my Commision by user
const GetmyCommision = async (req, res, next) => {
  try {
    let { status } = req.query;
    let filter = { UserId: req.user };

    if (status) {
      filter.status = status;
    }

    let funds = await CommisionModal.find(filter).populate(
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

    let { amount, UserId } = req.body;

    let user = await UserModal.findById(UserId);
    if (!user) {
      return next(new AppErr("User not found", 404));
    }

    const fundTransaction = new TransactionModal({
      UserId: UserId,
      amount: amount,
      status: "Success",
      type: "credit",
      Balance: user.balance ? user.balance : 0 + amount,
      month: new Date().getMonth() + 1,
      Year: new Date().getFullYear(),
    });

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

// withdral request
const Withdwralrequest = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let id = req.user;
    let { amount } = req.body;

    let user = await UserModal.findById(id);

    if (!user || user.balance < amount) {
      return next(
        new AppErr("You do not have enough balance to withdraw", 400)
      );
    }

    // Create withdrawal transaction
    req.body.status = "Pending";
    req.body.type = "debit";
    req.body.UserId = id;
    req.body.month = new Date().getMonth() + 1;
    req.body.Year = new Date().getFullYear();

    let withdrawTransaction = await TransactionModal.create([req.body]);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Withdrawal request created successfully",
      data: withdrawTransaction,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const ActionWithdwralrequest = async (req, res, next) => {
  const session = await TransactionModal.startSession();
  session.startTransaction();

  try {
    let { id } = req.params;
    let { status, message } = req.body;

    // Fetch transaction to get details
    let withdraw = await TransactionModal.findById(id).session(session);
    if (!withdraw) {
      await session.abortTransaction();
      return res.status(404).json({
        status: false,
        code: 404,
        message: "Transaction not found.",
      });
    }

    // Update transaction
    withdraw.status = status;
    withdraw.Remarks = message;
    await withdraw.save({ session });

    if (status === "Success" && withdraw.amount > 0) {
      await withdrawdistributeRewards(
        session,
        withdraw.UserId,
        withdraw.amount
      );
    }

    await session.commitTransaction();

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Withdrawal updated successfully.",
      data: withdraw,
    });
  } catch (error) {
    await session.abortTransaction();
    return next(new AppErr(error.message, 500));
  } finally {
    session.endSession();
  }
};

// GenerateProfit
// const GenerateProfit = async (req, res, next) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     let { month, year } = req.body;

//     const transactions = await CommisionModal.find().session(session);
//     let voucher = await VoucherModal.find({
//       month,
//       Year: year,
//     }).session(session);

//     if (voucher.length > 0) {
//       await VoucherModal.deleteMany({ month, Year: year }).session(session);
//     }

//     for (let i = 0; i < transactions.length; i++) {
//       let curruser = transactions[i].UserId;

//       let userTransactions = await CommisionModal.find({
//         UserId: curruser,
//         month,
//         Year: year,
//       }).session(session);

//       let userWithdrawals = await WithdrawModal.find({
//         UserId: curruser,
//         month,
//         Year: year,
//       }).session(session);

//       let voucheramount = await VoucherModal.findOne({
//         UserId: curruser,
//         month: month - 1,
//         Year: year,
//       }).session(session);

//       let totalAmount = 0;
//       let totalWithdrawAmount = 0;
//       let monthlyamount = 0;

//       // Calculate total earnings
//       for (let j = 0; j < userTransactions.length; j++) {
//         let dailyAmount = userTransactions[j].commision / 30;
//         let daysSinceCreated =
//           30 - new Date(userTransactions[j].createdAt).getDate();
//         totalAmount += dailyAmount * daysSinceCreated;
//         monthlyamount += dailyAmount * 30;
//       }

//       // Calculate total withdrawals
//       for (let k = 0; k < userWithdrawals.length; k++) {
//         let dailyAmount = userWithdrawals[k].commision / 30;
//         let daysSinceCreated =
//           30 - new Date(userWithdrawals[k].createdAt).getDate();
//         totalWithdrawAmount += dailyAmount * daysSinceCreated;
//       }

//       let totalProfit = totalAmount - totalWithdrawAmount;
//       let finalProfit =
//         totalProfit + (voucheramount ? voucheramount.totalmonthamount : 0);

//       let vouchercreate = new VoucherModal({
//         UserId: curruser,
//         amount: finalProfit,
//         totalmonthamount: monthlyamount,
//         status: "Paid",
//         month: new Date().getMonth() + 1,
//         Year: new Date().getFullYear(),
//       });

//       await vouchercreate.save({ session });
//     }

//     await session.commitTransaction();
//     session.endSession();

//     return res.status(200).json({
//       status: true,
//       code: 200,
//       message: "Profit Generated Successfully",
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     return next(new AppErr(error.message, 500));
//   }
// };

const GenerateProfit = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let { month, year } = req.body;

    const transactions = await CommisionModal.find().session(session);
    let voucher = await VoucherModal.find({ month, Year: year }).session(
      session
    );

    if (voucher.length > 0) {
      await VoucherModal.deleteMany({ month, Year: year }).session(session);
    }

    let processedUsers = new Set();

    for (let i = 0; i < transactions.length; i++) {
      let curruser = transactions[i].UserId.toString();

      if (processedUsers.has(curruser)) continue;
      processedUsers.add(curruser);

      let userTransactions = await CommisionModal.find({
        UserId: curruser,
        month,
        Year: year,
      }).session(session);

      let userWithdrawals = await WithdrawModal.find({
        UserId: curruser,
        month,
        Year: year,
      }).session(session);

      let voucherExists = await VoucherModal.findOne({
        UserId: curruser,
        month,
        Year: year,
      }).session(session);

      if (voucherExists) continue;

      let previousVoucher = await VoucherModal.findOne({
        UserId: curruser,
        month: month - 1,
        Year: year,
      }).session(session);

      let totalAmount = 0;
      let totalWithdrawAmount = 0;
      let monthlyamount = 0;

      // Calculate total earnings
      for (let j = 0; j < userTransactions.length; j++) {
        let dailyAmount = userTransactions[j].commision / 30;
        let daysSinceCreated =
          30 - new Date(userTransactions[j].createdAt).getDate();
        totalAmount += dailyAmount * daysSinceCreated;
        monthlyamount += dailyAmount * 30;
      }

      // Calculate total withdrawals
      for (let k = 0; k < userWithdrawals.length; k++) {
        let dailyAmount = userWithdrawals[k].commision / 30;
        let daysSinceCreated =
          30 - new Date(userWithdrawals[k].createdAt).getDate();
        totalWithdrawAmount += dailyAmount * daysSinceCreated;
      }

      let totalProfit = totalAmount - totalWithdrawAmount;
      let finalProfit =
        totalProfit + (previousVoucher ? previousVoucher.totalmonthamount : 0);

      let vouchercreate = new VoucherModal({
        UserId: curruser,
        amount: finalProfit,
        totalmonthamount: monthlyamount,
        status: "Paid",
        // month: new Date().getMonth() + 1,
        // Year: new Date().getFullYear(),
        month: month,
        Year: year,
      });

      await vouchercreate.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Profit Generated Successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppErr(error.message, 500));
  }
};

// Get Voucher
const GetVoucher = async (req, res, next) => {
  try {
    let { status, month, year } = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (month && year) {
      filter.month = month;
      filter.Year = year;
    }

    let voucher = await VoucherModal.find(filter).populate(
      "UserId",
      "-Password"
    );

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Voucher Fetched Successfully",
      data: voucher,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Transfer Profit
const UpdateProfit = async (req, res, next) => {
  try {
    let { id } = req.params;

    let withdraw = await VoucherModal.findByIdAndUpdate(
      id,
      {
        status: "Transfer",
      },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Voucher Updated Successfully",
      data: withdraw,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get Voucher by UserId
const GetVoucherbyUsetId = async (req, res, next) => {
  try {
    let { status, month, year } = req.query;
    let filter = { UserId: req.user };

    if (status) {
      filter.status = status;
    }

    if (month && year) {
      filter.month = month;
      filter.Year = year;
    }

    let voucher = await VoucherModal.find(filter).populate(
      "UserId",
      "-Password"
    );

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Voucher Fetched Successfully",
      data: voucher,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Excepted Monthly Paymnet
const ExceptedMonthlyPayment = async (req, res, next) => {
  try {
    let { month, year } = req.params;
    const transactions = await CommisionModal.find({
      month,
      Year: year,
    }).populate("UserId");

    let groupedData = {};

    transactions.forEach((item) => {
      if (!item.UserId) return;

      let userId = item.UserId._id.toString();

      if (!groupedData[userId]) {
        groupedData[userId] = {
          UserId: {
            _id: item.UserId._id,
            name: item.UserId.Name,
            email: item.UserId.Email,
            Rank: item.UserId.Rank,
            code: item.UserId.referralCode,
          },
          totalCommision: 0,
          dailyCommision: 0,
          multipliedCommision: 0,
          month: item.month,
          year: item.Year,
        };
      }

      groupedData[userId].totalCommision += item.commision;
      groupedData[userId].dailyCommision =
        groupedData[userId].totalCommision / 30; // 1-day commission
      groupedData[userId].multipliedCommision =
        groupedData[userId].dailyCommision * 30; // Monthly commission (same as totalCommision)
    });

    res.status(200).json({
      status: true,
      message: "Expected Monthly Payments Calculated",
      data: Object.values(groupedData),
    });
  } catch (error) {
    console.error("Error calculating expected monthly payment:", error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  addFund,
  Gettransaction,
  GetmyTransaction,
  GetCommision,
  GetmyCommision,
  addFundbyAdmin,
  GenerateProfit,
  Withdwralrequest,
  ActionWithdwralrequest,
  UpdateProfit,
  GetVoucher,
  GetVoucherbyUsetId,
  ExceptedMonthlyPayment,
};
