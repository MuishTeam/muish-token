// test/TokenVesting.full.test.js
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

function toWei(val) {
  return ethers.parseUnits(val.toString(), 18);
}

describe("TokenVesting Full Suite", function () {
  let token, vesting, deployer, user1, user2;

  beforeEach(async function () {
    [deployer, user1, user2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MuishTokenV1_0_0");
    token = await upgrades.deployProxy(Token, [deployer.address, deployer.address, deployer.address, toWei(100000000)], {
      initializer: "initialize",
      kind: "uups",
    });

    const Vesting = await ethers.getContractFactory("TokenVesting");
    vesting = await upgrades.deployProxy(Vesting, [await token.getAddress(), deployer.address], {
      initializer: "initialize",
      kind: "uups",
    });

    await token.mint(await vesting.getAddress(), toWei(1000000));
  });

  it("should release partial vested amount mid-duration", async function () {
    const now = await time.latest();
    const cliff = 60 * 60 * 24 * 30;
    const duration = 60 * 60 * 24 * 365;
    const total = toWei(1000);

    await vesting.addGrant(user1.address, total, now, cliff, duration);

    await time.increaseTo(now + cliff + duration / 2);
    await vesting.connect(user1).claim(0);

    const balance = await token.balanceOf(user1.address);
    expect(balance).to.be.gt(0);
  });

  it("should allow multiple grants per user", async function () {
    const now = await time.latest();
    const total = toWei(500);

    await vesting.addGrant(user1.address, total, now, 0, 100);
    await vesting.addGrant(user1.address, total, now, 0, 100);

    const grants = await vesting.getGrants(user1.address);
    expect(grants.length).to.equal(2);
  });

  it("should not allow claiming after full vesting claimed", async function () {
    const now = await time.latest();
    const total = toWei(500);

    await vesting.addGrant(user1.address, total, now, 0, 100);
    await time.increaseTo(now + 200);
    await vesting.connect(user1).claim(0);

    await expect(vesting.connect(user1).claim(0)).to.be.revertedWith("Nothing to claim");
  });

  it("should not allow non-controller to add or revoke grants", async function () {
    const now = await time.latest();
    const total = toWei(500);

    await expect(vesting.connect(user1).addGrant(user2.address, total, now, 0, 100)).to.be.reverted;
    await vesting.addGrant(user2.address, total, now, 0, 100);
    await expect(vesting.connect(user1).revokeGrant(user2.address, 0)).to.be.reverted;
  });

  it("should not release after revocation", async function () {
    const now = await time.latest();
    const total = toWei(500);

    await vesting.addGrant(user1.address, total, now, 0, 100);
    await vesting.revokeGrant(user1.address, 0);
    await expect(vesting.connect(user1).claim(0)).to.be.revertedWith("Grant revoked");
  });
});
