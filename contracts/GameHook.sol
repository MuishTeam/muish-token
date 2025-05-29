// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./MuishTokenV1_0_0.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract GameHook is Initializable, AccessControlUpgradeable {
    MuishTokenV1_0_0 public muishToken;

    bytes32 public constant GAME_ROLE = keccak256("GAME_ROLE");

    function initialize(address tokenAddress, address gameAdmin) public initializer {
        __AccessControl_init();
        muishToken = MuishTokenV1_0_0(tokenAddress);

        _grantRole(DEFAULT_ADMIN_ROLE, gameAdmin);
        _grantRole(GAME_ROLE, gameAdmin);
    }

    function rewardPlayer(address player, uint256 amount) external onlyRole(GAME_ROLE) {
        muishToken.mint(player, amount);
    }

    function penalizePlayer(address player, uint256 amount) external onlyRole(GAME_ROLE) {
        muishToken.transferFrom(player, address(this), amount);
    }

    function burnPlayerTokens(uint256 amount) external onlyRole(GAME_ROLE) {
        muishToken.burn(amount);
    }
}
