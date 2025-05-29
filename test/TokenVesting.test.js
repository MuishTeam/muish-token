// test/TokenVesting.test.js
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

function toWei(val) {
  return ethers.parseUnits(val.toString(), 18);
}

describe("TokenVesting", function () {
  let Token, Vesting, token, vesting;
  let admin, vester, beneficiary;
  const initialSupply = toWei(100000000);

  beforeEach(async function () {
    [admin, vester, beneficiary] = await ethers.getSigners();

    Token = await ethers.getContractFactory("MuishTokenV1_0_0");
    token = await upgrades.deployProxy(
      Token,
      [admin.address, admin.address, admin.address, initialSupply],
      { initializer: "initialize", kind: "uups" }
    );

    Vesting = await ethers.getContractFactory("TokenVesting");
    vesting = await upgrades.deployProxy(
      Vesting,
      [await token.getAddress(), admin.address],
      { initializer: "initialize", kind: "uups" }
    );

    await token.connect(admin).mint(await vesting.getAddress(), toWei(100000));
  });

  it("should create a vesting grant", async function () {
    const now = (await ethers.provider.getBlock("latest")).timestamp;
    await vesting.connect(admin).addGrant(
      beneficiary.address,
      toWei(1000),
      now,
      60,
      600
    );

    const grants = await vesting.getGrants(beneficiary.address);
    expect(grants.length).to.equal(1);
    expect(grants[0].total).to.equal(toWei(1000));
  });

  it("should allow claiming after cliff", async function () {
    const now = (await ethers.provider.getBlock("latest")).timestamp;
    await vesting.connect(admin).addGrant(
      beneficiary.address,
      toWei(600),
      now,
      1,
      10
    );

    await ethers.provider.send("evm_increaseTime", [2]);
    await ethers.provider.send("evm_mine", []);

    await vesting.connect(beneficiary).claim(0);
    const balance = await token.balanceOf(beneficiary.address);
    expect(balance).to.be.gt(0);
  });

  it("should not allow claiming before cliff", async function () {
    const now = (await ethers.provider.getBlock("latest")).timestamp;
    await vesting.connect(admin).addGrant(
      beneficiary.address,
      toWei(600),
      now,
      60,
      600
    );

    await expect(vesting.connect(beneficiary).claim(0)).to.be.revertedWith("Cliff not reached");
  });

  it("should revoke a grant", async function () {
    const now = (await ethers.provider.getBlock("latest")).timestamp;
    await vesting.connect(admin).addGrant(
      beneficiary.address,
      toWei(600),
      now,
      1,
      10
    );

    await vesting.connect(admin).revokeGrant(beneficiary.address, 0);
    const grants = await vesting.getGrants(beneficiary.address);
    expect(grants[0].revoked).to.be.true;
  });
});
