const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // === 1. Deploy MuishTokenV1_0_0 Proxy ===
  const admin = deployer.address;
  const multisig = deployer.address;
  const treasury = deployer.address;
  const treasuryInitialMint = ethers.parseUnits("100000000", 18); // 100M MUISH

  const MuishToken = await ethers.getContractFactory("MuishTokenV1_0_0");
  const token = await upgrades.deployProxy(
    MuishToken,
    [admin, multisig, treasury, treasuryInitialMint],
    { initializer: "initialize", kind: "uups" }
  );
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ MuishTokenV1_0_0 deployed to:", tokenAddress);

  // === 2. Deploy TimelockController ===
  const delay = 3600; // 1 hour
  const proposers = [deployer.address];
  const executors = [deployer.address];
  const timelockAdmin = deployer.address;

  const TimelockController = await ethers.getContractFactory("TimelockController");
  const timelock = await TimelockController.deploy(delay, proposers, executors, timelockAdmin);
  await timelock.waitForDeployment();
  const timelockAddress = await timelock.getAddress();
  console.log("✅ TimelockController deployed to:", timelockAddress);

  // === 3. Grant Roles to Timelock ===
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
      console.log(`Granting ${roleName} to Timelock`);
      await (await token.grantRole(role, timelockAddress)).wait();
    } else {
      console.log(`${roleName} already granted`);
    }
  }

  // === 4. Deployer renounces roles ===
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

  console.log("🎉 All contracts deployed and roles transferred to Timelock.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
