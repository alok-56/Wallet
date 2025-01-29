const { default: MetaMaskSDK } = require("@metamask/sdk");
const AppErr = require("../Helper/AppError");
const { ethers } = require("ethers");
require("dotenv").config();

const MMSDK = new MetaMaskSDK({
  dappMetadata: {
    name: "Metamask transfer Api",
    url: "http://localhost:3000",
  },
  infuraAPIKey: process.env.INFURA_API_KEY,
});

const provider = new ethers.providers.InfuraProvider(
  "homestead",
  process.env.INFURA_API_KEY
);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const Sendmoney = async (req, res, next) => {
  try {
    let { recipientAddress, amount } = req.body;
    if (!ethers.utils.isAddress(recipientAddress)) {
      return next(new AppErr("Invailed recipient Address", 400));
    }
    if (isNaN(amount) || amount <= 0) {
      return next(new AppErr("Invailed amount", 400));
    }

    const amountInWei = ethers.utils.parseEther(amount.toString());

    const tx = {
      to: recipientAddress,
      value: amountInWei,
    };

    const transactionResponse = await wallet.sendTransaction(tx);
    await transactionResponse.wait();

    res.status(200).json({
      status: true,
      code: 200,
      message: transactionResponse,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  Sendmoney,
};
