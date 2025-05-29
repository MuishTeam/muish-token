const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const delay = 3600; // 1 hour for testing
  const proposers = [deployer.address];
  const executors = [deployer.address];
  const admin = deployer.address;

  const TimelockController = await ethers.getContractFactory("TimelockController");
  const timelock = await TimelockController.deploy(delay, proposers, executors, admin);

  await timelock.waitForDeployment();
  const timelockAddress = await timelock.getAddress();

  console.log("TimelockController deployed to:", timelockAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
