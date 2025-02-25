const { validationResult } = require("express-validator");
const AppErr = require("../Helper/AppError");
const UserModel = require("../Modal/Users");
const DirectCommisionmodal = require("../Modal/DirectCommision");

// Create Direct commision
const CreateDirectCommision = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }
    let { amount, UserId, sendertoken, receivertoken } = req.body;

    let user = await UserModel.findById(UserId);
    if (!user) {
      return next(new AppErr("User not found", 500));
    }

    req.body.month = new Date().getMonth() + 1;
    req.body.Year = new Date().getFullYear();

    let direct = await DirectCommisionmodal.create(req.body);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Direct commision created Successfully",
      data: direct,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Update Direct Commision
const UpdateDirectCommision = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }
    let { amount, sendertoken, receivertoken, month, Year } = req.body;
    let { id } = req.params;

    let direct = await DirectCommisionmodal.updateOne(
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
      message: "Direct commision Updated Successfully",
      data:direct
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get All Direct Commision
const GetDirectCommision = async (req, res, next) => {
  try {
    let direct = await DirectCommisionmodal.find();
    return res.status(200).json({
      status: true,
      code: 200,
      message: "Direct commision Fetched Successfully",
      data: direct,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get By Id Direct Commision

const GetDirectCommisionById = async (req, res, next) => {
  try {
    let { id } = req.params;
    let direct = await DirectCommisionmodal.findById(id);
    return res.status(200).json({
      status: true,
      code: 200,
      message: "Direct commision Fetched Successfully",
      data: direct,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get Direct Commision by User
const GetDirectCommisionByUserId = async (req, res, next) => {
  try {
    let direct = await DirectCommisionmodal.find({
      UserId: req.user,
    });
    return res.status(200).json({
      status: true,
      code: 200,
      message: "Direct commision Fetched Successfully",
      data: direct,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get Direct Commision Count by userId
const GetDirectCommisionByUserIdCount = async (req, res, next) => {
  try {
    let sum = 0;
    let direct = await DirectCommisionmodal.find({
      UserId: req.user,
    });
    for (var i = 0; i < direct.length; i++) {
      sum += direct[i].amount;
    }
    return res.status(200).json({
      status: true,
      code: 200,
      message: "Direct commision Fetched Successfully",
      data: sum
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  CreateDirectCommision,
  UpdateDirectCommision,
  GetDirectCommision,
  GetDirectCommisionById,
  GetDirectCommisionByUserId,
  GetDirectCommisionByUserIdCount,
};
