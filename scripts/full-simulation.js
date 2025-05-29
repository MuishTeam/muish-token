const { ethers, upgrades } = require("hardhat");

async function main() {
  const [admin, user] = await ethers.getSigners();

  console.log("Deploying MuishTokenV1_0_0 proxy...");
  const Token = await ethers.getContractFactory("MuishTokenV1_0_0");
  const token = await upgrades.deployProxy(Token, [admin.address], {
    initializer: "initialize",
  });
  await token.waitForDeployment();
  console.log("MuishTokenV1_0_0 proxy deployed to:", token.target);

  // Grant MINTER and BURNER roles to admin (redundant, but explicit)
  const MINTER_ROLE = await token.MINTER_ROLE();
  const BURNER_ROLE = await token.BURNER_ROLE();
  await token.grantRole(MINTER_ROLE, admin.address);
  await token.grantRole(BURNER_ROLE, admin.address);

  // Deploy GameHook
  console.log("Deploying GameHook...");
  const GameHook = await ethers.getContractFactory("GameHook");
  const hook = await upgrades.deployProxy(GameHook, [token.target, admin.address], {
    initializer: "initialize",
  });
  await hook.waitForDeployment();
  console.log("GameHook deployed to:", hook.target);

  const GAME_ROLE = await hook.GAME_ROLE();
  await hook.grantRole(GAME_ROLE, admin.address);

  // Grant GameHook permission to mint/burn
  await token.grantRole(MINTER_ROLE, hook.target);
  await token.grantRole(BURNER_ROLE, hook.target);

  // Simulate reward
  console.log("Rewarding user with 300 MUISH...");
  await hook.rewardPlayer(user.address, ethers.parseUnits("300", 18));
  let userBal = await token.balanceOf(user.address);
  console.log("User balance after reward:", ethers.formatUnits(userBal, 18));

  // Simulate penalty (user must approve)
  console.log("Approving hook to take 100 MUISH from user...");
  await token.connect(user).approve(hook.target, ethers.parseUnits("100", 18));
  await hook.penalizePlayer(user.address, ethers.parseUnits("100", 18));
  userBal = await token.balanceOf(user.address);
  let hookBal = await token.balanceOf(hook.target);
  console.log("User balance after penalty:", ethers.formatUnits(userBal, 18));
  console.log("Hook contract balance:", ethers.formatUnits(hookBal, 18));

  // Simulate burn
  console.log("Burning 50 MUISH from hook...");
  await hook.burnPlayerTokens(ethers.parseUnits("50", 18));
  hookBal = await token.balanceOf(hook.target);
  console.log("Hook contract balance after burn:", ethers.formatUnits(hookBal, 18));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
