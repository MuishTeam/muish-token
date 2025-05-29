const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const muishTokenAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const timelockAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

  const token = await ethers.getContractAt("MuishTokenV1_0_0", muishTokenAddress);

  const roles = [
    "DEFAULT_ADMIN_ROLE",
    "MINTER_ROLE",
    "PAUSER_ROLE",
    "UPGRADER_ROLE"
  ];

  for (const roleName of roles) {
    const role = await token[roleName]();
    const hasRole = await token.hasRole(role, timelockAddress);
    if (!hasRole) {
      console.log(`Granting ${roleName} to TimelockController`);
      await (await token.grantRole(role, timelockAddress)).wait();
    } else {
      console.log(`${roleName} already granted`);
    }
  }

  for (const roleName of roles) {
    const role = await token[roleName]();
    const deployerHasRole = await token.hasRole(role, deployer.address);

    if (deployerHasRole) {
      console.log(`Renouncing ${roleName} from deployer`);
      await (await token.renounceRole(role, deployer.address)).wait();
    } else {
      console.log(`Deployer does not have ${roleName}`);
    }
  }

  console.log("✅ Role transfer complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
