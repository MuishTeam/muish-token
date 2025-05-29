const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Use deployer for both multisig and treasury in local testing
  const admin = deployer.address;
  const multisig = deployer.address;
  const treasury = deployer.address;
  const treasuryInitialMint = ethers.parseUnits("100000000", 18); // 100 million MUISH

  const MuishToken = await ethers.getContractFactory("MuishTokenV1_0_0");
  const token = await upgrades.deployProxy(
    MuishToken,
    [admin, multisig, treasury, treasuryInitialMint],
    {
      initializer: "initialize",
      kind: "uups",
    }
  );

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("MuishTokenV1_0_0 deployed to:", tokenAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
