# 🧠 Muish Token (MUISH) – v1.0.0

**MuishToken** is the upgradeable ERC-20 token powering the in-game economy of **Muish Oddity: Mutant Monkfish**.

This repo includes full smart contract source, test suite, and deployment scripts for the MUISH token system.

---

## 🪙 Token Features

- ✅ ERC20 compliant: `name: "Muish Token"`, `symbol: "MUISH"`, `decimals: 18`
- 🔒 Max supply cap: **12,000,000,000 MUISH**
- 🔁 UUPS Upgradeable (via OpenZeppelin v5)
- 🔐 Access-controlled minting, burning, pausing
- 🔥 `roleBurn` allows multisig to burn from any address
- 📦 Pausable, burnable, upgrade-safe

---

## 📜 Contracts

| Contract | Role |
|---------|------|
| `MuishTokenV1_0_0.sol` | Core upgradeable ERC-20 token |
| `TokenVesting.sol` | Cliff + linear multi-grant vesting |
| `TimelockControllerWrapper.sol` | Owns and governs roles via timelock |
| `GameHook.sol` | Simulated on-chain game interaction |

---

## 📂 Project Structure

```bash
contracts/
scripts/
test/
.gitignore
hardhat.config.js
package.json
README.md
# Test Trigger
