const { validationResult } = require("express-validator");
const AppErr = require("../Helper/AppError");

const TicketModal = require("../Modal/Tickets");

const CreateTicket = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }
    let { title, description } = req.body;
    req.body.createdBy = req.user;
    req.body.ticketNo = "Tk" + Math.floor(Math.random() * 100000);

    let response = await TicketModal.create(req.body);

    return res.status(200).json({
      status: true,
      code: 200,
      data: response,
      message: "Ticket created Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const UpdateTciket = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }
    let { id } = req.params;
    let { title, description } = req.body;
    req.body.createdBy = req.user;

    let response = await TicketModal.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    return res.status(200).json({
      status: true,
      code: 200,
      data: response,
      message: "Ticket Updated Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const GetTicket = async (req, res, next) => {
  try {
    let ticket = await TicketModal.find().populate("createdBy", "-Password");

    res.status(200).json({
      status: true,
      code: 200,
      data: ticket,
      message: "Ticket Fetched Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const GetTicketbyUser = async (req, res, next) => {
  try {
    let ticket = await TicketModal.find({ createdBy: req.user });

    res.status(200).json({
      status: true,
      code: 200,
      data: ticket,
      message: "Ticket Fetched Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const ResolveTicket = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }
    let { id } = req.params;
    let { remarks } = req.body;
    req.body.status = "Resolved";

    let response = await TicketModal.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    return res.status(200).json({
      status: true,
      code: 200,
      data: response,
      message: "Ticket Resolved Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const ReopenTicket = async (req, res, next) => {
  try {
    let err = validationResult(req);
    if (err.errors.length > 0) {
      return next(new AppErr(err.errors[0].msg, 403));
    }
    let { id } = req.params;
    let { reopenremarks } = req.body;
    req.body.status = "Reopen";

    let response = await TicketModal.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    return res.status(200).json({
      status: true,
      code: 200,
      data: response,
      message: "Ticket Reopen Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const DeleteTicket = async (req, res, next) => {
  try {
    let { id } = req.params;
    let ticket = await TicketModal.findByIdAndDelete(id);

    res.status(200).json({
      status: true,
      code: 200,
      data: ticket,
      message: "Ticket Deleted Successfully",
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  CreateTicket,
  UpdateTciket,
  GetTicket,
  GetTicketbyUser,
  ResolveTicket,
  ReopenTicket,
  DeleteTicket,
};
