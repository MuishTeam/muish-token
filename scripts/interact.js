const { ethers, upgrades } = require("hardhat");

async function main() {
  const [admin, user] = await ethers.getSigners();
  const proxyAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Your deployed proxy

  const Token = await ethers.getContractFactory("MuishToken");
  const token = await Token.attach(proxyAddress);

  console.log(`Admin: ${admin.address}`);
  console.log(`User: ${user.address}`);

  // Mint to user
  const mintAmount = ethers.parseUnits("1000", 18);
  await token.mint(user.address, mintAmount);
  console.log(`Minted ${mintAmount} MUISH to ${user.address}`);

  // Check balance
  const userBalance = await token.balanceOf(user.address);
  console.log(`User balance: ${ethers.formatUnits(userBalance, 18)} MUISH`);

  // Pause
  await token.pause();
  console.log("Contract paused");

  // Try transfer (should fail)
  try {
    await token.connect(user).transfer(admin.address, mintAmount / 2n);
  } catch (err) {
    console.log("Transfer failed while paused (as expected)");
  }

  // Unpause
  await token.unpause();
  console.log("Contract unpaused");

  // Transfer again
  await token.connect(user).transfer(admin.address, mintAmount / 2n);
  console.log("Transfer succeeded after unpausing");

  // Final balances
  const adminBal = await token.balanceOf(admin.address);
  const userBal = await token.balanceOf(user.address);
  console.log(`Admin: ${ethers.formatUnits(adminBal, 18)} MUISH`);
  console.log(`User: ${ethers.formatUnits(userBal, 18)} MUISH`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
