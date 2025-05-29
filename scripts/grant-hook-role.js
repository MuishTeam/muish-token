const { ethers } = require("hardhat");

async function main() {
  const [admin] = await ethers.getSigners();
  const tokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const hookAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";

  const token = await ethers.getContractAt("MuishTokenV1_0_0", tokenAddress);
  const MINTER_ROLE = await token.MINTER_ROLE();

  console.log("Granting MINTER_ROLE to GameHook...");
  await token.grantRole(MINTER_ROLE, hookAddress);
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
