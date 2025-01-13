const Bull = require("bull");
const AppErr = require("./AppError");

const emailQueue = new Bull("emailQueue", {
  redis: {
    HOST: "localhost",
    PORT: 8080,
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
