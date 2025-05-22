import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  const networkName = hre.network.name;
  console.log(`Deploying to network: ${networkName}`);

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy contract
  const Lock = await ethers.getContractFactory("Lock");
  const unlockTime = Math.floor(Date.now() / 1000) + 60; // 1 minute from now
  const lockedAmount = ethers.parseEther("0.01");

  console.log("Deploying Lock contract...");
  console.log("Unlock time:", unlockTime);
  console.log("Locked amount:", ethers.formatEther(lockedAmount), "ETH");

  const lock = await Lock.deploy(unlockTime, { value: lockedAmount });
  await lock.waitForDeployment();

  const lockAddress = await lock.getAddress();
  console.log("Lock contract deployed to:", lockAddress);

  // Save deployment info
  const deploymentInfo = {
    network: networkName,
    contractAddress: lockAddress,
    deployer: deployer.address,
    unlockTime: unlockTime,
    lockedAmount: ethers.formatEther(lockedAmount),
    deploymentTime: new Date().toISOString(),
    transactionHash: lock.deploymentTransaction()?.hash
  };

  console.log("Deployment Info:", JSON.stringify(deploymentInfo, null, 2));

  // Verify on Etherscan (not for localhost)
  if (networkName !== "hardhat" && networkName !== "localhost") {
    console.log("Waiting for block confirmations...");
    await lock.deploymentTransaction()?.wait(6);
    
    console.log("Verifying contract...");
    try {
      await hre.run("verify:verify", {
        address: lockAddress,
        constructorArguments: [unlockTime],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.log("Verification failed:", error);
    }
  }

  // Test basic functionality
  console.log("Testing basic functionality...");
  try {
    const owner = await lock.owner();
    const unlockTimeFromContract = await lock.unlockTime();
    console.log("Contract owner:", owner);
    console.log("Unlock time from contract:", unlockTimeFromContract.toString());
  } catch (error) {
    console.log("Error testing functionality:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });