import fs from "fs";
import path from "path";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import hre from "hardhat";

async function main() {
  // Get network details
  const network = await ethers.provider.getNetwork();
  console.log(
    `Verifying contracts on network: ${network.name} (chain ID: ${network.chainId})`
  );

  // Read deployment info
  const deploymentPath = path.join(__dirname, "deployed_addresses.json");
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`Deployment file not found at ${deploymentPath}`);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

  // Verify we're on the correct network
  if (deploymentInfo.chainId !== Number(network.chainId)) {
    throw new Error(
      `Deployment info chain ID (${deploymentInfo.chainId}) does not match current network (${network.chainId})`
    );
  }

  // Verify each contract
  for (const [contractName, contractInfo] of Object.entries(
    deploymentInfo.contracts
  )) {
    const info = contractInfo as { address: string; args: any[] };
    console.log(`\nVerifying ${contractName} at ${info.address}...`);

    try {
      await hre.run("verify:verify", {
        address: info.address,
        constructorArguments: info.args,
      });
      console.log(`✅ ${contractName} verified successfully`);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Already Verified")) {
          console.log(`ℹ️ ${contractName} is already verified`);
        } else {
          console.error(`❌ Failed to verify ${contractName}:`, error.message);
        }
      } else {
        console.error(`❌ Failed to verify ${contractName}:`, error);
      }
    }
  }
}

// Execute verification
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
