const mongoose = require("mongoose");
require("dotenv").config();

//----Database connectivity-----//
const ConnectDatabase = async () => {
  mongoose
    .connect(process.env.DTATBASE_URL)
    .then((res) => {
      console.log("Database connected successfuly");
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = ConnectDatabase;
