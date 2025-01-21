const Bull = require("bull");
const AppErr = require("./AppError");
const SendEmail = require("./Email");

const emailQueue = new Bull("emailQueue", {
  redis: {
    host: "redis-11138.c241.us-east-1-4.ec2.redns.redis-cloud.com",
    port: 11138,
    password: "Jbrm2gGFYcUlQJT7btYvLkmFwZwtBLME",
  },
});

const ProcessEmailJob = async (job) => {
  try {
    const { email, subject, name, extraData } = job.data;

    await SendEmail(email, subject, name, extraData);
  } catch (error) {
    throw new AppErr(error.message, 500);
  }
};

emailQueue.process(ProcessEmailJob);

emailQueue.on("error", (err) => {
  console.error("Redis connection error:", err);
});

emailQueue.on("ready", () => {
  console.log("Connected to Redis successfully");
});

module.exports = emailQueue;
