// scripts/grantMinterViaTimelock.js
const { ethers } = require("hardhat");

async function main() {
  const [proposer] = await ethers.getSigners();

  const tokenAddress = "0x9A676e781A523b5d0C0e43731313A708CB607508"; // MuishTokenV1_0_0 proxy
  const timelockAddress = "0x0B306BF915C4d645ff596e518fAf3F9669b97016";
  const vestingAddress = "0x4A679253410272dd5232B3Ff7cF5dbB88f295319"; // TokenVesting proxy

  const token = await ethers.getContractAt("MuishTokenV1_0_0", tokenAddress);
  const timelock = await ethers.getContractAt("TimelockController", timelockAddress);

  const MINTER_ROLE = await token.MINTER_ROLE();
  const grantRoleData = token.interface.encodeFunctionData("grantRole", [MINTER_ROLE, vestingAddress]);

  const etaDelay = 3600; // 1 hour
  const salt = ethers.keccak256(ethers.toUtf8Bytes("grant-minter-to-vesting"));
  const predecessor = ethers.ZeroHash;

  console.log("Queuing grantRole call via Timelock...");
  const tx = await timelock.schedule(
    tokenAddress,
    0,
    grantRoleData,
    predecessor,
    salt,
    etaDelay
  );
  await tx.wait();

  console.log("✅ Transaction queued. Now advance time and run the execute script to finalize.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
