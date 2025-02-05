const { validationResult } = require("express-validator");
const AppErr = require("../Helper/AppError");
const CommisionModal = require("../Modal/Commision");

// create Commision
const CreateCommision = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { min, max, commision } = req.body;

    let commcheck = await CommisionModal.findOne({ max: { $gt: min } });
    if (commcheck) {
      return next(
        new AppErr(`minimum amount must be greather than ${commcheck.max}`, 400)
      );
    }

    if (min > max) {
      return next(
        new AppErr("Minimum Amount Cannnot be more than Maximun amount", 400)
      );
    }

    if (min < 0) {
      return next(new AppErr("Minimum Amount Cannnot less than 0", 400));
    }

    if (max < 0) {
      return next(new AppErr("Maximum Amount Cannnot less than 0", 400));
    }

    let com = await CommisionModal.create(req.body);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Commision Created Successfully",
      data: com,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get Commision
const GetCommision = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let com = await CommisionModal.find();

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Commision Fetched Successfully",
      data: com,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Get Commision by Id

const GetCommisionbyId = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { id } = req.params;
    let com = await CommisionModal.findById(id);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Commision Fetched Successfully",
      data: com,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

// Update Commision

const UpdateCommision = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    const { id } = req.params;
    let { min, max, commision } = req.body;

    if (min || max) {
      if (min > max) {
        return next(
          new AppErr("Minimum Amount Cannnot be more than Maximun amount", 400)
        );
      }

      if (min < 0) {
        return next(new AppErr("Minimum Amount Cannnot less than 0", 400));
      }

      if (max < 0) {
        return next(new AppErr("Maximum Amount Cannnot less than 0", 400));
      }
    }

    let com = await CommisionModal.updateOne(
      { _id: id },
      {
        $set: req.body,
      },
      { runValidators: true }
    );

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Commision Updated Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

/// delete commision

const DeleteCommision = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }

    let { id } = req.params;
    let com = await CommisionModal.findByIdAndDelete(id);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Commision Deleted Successfully",
      data: com,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  CreateCommision,
  GetCommision,
  GetCommisionbyId,
  UpdateCommision,
  DeleteCommision,
};
