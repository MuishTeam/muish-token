const { run } = require("hardhat");

async function verifyContract(address, constructorArgs = []) {
  console.log(`Verifying at ${address}...`);
  try {
    await run("verify:verify", {
      address,
      constructorArguments: constructorArgs,
    });
    console.log("✅ Verification complete\n");
  } catch (err) {
    if (err.message.toLowerCase().includes("already verified")) {
      console.log("⚠️ Already verified\n");
    } else {
      console.error("❌ Verification failed:", err);
    }
  }
}

async function main() {
  const networkName = hre.network.name;
  console.log(`Running verification on ${networkName}`);

  // Replace with your actual deployed addresses
  const muishTokenAddress = "0x..."; // <- Replace
  const vestingAddress = "0x...";    // <- Replace

  const tokenConstructorArgs = []; // UUPS proxies don't use constructor args
  const vestingConstructorArgs = [];

  await verifyContract(muishTokenAddress, tokenConstructorArgs);
  await verifyContract(vestingAddress, vestingConstructorArgs);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
