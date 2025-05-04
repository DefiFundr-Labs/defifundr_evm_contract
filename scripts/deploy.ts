import fs from "fs";
import { ethers } from "hardhat";
import path from "path";

async function main() {
  // Get network details
  const network = await ethers.provider.getNetwork();
  console.log(
    `Deploying to network: ${network.name} (chain ID: ${network.chainId})`
  );

  // Deploy contracts
  const contracts = [{ name: "Lock", args: [] }];

  const deployments: Record<string, any> = {
    network: network.name,
    chainId: Number(network.chainId),
    deployedAt: Math.floor(Date.now() / 1000),
    contracts: {},
  };

  for (const { name, args } of contracts) {
    console.log(`\nDeploying ${name}...`);

    const Contract = await ethers.getContractFactory(name);

    // Estimate gas
    const deployTx = await Contract.getDeployTransaction(...args);
    const estimatedGas = await ethers.provider.estimateGas(deployTx);
    console.log(`Estimated deployment gas: ${estimatedGas.toString()}`);

    // Deploy with gas buffer
    console.log("Deploying contract...");
    const contract = await Contract.deploy(...args, {
      gasLimit: Number(estimatedGas) + Math.floor(Number(estimatedGas) * 0.1), // Add 10% buffer
    });

    // Wait for deployment
    const deploymentTx = await contract.deploymentTransaction();
    if (!deploymentTx) {
      throw new Error(`Deployment transaction not found for ${name}`);
    }

    const deployReceipt = await deploymentTx.wait();
    const actualGas = deployReceipt?.gasUsed || 0n;
    const address = await contract.getAddress();

    console.log(`${name} deployed at: ${address}`);
    console.log(`Actual deployment gas used: ${actualGas.toString()}`);

    // Save deployment info
    deployments.contracts[name] = {
      address,
      gasUsed: actualGas.toString(),
      transactionHash: deploymentTx.hash,
      args,
    };
  }

  // Save deployment info to the expected location
  const deploymentPath = path.join(__dirname, "deployed_addresses.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deployments, null, 2));

  console.log(`\nDeployment info saved to ${deploymentPath}`);
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
