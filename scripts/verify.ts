import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  // Read deployment addresses
  const deploymentsPath = path.join(__dirname, "deployed_addresses.json");
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));

  // Get network info
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;

  console.log(`Verifying contracts on ${networkName}...`);

  // Verify each contract
  for (const [contractName, address] of Object.entries(deployments)) {
    if (typeof address !== "string") continue; // Skip non-address entries

    console.log(`Verifying ${contractName} at ${address}...`);

    try {
      // Get contract artifact
      const artifactPath = path.join(
        __dirname,
        "../artifacts/contracts",
        `${contractName}.sol`,
        `${contractName}.json`
      );
      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

      // Verify contract
      await ethers.provider.send("hardhat_verify", {
        address,
        constructorArguments: [],
        contract: `${contractName}.sol:${contractName}`,
      });

      console.log(`Successfully verified ${contractName}`);
    } catch (error) {
      console.error(`Failed to verify ${contractName}:`, error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
