const express = require("express");
const { body } = require("express-validator");

const IsAdmin = require("../Middleware/IsAdmin");
const { CreateNews, GetNews, UpdateNews, DeleteNews } = require("../Controller/AppNews");
const NewsRouter = express.Router();

NewsRouter.post("/news/add", IsAdmin, CreateNews);

NewsRouter.get("/news/get/all", GetNews);

NewsRouter.patch("/update/:id", IsAdmin, UpdateNews);

NewsRouter.delete("/delete/:id", IsAdmin, DeleteNews);

module.exports = NewsRouter;
