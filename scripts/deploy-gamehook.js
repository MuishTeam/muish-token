const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  const muishTokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // <- replace if different

  const GameHook = await ethers.getContractFactory("GameHook");

  const gameHook = await upgrades.deployProxy(
    GameHook,
    [muishTokenAddress, deployer.address],
    {
      initializer: "initialize",
    }
  );

  await gameHook.waitForDeployment();

  console.log("GameHook deployed to:", await gameHook.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
