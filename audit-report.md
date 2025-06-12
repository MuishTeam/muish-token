# 🔍 Audit Finding

## 🔴 [H-1] – Arbitrary `transferFrom` Enables Abuse via Role Authority

## 📌 Summary

The `penalizePlayer` function allows any address with `GAME_ROLE` to arbitrarily transfer tokens from any user who has approved the contract. This creates a critical abuse vector where token holders can be unexpectedly drained under the guise of penalties.

This is especially dangerous in contexts where users give broad approvals for other gameplay features (e.g. staking, purchases), not expecting punitive withdrawals.

---

### **Impact & Exploit Scenario**

- A malicious or misconfigured `GAME_ROLE` address can exploit `transferFrom` to drain tokens from any user with an approval in place.
- Users may lose funds despite never consenting to punitive use of their `approve()`.
- The exploit does not require any player action and is undetectable by normal gameplay behavior.

### **Vulnerable Code**

```solidity
function penalizePlayer(address player, uint256 amount) external onlyRole(GAME_ROLE) {
    muishToken.transferFrom(player, address(this), amount);
}
```

## Explored Mitigation

## ⚖️ Pros & Cons of Explored Mitigations

### 🔹 1. Opt-In via `enablePenalties()`

**Pros**

- Clear user consent
- Prevents surprise penalties

**Cons**

- Requires extra user interaction
- Breaks existing flows relying on `approve()`

---

### 🔹 2. Dedicated Penalty Allowance

**Pros**

- Separation of concerns from standard ERC20 approvals
- Clear scope of penalty authority

**Cons**

- Adds complexity to state and UX
- Still requires a setup step from users

---

### 🔹 3. Cap Penalty Per Call (e.g. 10%)

**Pros**

- No added state or setup
- Prevents full balance drains

**Cons**

- Can be bypassed via multiple calls
- May unintentionally limit legitimate penalty size

---

### 🔹 4. Infraction System with Severity + Cooldown

**Pros**

- Structured, auditable penalty process
- Prevents spamming and abuse
- Allows escalation logic

**Cons**

- More complex implementation
- Requires two-step logic (flag + execute)

## [Info-1] – Use SafeERC20.safeTransferfrom on penalizePlayer

Can be good but not obligatory , boost security.
