const { ethers, upgrades } = require("hardhat");

async function main() {
  const proxyAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Your deployed proxy address

  const MuishTokenV1_0_0 = await ethers.getContractFactory("MuishTokenV1_0_0");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, MuishTokenV1_0_0);

  console.log("MuishToken upgraded. Proxy still at:", upgraded.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
