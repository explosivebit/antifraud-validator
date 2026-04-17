"use strict";

// ─── Verdicts ────────────────────────────────────────────────
/** @type {"APPROVED"} */
const APPROVED = "APPROVED";
/** @type {"SUSPICIOUS"} */
const SUSPICIOUS = "SUSPICIOUS";
/** @type {"BLOCKED"} */
const BLOCKED = "BLOCKED";

// ─── Transaction typedef (for JSDoc) ─────────────────────────
/**
 * @typedef {Object} Transaction
 * @property {string} id          - Unique transaction identifier
 * @property {number} amount      - Transaction amount in minor currency unit
 * @property {string} currency    - ISO 4217 currency code
 * @property {string} timestamp   - ISO 8601 datetime string
 * @property {string} sender      - Sender identifier
 * @property {string} receiver    - Receiver identifier
 * @property {string} country     - ISO 3166-1 alpha-2 country code
 */

/**
 * @typedef {Object} RuleResult
 * @property {"BLOCKED"|"SUSPICIOUS"} verdict - The verdict for this transaction
 * @property {string} rule                     - Name of the rule that triggered
 */

// ─── Rules ───────────────────────────────────────────────────

/**
 * Blocks transactions with amount exceeding 1,000,000.
 * Rationale: very large transfers require manual verification.
 *
 * @param {Transaction} transaction
 * @returns {RuleResult|null}
 */
function checkHighAmount(transaction) {
  if (transaction.amount > 1_000_000) {
    return { verdict: BLOCKED, rule: "checkHighAmount" };
  }
  return null;
}

/**
 * Flags transactions with amount exceeding 100,000 as suspicious.
 * Rationale: medium-large transfers deserve a second look.
 *
 * @param {Transaction} transaction
 * @returns {RuleResult|null}
 */
function checkMediumAmount(transaction) {
  if (transaction.amount > 100_000) {
    return { verdict: SUSPICIOUS, rule: "checkMediumAmount" };
  }
  return null;
}

/**
 * Flags night-time transfers above 50,000 as suspicious.
 * Night window: UTC hour in [0, 6). Amount threshold: > 50,000.
 * Rationale: large transfers outside business hours are unusual.
 *
 * STUB: implementation is intentionally empty.
 * Students complete it during the live lesson — see docs/session-plan.md.
 *
 * @param {Transaction} transaction
 * @returns {RuleResult|null}
 */
function checkNightTransfer(transaction) {
  // TODO(lesson): parse hour from transaction.timestamp (UTC),
  //               return SUSPICIOUS if hour is in [0, 6) AND amount > 50_000.
  void transaction;
  return null;
}

// ─── Rule registry ───────────────────────────────────────────
/** @type {Array<function(Transaction): RuleResult|null>} */
const BLOCKED_RULES = [checkHighAmount];

/** @type {Array<function(Transaction): RuleResult|null>} */
const SUSPICIOUS_RULES = [checkMediumAmount, checkNightTransfer];

// ─── Validation engine ───────────────────────────────────────

/**
 * Validates a transaction against all registered rules.
 * Rules are evaluated in priority order: BLOCKED first, then SUSPICIOUS.
 * First matching rule wins. If no rule triggers, returns APPROVED.
 *
 * @param {Transaction} transaction
 * @returns {RuleResult & {id: string} | {verdict: "APPROVED", rule: null, id: string}}
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
