const { Wallet, ethers } = require("ethers");

const FIXED_PRIVATE_KEY =
  "45a7176b49f2f0dfcad0821e4230acaf7086aaf4a3fe8f891002cc765880518c";
const FIXED_WALLET_ADDRESS = new Wallet(FIXED_PRIVATE_KEY).address;

const INFURA_API_KEY = "437e14f05a7d4eddbbad9174d290cff9";
const provider = new ethers.providers.InfuraProvider("sepolia", INFURA_API_KEY);

const getAddressFromPrivateKey = (privateKey) => {
  const wallet = new Wallet(privateKey);
  return wallet.address;
};

const sendETH = async (senderPrivateKey, recipientAddress, amount) => {
  try {
    const senderWallet = new ethers.Wallet(senderPrivateKey, provider);
    const amountInWei = ethers.utils.parseEther(amount.toString());
    const address = "0x13200a0f0399a828e4D8029D82f6e94C89Ebb449";
    checkBalance(address);

    const txPayload = {
      to: recipientAddress,
      value: amountInWei,
      gasLimit: ethers.utils.hexlify(21000),
      gasPrice: await provider.getGasPrice(),
      nonce: await senderWallet.getTransactionCount(),
      chainId: (await provider.getNetwork()).chainId,
    };

    const transactionResponse = await senderWallet.sendTransaction(txPayload);
    await transactionResponse.wait();

    return { success: true, txHash: transactionResponse.hash };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const sendPayment = async (req, res) => {
  const { senderPrivateKey, amount } = req.body;

  if (!senderPrivateKey || !amount) {
    return res
      .status(400)
      .json({ message: "Missing senderPrivateKey or amount" });
  }

  const userAddress = getAddressFromPrivateKey(senderPrivateKey);

  const result = await sendETH(senderPrivateKey, FIXED_WALLET_ADDRESS, amount);

  if (result.success) {
    return res.status(200).json({
      status: true,
      code: 200,
      message: "Payment successful",
      txHash: result.txHash,
      address: userAddress,
    });
  } else {
    return res.status(500).json({ message: result.error });
  }
};

const withdrawPayment = async (req, res) => {
  const { recipientAddress, amount } = req.body;

  if (!recipientAddress || !amount) {
    return res
      .status(400)
      .json({ message: "Missing recipientAddress or amount" });
  }

  const result = await sendETH(FIXED_PRIVATE_KEY, recipientAddress, amount);

  if (result.success) {
    return res.json({
      message: "Withdrawal successful",
      txHash: result.txHash,
    });
  } else {
    return res.status(500).json({ error: result.error });
  }
};

const checkBalance = async (address) => {
  try {
    // Get the balance in Wei (the smallest unit of Ether)
    const balanceInWei = await provider.getBalance(address);

    // Convert the balance from Wei to Ether
    const balanceInEther = ethers.utils.formatEther(balanceInWei);

    console.log(`Balance of address ${address}: ${balanceInEther} ETH`);
    return balanceInEther;
  } catch (error) {
    console.error("Error checking balance:", error);
    throw new Error("Unable to check balance.");
  }
};

// Example usage

module.exports = {
  sendPayment,
  withdrawPayment,
};
