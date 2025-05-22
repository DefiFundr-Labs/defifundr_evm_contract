import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  const networkName = hre.network.name;
  console.log(`\n=== Network Information for: ${networkName} ===`);

  try {
    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log("Chain ID:", network.chainId.toString());
    console.log("Network Name:", network.name);

    // Get accounts
    const accounts = await ethers.getSigners();
    console.log(`\nAvailable Accounts (${accounts.length}):`);
    
    for (let i = 0; i < Math.min(accounts.length, 5); i++) {
      const account = accounts[i];
      const balance = await ethers.provider.getBalance(account.address);
      console.log(`${i}: ${account.address} (${ethers.formatEther(balance)} ETH)`);
    }

    // Get network stats
    const block = await ethers.provider.getBlock("latest");
    if (block) {
      console.log("\nLatest Block:");
      console.log("Block Number:", block.number);
      console.log("Block Hash:", block.hash);
      console.log("Timestamp:", new Date(block.timestamp * 1000).toISOString());
      console.log("Gas Limit:", block.gasLimit.toString());
      console.log("Gas Used:", block.gasUsed.toString());
      console.log("Base Fee:", block.baseFeePerGas?.toString() || "N/A");
    }

    // Get gas price
    try {
      const gasPrice = await ethers.provider.getFeeData();
      console.log("\nGas Information:");
      console.log("Gas Price:", gasPrice.gasPrice?.toString() || "N/A", "wei");
      console.log("Max Fee Per Gas:", gasPrice.maxFeePerGas?.toString() || "N/A", "wei");
      console.log("Max Priority Fee:", gasPrice.maxPriorityFeePerGas?.toString() || "N/A", "wei");
    } catch (error) {
      console.log("Could not fetch gas information:", error);
    }

    // Network-specific information
    const networkConfig = hre.network.config;
    console.log("\nNetwork Configuration:");
    console.log("URL:", networkConfig.url || "Default");
    console.log("Timeout:", networkConfig.timeout || "Default");
    console.log("Gas:", networkConfig.gas || "Auto");
    console.log("Gas Price:", networkConfig.gasPrice || "Auto");

  } catch (error) {
    console.error("Error getting network information:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });