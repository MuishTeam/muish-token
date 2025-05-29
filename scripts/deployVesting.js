const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const tokenAddress = "0x9A676e781A523b5d0C0e43731313A708CB607508"; // MuishTokenV1_0_0 proxy

  const Vesting = await ethers.getContractFactory("TokenVesting");
  const vesting = await upgrades.deployProxy(
    Vesting,
    [tokenAddress, deployer.address],
    { initializer: "initialize", kind: "uups" }
  );

  await vesting.waitForDeployment();
  const vestingAddress = await vesting.getAddress();

  console.log("✅ TokenVesting deployed to:", vestingAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
