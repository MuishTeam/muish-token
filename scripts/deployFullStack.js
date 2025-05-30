const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // === 1. Deploy MuishTokenV1_0_0 Proxy ===
  const admin = deployer.address; // Replace with Gnosis Safe in prod
  const multisig = deployer.address; // Replace in prod
  const treasury = deployer.address; // Replace in prod
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

  const tokenReceipt = await token.deploymentTransaction().wait();
  console.log("Gas used for MuishToken deployment:", tokenReceipt.gasUsed.toString());

  // === 2. Deploy TimelockController ===
  const delay = 3600; // 1 hour delay
  const proposers = [deployer.address];
  const executors = [deployer.address];
  const timelockAdmin = admin; // For prod, use Gnosis Safe

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
    "UPGRADER_ROLE",
    "BURNER_ROLE"
  ];

  for (const roleName of roles) {
    const role = await token[roleName]();
    const hasRole = await token.hasRole(role, timelockAddress);
    if (!hasRole) {
      console.log(`Granting ${roleName} to Timelock`);
      const tx = await token.grantRole(role, timelockAddress);
      await tx.wait();
      console.log(`✅ ${roleName} granted`);
    } else {
      console.log(`${roleName} already granted`);
    }
  }

  // === 4. Deployer Renounces Roles ===
  for (const roleName of roles) {
    const role = await token[roleName]();
    const deployerHasRole = await token.hasRole(role, deployer.address);
    if (deployerHasRole) {
      console.log(`Renouncing ${roleName} from deployer`);
      const tx = await token.renounceRole(role, deployer.address);
      await tx.wait();
      console.log(`✅ ${roleName} renounced by deployer`);
    } else {
      console.log(`Deployer does not have ${roleName}`);
    }
  }

  console.log("🎉 All contracts deployed, roles secured with Timelock.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
