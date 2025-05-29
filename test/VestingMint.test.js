// test/VestingMint.test.js
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

function toWei(val) {
  return ethers.parseUnits(val.toString(), 18);
}

describe("TokenVesting Mint Integration", function () {
  let token, vesting, deployer, beneficiary;

  beforeEach(async function () {
    [deployer, beneficiary] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MuishTokenV1_0_0");
    token = await upgrades.deployProxy(
      Token,
      [deployer.address, deployer.address, deployer.address, toWei(100000000)],
      { initializer: "initialize", kind: "uups" }
    );

    const Vesting = await ethers.getContractFactory("TokenVesting");
    vesting = await upgrades.deployProxy(
      Vesting,
      [await token.getAddress(), deployer.address],
      { initializer: "initialize", kind: "uups" }
    );

    // Fund the vesting contract with tokens
    await token.mint(await vesting.getAddress(), toWei(1000));
  });

  it("should mint tokens to beneficiary via vesting release", async function () {
    const now = (await ethers.provider.getBlock("latest")).timestamp;
    const cliff = 1; // 1 second cliff for test
    const duration = 10; // 10 seconds vesting
    const amount = toWei(1000);

    await vesting.connect(deployer).addGrant(
      beneficiary.address,
      amount,
      now,
      cliff,
      duration
    );

    await ethers.provider.send("evm_increaseTime", [cliff + duration]);
    await ethers.provider.send("evm_mine");

    await vesting.connect(beneficiary).claim(0);
    const balance = await token.balanceOf(beneficiary.address);
    expect(balance).to.equal(amount);
  });
});
