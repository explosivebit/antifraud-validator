"use strict";

const {
  APPROVED,
  SUSPICIOUS,
  BLOCKED,
  checkHighAmount,
  checkMediumAmount,
  checkNightTransfer,
} = require("./rules");

// ─── Rule registry ───────────────────────────────────────────
/** @type {Array<function(import("./rules").Transaction): import("./rules").RuleResult|null>} */
const BLOCKED_RULES = [checkHighAmount];

/** @type {Array<function(import("./rules").Transaction): import("./rules").RuleResult|null>} */
const SUSPICIOUS_RULES = [checkMediumAmount, checkNightTransfer];

// ─── Validation engine ───────────────────────────────────────

/**
 * Validates a transaction against all registered rules.
 * Rules are evaluated in priority order: BLOCKED first, then SUSPICIOUS.
 * First matching rule wins. If no rule triggers, returns APPROVED.
 *
 * @param {import("./rules").Transaction} transaction
 * @returns {import("./rules").RuleResult & {id: string} | {verdict: "APPROVED", rule: null, id: string}}
 */
function validateTransaction(transaction) {
  for (const rule of BLOCKED_RULES) {
    const result = rule(transaction);
    if (result !== null) {
      return { id: transaction.id, ...result };
    }
  }

  for (const rule of SUSPICIOUS_RULES) {
    const result = rule(transaction);
    if (result !== null) {
      return { id: transaction.id, ...result };
    }
  }

  return { id: transaction.id, verdict: APPROVED, rule: null };
}

// ─── Exports (for tests) ────────────────────────────────────
module.exports = {
  APPROVED,
  SUSPICIOUS,
  BLOCKED,
  checkHighAmount,
  checkMediumAmount,
  checkNightTransfer,
  validateTransaction,
};

// ─── CLI: run with `node validator.js` ──────────────────────
if (require.main === module) {
  const fs = require("fs");
  const path = require("path");

  const filePath = path.join(__dirname, "transactions.json");
  const data = fs.readFileSync(filePath, "utf-8");
  const transactions = JSON.parse(data);

  console.log("Antifraud Validator — processing %d transactions\n", transactions.length);

  for (const tx of transactions) {
    const result = validateTransaction(tx);
    console.log(
      "  [%s] %s — %s (rule: %s)",
      result.verdict,
      result.id,
      tx.amount + " " + tx.currency,
      result.rule || "none"
    );
  }

  console.log("\nDone.");
}
