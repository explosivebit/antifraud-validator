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

module.exports = {
  APPROVED,
  SUSPICIOUS,
  BLOCKED,
  checkHighAmount,
  checkMediumAmount,
  checkNightTransfer,
};
