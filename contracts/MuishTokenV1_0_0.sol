// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/// @title Muish Token (MuishTokenV1_0_0)
/// @notice Upgradeable ERC20 token for the Muish Oddity game economy
contract MuishTokenV1_0_0 is
    Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 1e18;

    event Minted(address indexed to, uint256 amount);
    event RoleBurn(address indexed from, uint256 amount);

    function initialize(
        address admin,
        address multisig,
        address treasury,
        uint256 treasuryInitialMint
    ) public initializer {
        __ERC20_init("Muish Token", "MUISH");
        __ERC20Burnable_init();
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        require(treasuryInitialMint <= MAX_SUPPLY, "Exceeds max supply");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, multisig);
        _grantRole(BURNER_ROLE, multisig);
        _grantRole(PAUSER_ROLE, multisig);
        _grantRole(UPGRADER_ROLE, multisig);

        _mint(treasury, treasuryInitialMint);
        emit Minted(treasury, treasuryInitialMint);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
        emit Minted(to, amount);
    }

    function roleBurn(address account, uint256 amount) external onlyRole(BURNER_ROLE) {
        _burn(account, amount);
        emit RoleBurn(account, amount);
    }

    function _update(
        address from,
        address to,
        uint256 value
    )
        internal
        override
        whenNotPaused
    {
        super._update(from, to, value);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(UPGRADER_ROLE)
    {}

    uint256[50] private __gap;
}
