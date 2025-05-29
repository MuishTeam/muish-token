const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("MuishToken", function () {
  let MuishToken, token;
  let admin, multisig, treasury, user1;
  const initialMint = ethers.parseEther("100000000"); // 100M MUISH

  beforeEach(async function () {
    [admin, multisig, treasury, user1] = await ethers.getSigners();

    MuishToken = await ethers.getContractFactory("MuishTokenV1_0_0");
    token = await upgrades.deployProxy(
      MuishToken,
      [admin.address, multisig.address, treasury.address, initialMint],
      { initializer: "initialize" }
    );
    await token.waitForDeployment();
  });

  it("should deploy and mint initial supply to the treasury", async function () {
    const balance = await token.balanceOf(treasury.address);
    expect(balance).to.equal(initialMint);
  });

  it("should allow multisig to mint up to max supply", async function () {
    await token.connect(multisig).mint(user1.address, 1);
    expect(await token.balanceOf(user1.address)).to.equal(1);
  });

  it("should not allow minting beyond max supply", async function () {
    const max = await token.MAX_SUPPLY();
    await expect(
      token.connect(multisig).mint(user1.address, max)
    ).to.be.revertedWith("Exceeds max supply");
  });

  it("should allow multisig to pause and unpause", async function () {
    await token.connect(multisig).pause();
    await expect(
      token.connect(treasury).transfer(user1.address, 1)
    ).to.be.reverted;

    await token.connect(multisig).unpause();
    await token.connect(treasury).transfer(user1.address, 1);
    expect(await token.balanceOf(user1.address)).to.equal(1);
  });

  it("should allow multisig to burn from any account via roleBurn", async function () {
    await token.connect(multisig).mint(user1.address, 100);
    await token.connect(multisig).roleBurn(user1.address, 100);
    expect(await token.balanceOf(user1.address)).to.equal(0);
  });

  it("should reject unauthorized minting", async function () {
    await expect(token.connect(user1).mint(user1.address, 100)).to.be.reverted;
  });

  it("should reject unauthorized pause", async function () {
    await expect(token.connect(user1).pause()).to.be.reverted;
  });

  it("should not exceed max total supply", async function () {
    const max = await token.MAX_SUPPLY();
    const current = await token.totalSupply();
    const over = max - current + 1n;
    await expect(
      token.connect(multisig).mint(user1.address, over)
    ).to.be.revertedWith("Exceeds max supply");
  });
});
