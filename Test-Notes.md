# ✅ Current Test Coverage Summary (MuishTokenTest)

✅ Test Cases Currently Covered

## 🔐 Access Control

✅ admin is authorized to call mint(), pause(), unpause(), and roleBurn()

✅ Unauthorized access to sensitive functions (mint(), pause(), addGrant()) is correctly rejected

✅ Only admin can call vesting controller functions (addGrant, revokeGrant)

## 🔄 Token Functions

✅ admin can mint tokens up to the maxSupply

✅ Reverts when minting exactly or above maxSupply + 1

✅ Initial token distribution validated (INITIAL_MINT minus FIRST_MINT)

✅ pause() blocks transfers, unpause() restores them

## 🔥 Burn

✅ roleBurn() works and burns tokens from arbitrary accounts by admin

## 📈 Max Supply

✅ maxSupply() returns correct value

✅ Enforced limit with revert on over-minting

## 🧾 Vesting

✅ Adding a grant with cliff and duration works

✅ Vesting releases partial tokens mid-duration

✅ Full vesting claim after cliff + duration releases full amount

✅ Cannot claim before cliff

✅ Cannot claim after all tokens are claimed

✅ Cannot claim after grant has been revoked

✅ Multiple grants can be added per user

✅ Grant data integrity is verified via getGrants()

# 🔍 Uncovered / Missing Test Scenarios

## 🔐 Access Control

⛔ Explicit tests for roles (e.g., MINTER_ROLE, PAUSER_ROLE, DEFAULT_ADMIN_ROLE) are missing

⛔ No fuzzing on access roles or proxy-related escalations

## 🔄 Mint/Burn

⛔ No test for partial burn (e.g., burn 30 out of 100 tokens)

⛔ No unauthorized burn test

⛔ No fuzzing on mint() amounts close to maxSupply

## 🔁 Transfers

⛔ No transfer from user1 to user2

⛔ No test for transfers to address(0)

⛔ No transfer attempt while paused from non-admin account

## ⏳ Vesting Edge Cases

⛔ Claim at block.timestamp == cliff not tested

⛔ cliff == duration behavior not tested

⛔ Revoke after partial claim

⛔ Vesting with duration == 0 (edge case)

⛔ Fuzz tests on amount, cliff, duration

⛔ Verify getGrants() reflects updated claimed amount

## 🛠️ Proxy / Upgradeability

⛔ Proxy upgrade not tested (e.g., access to upgradeTo)

⛔ No re-initialization protection tested

⛔ Storage alignment not tested (manual or echidna / slither can help here)
