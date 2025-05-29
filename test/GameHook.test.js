const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("MuishTokenV1_0_0", function () {
  let MuishToken, GameHook, token, gameHook;
  let admin, gameAdmin, player;
  const initialMint = ethers.parseEther("100000000");

  beforeEach(async function () {
    [admin, gameAdmin, player] = await ethers.getSigners();

    // Deploy MuishTokenV1_0_0
    MuishToken = await ethers.getContractFactory("MuishTokenV1_0_0");
    token = await upgrades.deployProxy(
      MuishToken,
      [admin.address, admin.address, admin.address, initialMint],
      { initializer: "initialize" }
    );
    await token.waitForDeployment();

    // Grant minting rights to admin and GameHook
    await token.connect(admin).grantRole(await token.MINTER_ROLE(), admin.address);

    // Deploy GameHook
    GameHook = await ethers.getContractFactory("GameHook");
    gameHook = await upgrades.deployProxy(
      GameHook,
      [await token.getAddress(), gameAdmin.address],
      { initializer: "initialize" }
    );
    await gameHook.waitForDeployment();

    // Grant minting rights to GameHook contract
    await token.connect(admin).grantRole(await token.MINTER_ROLE(), await gameHook.getAddress());
  });

  it("should reward player", async function () {
    await gameHook.connect(gameAdmin).rewardPlayer(player.address, 100);
    expect(await token.balanceOf(player.address)).to.equal(100);
  });
});
