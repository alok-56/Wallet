const AppErr = require("../Helper/AppError");
const verifyToken = require("../Helper/VerifyToken");
const UserModal = require("../Modal/Users");

const IsUser = async (req, res, next) => {
  try {
    let { token } = req.headers;
    if (!token) {
      return next(new AppErr("unAuthorized User", 401));
    }
    let { id } = await verifyToken(token);
    req.user = id;

    let user = await UserModal.findById(id);
    if (!user) {
      return next(new AppErr("Invailed Token", 401));
    }

    if (user.role === "user" && user.active) {
      return next();
    } else {
      return next(new AppErr("Do not have access", 401));
    }
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = IsUser;
