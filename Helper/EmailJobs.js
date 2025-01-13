const Bull = require("bull");
const AppErr = require("./AppError");

const emailQueue = new Bull("emailQueue", {
  redis: {
    HOST: "redis-11138.c241.us-east-1-4.ec2.redns.redis-cloud.com:11138",
    PORT: 6379,
    password: "Jbrm2gGFYcUlQJT7btYvLkmFwZwtBLME",
  },
});

const ProcessEmailJob = async (job) => {
  try {
    job();
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

emailQueue.process(ProcessEmailJob);

module.exports = emailQueue;
