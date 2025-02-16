const { validationResult } = require("express-validator");
const AppErr = require("../Helper/AppError");
const Distributionmodal = require("../Modal/Ranking");

const CreateRanking = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }
    let { Rank, Commision } = req.body;

    let rank = await Distributionmodal.find({ Rank: Rank });
    if (rank?.length > 0) {
      return next(new AppErr("Rank already exists", 400));
    }

    let response = await Distributionmodal.create(req.body);

    return res.status(200).json({
      status: true,
      code: 200,
      data: response,
      message: "Ranking created Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const UpdateRanking = async (req, res, next) => {
  try {
    let { Rank, Commision, Active } = req.body;
    let { id } = req.params;

    let response = await Distributionmodal.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.status(200).json({
      status: true,
      code: 200,
      data: response,
      message: "Ranking Updated Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const GetRanking = async (req, res, next) => {
  try {
    let leveltype = await Distributionmodal.find();

    res.status(200).json({
      status: true,
      code: 200,
      data: leveltype,
      message: "Ranking Fetched Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const DeleteRanking = async (req, res, next) => {
  try {
    let { id } = req.params;
    let leveltype = await Distributionmodal.findByIdAndDelete(id);

    res.status(200).json({
      status: true,
      code: 200,
      data: leveltype,
      message: "Ranking Deleted Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  CreateRanking,
  UpdateRanking,
  GetRanking,
  DeleteRanking,
};
