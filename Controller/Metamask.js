const { Wallet, ethers } = require("ethers");
require("dotenv").config();

const generateTestWallet = () => {
  const testWallet = Wallet.createRandom();
  return testWallet;
};

const sendETH = async (senderWallet, recipientAddress, amount) => {
  try {
    const amountInWei = ethers.utils.parseEther(amount.toString());

    const tx = {
      to: recipientAddress,
      value: amountInWei,
    };

    const transactionResponse = await senderWallet.sendTransaction(tx);
    await transactionResponse.wait();
    return transactionResponse.hash;
  } catch (error) {
    console.error("Error sending ETH:", error);
  }
};

const checkBalance = async (provider, address) => {
  try {
    const balance = await provider.getBalance(address);
    console.log("Balance of Address (ETH):", ethers.utils.formatEther(balance));
  } catch (error) {
    console.error("Error checking balance:", error);
  }
};

const main = async () => {
  if (!process.env.PRIVATE_KEY || !process.env.INFURA_API_KEY) {
    throw new Error("Missing PRIVATE_KEY or INFURA_API_KEY in .env");
  }

  const provider = new ethers.providers.InfuraProvider(
    "homestead",
    process.env.INFURA_API_KEY
  );
  const senderWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log(senderWallet);
  const recipientWallet = generateTestWallet();
  const amountToSend = "0.01";

  const txHash = await sendETH(
    senderWallet,
    recipientWallet.address,
    amountToSend
  );

  await checkBalance(provider, recipientWallet.address);
};

module.exports = { main };
