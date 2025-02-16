const express = require("express");
const { body } = require("express-validator");

const IsAdmin = require("../Middleware/IsAdmin");
const {
  CreateTicket,
  UpdateTciket,
  GetTicket,
  ResolveTicket,
  GetTicketbyUser,
  ReopenTicket,
  DeleteTicket,
} = require("../Controller/Tickets");
const IsUser = require("../Middleware/isUser");

const TicketRouter = express.Router();

TicketRouter.post("/users/add", IsUser, CreateTicket);

TicketRouter.patch("/update/:id", IsUser, UpdateTciket);

TicketRouter.get("/admin/get", IsAdmin, GetTicket);

TicketRouter.patch("/admin/resolve/:id", IsAdmin, ResolveTicket);

TicketRouter.get("/users/myticket", IsUser, GetTicketbyUser);

TicketRouter.patch("/users/reopen/:id", IsUser, ReopenTicket);

TicketRouter.delete("/users/:id", IsUser, DeleteTicket);

module.exports = TicketRouter;
