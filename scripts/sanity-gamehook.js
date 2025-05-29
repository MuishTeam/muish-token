const { ethers } = require("hardhat");

async function main() {
  const [admin, user] = await ethers.getSigners();

  const tokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // your proxy token
  const hookAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6"; // your GameHook

  const token = await ethers.getContractAt("MuishTokenV1_0_0", tokenAddress);
  const hook = await ethers.getContractAt("GameHook", hookAddress);

  console.log("Admin:", admin.address);
  console.log("User:", user.address);

  console.log("Granting GAME_ROLE to admin...");
  const role = await hook.GAME_ROLE();
  await hook.grantRole(role, admin.address);

  console.log("Rewarding user with 500 MUISH...");
  await hook.rewardPlayer(user.address, ethers.parseUnits("500", 18));
  const userBal1 = await token.balanceOf(user.address);
  console.log("User balance:", ethers.formatUnits(userBal1, 18));

  console.log("Penalizing user by 200 MUISH...");
  await token.connect(user).approve(hookAddress, ethers.parseUnits("200", 18));
  await hook.penalizePlayer(user.address, ethers.parseUnits("200", 18));

  const userBal2 = await token.balanceOf(user.address);
  const hookBal = await token.balanceOf(hookAddress);
  console.log("User balance after penalty:", ethers.formatUnits(userBal2, 18));
  console.log("Hook contract balance:", ethers.formatUnits(hookBal, 18));

  console.log("Burning 100 MUISH from hook balance...");
  await hook.burnPlayerTokens(ethers.parseUnits("100", 18));

  const hookBalFinal = await token.balanceOf(hookAddress);
  console.log("Hook contract balance after burn:", ethers.formatUnits(hookBalFinal, 18));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
