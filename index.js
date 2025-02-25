const express = require("express");
const Db = require("./Config/DbConnection");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const globalErrHandler = require("./Middleware/globalerror");
const AppErr = require("./Helper/AppError");
const UserRouter = require("./Routes/Users");
const AdminRouter = require("./Routes/Admin");
const TransactionRouter = require("./Routes/Transaction");
const RankingRouter = require("./Routes/Ranking");
const NewsRouter = require("./Routes/Appnews");
const TicketRouter = require("./Routes/Ticket");
const DirectCommisionRouter = require("./Routes/DirectCommision");


require("dotenv").config();
Db();
const app = express();

// global Middleware
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
app.use(cors());
app.use(helmet());
app.use(mongoSanitize());
app.use(express.json());

// Route Middleware
app.use("/api/v1/users", UserRouter);
app.use("/api/v1/admin", AdminRouter);
app.use("/api/v1/transaction", TransactionRouter);
app.use("/api/v1/ranking", RankingRouter);
app.use("/api/v1/Appnews", NewsRouter);
app.use("/api/v1/ticket", TicketRouter);
app.use("/api/v1/commision", DirectCommisionRouter);

//Not Found Route Page
app.use("*", (req, res, next) => {
  return next(new AppErr("Route Not Found", 404));
});

// Global Error
app.use(globalErrHandler);

const PORT = process.env.PORT || 3000;
const Applisten = () => {
  app.listen(PORT, () => {
    console.log(`App is listening on ${PORT}`);
  });
};
Applisten();
