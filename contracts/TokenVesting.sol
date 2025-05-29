// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Token Vesting Contract for Muish
/// @notice Handles cliff + linear vesting schedules for team, partners, and advisors
contract TokenVesting is
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable
{
    bytes32 public constant VESTER_ROLE = keccak256("VESTER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    IERC20 public token;

    struct Grant {
        uint256 start;
        uint256 cliff;
        uint256 duration;
        uint256 total;
        uint256 claimed;
        bool revoked;
    }

    mapping(address => Grant[]) public grants;

    event GrantCreated(address indexed beneficiary, uint256 indexed index, uint256 total, uint256 start, uint256 cliff, uint256 duration);
    event GrantRevoked(address indexed beneficiary, uint256 indexed index);
    event TokensClaimed(address indexed beneficiary, uint256 indexed index, uint256 amount);

    function initialize(address tokenAddress, address admin) public initializer {
        __AccessControl_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        token = IERC20(tokenAddress);

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(VESTER_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    function addGrant(
        address beneficiary,
        uint256 total,
        uint256 start,
        uint256 cliffDuration,
        uint256 duration
    ) external onlyRole(VESTER_ROLE) whenNotPaused {
        require(duration >= cliffDuration, "Duration must be >= cliff");

        grants[beneficiary].push(
            Grant({
                start: start,
                cliff: start + cliffDuration,
                duration: duration,
                total: total,
                claimed: 0,
                revoked: false
            })
        );

        emit GrantCreated(beneficiary, grants[beneficiary].length - 1, total, start, start + cliffDuration, duration);
    }

    function revokeGrant(address beneficiary, uint256 index) external onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        Grant storage grant = grants[beneficiary][index];
        require(!grant.revoked, "Already revoked");

        grant.revoked = true;
        emit GrantRevoked(beneficiary, index);
    }

    function claim(uint256 index) external nonReentrant whenNotPaused {
        Grant storage grant = grants[msg.sender][index];
        require(!grant.revoked, "Grant revoked");
        require(block.timestamp >= grant.cliff, "Cliff not reached");

        uint256 vested = _vestedAmount(grant);
        uint256 releasable = vested - grant.claimed;
        require(releasable > 0, "Nothing to claim");

        grant.claimed += releasable;
        require(token.transfer(msg.sender, releasable), "Transfer failed");

        emit TokensClaimed(msg.sender, index, releasable);
    }

    function _vestedAmount(Grant memory grant) internal view returns (uint256) {
        if (block.timestamp < grant.cliff) return 0;
        if (block.timestamp >= grant.start + grant.duration || grant.revoked) {
            return grant.total;
        }

        uint256 elapsed = block.timestamp - grant.start;
        return (grant.total * elapsed) / grant.duration;
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _authorizeUpgrade(address) internal override onlyRole(UPGRADER_ROLE) {}

    function getGrants(address beneficiary) external view returns (Grant[] memory) {
        return grants[beneficiary];
    }
}
