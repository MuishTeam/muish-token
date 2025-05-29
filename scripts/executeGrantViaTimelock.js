// scripts/executeGrantViaTimelock.js
const { ethers } = require("hardhat");

async function main() {
  const tokenAddress = "0x9A676e781A523b5d0C0e43731313A708CB607508";
  const timelockAddress = "0x0B306BF915C4d645ff596e518fAf3F9669b97016";
  const vestingAddress = "0x4A679253410272dd5232B3Ff7cF5dbB88f295319";

  const token = await ethers.getContractAt("MuishTokenV1_0_0", tokenAddress);
  const timelock = await ethers.getContractAt("TimelockController", timelockAddress);

  const MINTER_ROLE = await token.MINTER_ROLE();
  const grantRoleData = token.interface.encodeFunctionData("grantRole", [MINTER_ROLE, vestingAddress]);
  const salt = ethers.keccak256(ethers.toUtf8Bytes("grant-minter-to-vesting"));
  const predecessor = ethers.ZeroHash;

  console.log("⏩ Advancing time by 1 hour to satisfy timelock...");
  await ethers.provider.send("evm_increaseTime", [3600]);
  await ethers.provider.send("evm_mine");

  console.log("🚀 Executing grantRole via Timelock...");
  const tx = await timelock.execute(
    tokenAddress,
    0,
    grantRoleData,
    predecessor,
    salt
  );
  await tx.wait();

  console.log("✅ MINTER_ROLE granted to TokenVesting.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
