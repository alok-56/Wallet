const AppErr = require("../Helper/AppError");
const AppnewsModal = require("../Modal/Appnews");

// Create News
const CreateNews = async (req, res, next) => {
  try {
    let { news } = req.body;

    if (!news) {
      return next(new AppErr("news is required", 400));
    }

    let newscreated = await AppnewsModal.create(req.body);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "News Created Successfully",
      data: newscreated,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const UpdateNews = async (req, res, next) => {
  try {
    let { id } = req.params;
    let { news } = req.body;

    let newscreated = await AppnewsModal.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    return res.status(200).json({
      status: true,
      code: 200,
      message: "News Updated Successfully",
      data: newscreated,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const GetNews = async (req, res, next) => {
  try {
    let newscreated = await AppnewsModal.find();

    return res.status(200).json({
      status: true,
      code: 200,
      message: "News Fetched Successfully",
      data: newscreated,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const DeleteNews = async (req, res, next) => {
  try {
    let { id } = req.params;
    await AppnewsModal.findByIdAndDelete(id);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "News Deleted Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  CreateNews,
  UpdateNews,
  GetNews,
  DeleteNews
};
