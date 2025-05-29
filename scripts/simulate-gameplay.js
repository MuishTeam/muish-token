// scripts/simulate-gameplay.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  const [admin, user] = await ethers.getSigners();

  // Deploy MuishTokenV1_0_0
  const Token = await ethers.getContractFactory("MuishTokenV1_0_0");
  const token = await upgrades.deployProxy(Token, [admin.address], {
    initializer: "initialize",
  });
  await token.waitForDeployment();

  // Deploy GameHook with MuishToken address and admin
  const GameHook = await ethers.getContractFactory("GameHook");
  const hook = await upgrades.deployProxy(GameHook, [token.target, admin.address], {
    initializer: "initialize",
  });
  await hook.waitForDeployment();

  // Grant roles to hook
  await token.grantRole(await token.MINTER_ROLE(), hook.target);
  await token.grantRole(await token.BURNER_ROLE(), hook.target);

  console.log("Initial user balance:", ethers.formatUnits(await token.balanceOf(user.address), 18));

  // Simulate reward
  await hook.rewardPlayer(user.address, ethers.parseUnits("300", 18));
  console.log("User balance after reward:", ethers.formatUnits(await token.balanceOf(user.address), 18));

  // Simulate penalty
  await token.connect(user).approve(hook.target, ethers.parseUnits("100", 18));
  await hook.penalizePlayer(user.address, ethers.parseUnits("100", 18));
  console.log("User balance after penalty:", ethers.formatUnits(await token.balanceOf(user.address), 18));
  console.log("Hook balance:", ethers.formatUnits(await token.balanceOf(hook.target), 18));

  // Simulate burn
  await hook.burnPlayerTokens(ethers.parseUnits("50", 18));
  console.log("Hook balance after burn:", ethers.formatUnits(await token.balanceOf(hook.target), 18));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
