// const { Wallet, ethers } = require("ethers");
// require("dotenv").config();

// const sendETH = async (senderWallet, recipientAddress, amount) => {
//   try {
//     const amountInWei = ethers.utils.parseEther(amount.toString());

//     const txPayload = {
//       to: recipientAddress,
//       value: amountInWei,
//       gasLimit: ethers.utils.hexlify(21000),
//       nonce: await senderWallet.getTransactionCount(),
//       gasPrice: await senderWallet.provider.getGasPrice(),
//       chainId: (await senderWallet.provider.getNetwork()).chainId,
//     };

//     const transactionResponse = await senderWallet.sendTransaction(txPayload);
//     const receipt = await transactionResponse.wait();
//     return receipt.transactionHash;
//   } catch (error) {
//     console.error("Error sending ETH:", error);
//   }
// };

// const checkBalance = async (provider, address) => {
//   try {
//     const balance = await provider.getBalance(address);
//     console.log(
//       `Balance of ${address} (ETH):`,
//       ethers.utils.formatEther(balance)
//     );
//   } catch (error) {
//     console.error("Error checking balance:", error);
//   }
// };

// const main = async () => {
//   if (!process.env.PRIVATE_KEY || !process.env.INFURA_API_KEY) {
//     throw new Error("Missing PRIVATE_KEY or INFURA_API_KEY in .env");
//   }
//   const provider = new ethers.providers.InfuraProvider(
//     "sepolia",
//     process.env.INFURA_API_KEY
//   );
//   const senderWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
//   const recipientAddress = "0xYourRecipientWalletAddress";
//   const amountToSend = "0.01";
//   await checkBalance(provider, senderWallet.address);
//   const txHash = await sendETH(senderWallet, recipientAddress, amountToSend);
//   if (txHash) {
//     await new Promise((resolve) => setTimeout(resolve, 15000));
//     await checkBalance(provider, recipientAddress);
//   }
// };

// module.exports=main
