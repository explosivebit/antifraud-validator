"use strict";

const assert = require("node:assert/strict");
const {
  APPROVED,
  SUSPICIOUS,
  BLOCKED,
  checkHighAmount,
  checkMediumAmount,
  validateTransaction,
} = require("./validator");

// ─── Helper ──────────────────────────────────────────────────

/**
 * Creates a base transaction with sensible defaults.
 * Override any field by passing it in the `overrides` object.
 *
 * @param {Object} overrides
 * @returns {import("./validator").Transaction}
 */
function makeTx(overrides) {
  return {
    id: "tx-test",
    amount: 1000,
    currency: "RUB",
    timestamp: "2026-04-15T12:00:00Z",
    sender: "user-1",
    receiver: "user-2",
    country: "RU",
    ...overrides,
  };
}

// ─── Tests: checkHighAmount ──────────────────────────────────

function testHighAmountBlocks() {
  const result = checkHighAmount(makeTx({ amount: 2_000_000 }));
  assert.notEqual(result, null, "should trigger on 2M");
  assert.equal(result.verdict, BLOCKED);
  assert.equal(result.rule, "checkHighAmount");
}

function testHighAmountPassesNormalAmount() {
  const result = checkHighAmount(makeTx({ amount: 500_000 }));
  assert.equal(result, null, "should not trigger on 500k");
}

function testHighAmountBoundary() {
  const result = checkHighAmount(makeTx({ amount: 1_000_000 }));
  assert.equal(result, null, "should not trigger on exactly 1M (boundary)");
}

function testHighAmountTriggersAtBoundaryPlusOne() {
  const result = checkHighAmount(makeTx({ amount: 1_000_001 }));
  assert.notEqual(result, null, "should trigger on 1M+1");
  assert.equal(result.verdict, BLOCKED);
}

function testHighAmountPassesAtBoundaryMinusOne() {
  const result = checkHighAmount(makeTx({ amount: 999_999 }));
  assert.equal(result, null, "should not trigger on 999,999");
}

// ─── Tests: checkMediumAmount ────────────────────────────────

function testMediumAmountFlagsSuspicious() {
  const result = checkMediumAmount(makeTx({ amount: 250_000 }));
  assert.notEqual(result, null, "should trigger on 250k");
  assert.equal(result.verdict, SUSPICIOUS);
  assert.equal(result.rule, "checkMediumAmount");
}

function testMediumAmountPassesSmallAmount() {
  const result = checkMediumAmount(makeTx({ amount: 50_000 }));
  assert.equal(result, null, "should not trigger on 50k");
}

function testMediumAmountBoundary() {
  const result = checkMediumAmount(makeTx({ amount: 100_000 }));
  assert.equal(result, null, "should not trigger on exactly 100k (boundary)");
}

function testMediumAmountTriggersAtBoundaryPlusOne() {
  const result = checkMediumAmount(makeTx({ amount: 100_001 }));
  assert.notEqual(result, null, "should trigger on 100k+1");
  assert.equal(result.verdict, SUSPICIOUS);
}

function testMediumAmountPassesAtBoundaryMinusOne() {
  const result = checkMediumAmount(makeTx({ amount: 99_999 }));
  assert.equal(result, null, "should not trigger on 99,999");
}

// ─── Tests: validateTransaction (engine) ─────────────────────

function testEngineApprovesCleanTransaction() {
  const result = validateTransaction(makeTx({ amount: 5_000 }));
  assert.equal(result.verdict, APPROVED);
  assert.equal(result.rule, null);
}

function testEngineBlockedTakesPriorityOverSuspicious() {
  const result = validateTransaction(makeTx({ amount: 2_000_000 }));
  assert.equal(result.verdict, BLOCKED, "2M should be BLOCKED, not SUSPICIOUS");
}

function testEngineReturnsSuspiciousForMediumAmount() {
  const result = validateTransaction(makeTx({ amount: 250_000 }));
  assert.equal(result.verdict, SUSPICIOUS);
}

function testEngineIncludesTransactionId() {
  const result = validateTransaction(makeTx({ id: "tx-check-id" }));
  assert.equal(result.id, "tx-check-id");
}

function testEngineApprovesZeroAmount() {
  const result = validateTransaction(makeTx({ amount: 0 }));
  assert.equal(result.verdict, APPROVED);
  assert.equal(result.rule, null);
}

function testEngineApprovesMinimalAmount() {
  const result = validateTransaction(makeTx({ amount: 1 }));
  assert.equal(result.verdict, APPROVED);
  assert.equal(result.rule, null);
}

function testEngineBlocksAtExactBoundaryPlusOne() {
  const result = validateTransaction(makeTx({ amount: 1_000_001 }));
  assert.equal(result.verdict, BLOCKED, "1M+1 through engine should be BLOCKED, not SUSPICIOUS");
  assert.equal(result.rule, "checkHighAmount");
}

function testEngineSuspiciousResultIncludesRuleName() {
  const result = validateTransaction(makeTx({ amount: 250_000 }));
  assert.equal(result.rule, "checkMediumAmount");
}

// ─── Runner ──────────────────────────────────────────────────

const tests = [
  // checkHighAmount
  ["checkHighAmount blocks amount > 1M", testHighAmountBlocks],
  ["checkHighAmount passes normal amount", testHighAmountPassesNormalAmount],
  ["checkHighAmount boundary: exactly 1M passes", testHighAmountBoundary],
  ["checkHighAmount N+1: 1,000,001 triggers", testHighAmountTriggersAtBoundaryPlusOne],
  ["checkHighAmount N-1: 999,999 passes", testHighAmountPassesAtBoundaryMinusOne],

  // checkMediumAmount
  ["checkMediumAmount flags amount > 100k as suspicious", testMediumAmountFlagsSuspicious],
  ["checkMediumAmount passes small amount", testMediumAmountPassesSmallAmount],
  ["checkMediumAmount boundary: exactly 100k passes", testMediumAmountBoundary],
  ["checkMediumAmount N+1: 100,001 triggers", testMediumAmountTriggersAtBoundaryPlusOne],
  ["checkMediumAmount N-1: 99,999 passes", testMediumAmountPassesAtBoundaryMinusOne],

  // engine
  ["engine approves clean transaction", testEngineApprovesCleanTransaction],
  ["engine: BLOCKED takes priority over SUSPICIOUS", testEngineBlockedTakesPriorityOverSuspicious],
  ["engine returns SUSPICIOUS for medium amount", testEngineReturnsSuspiciousForMediumAmount],
  ["engine result includes transaction id", testEngineIncludesTransactionId],
  ["engine approves zero amount", testEngineApprovesZeroAmount],
  ["engine approves minimal amount (1)", testEngineApprovesMinimalAmount],
  ["engine blocks at exact boundary+1 (priority check)", testEngineBlocksAtExactBoundaryPlusOne],
  ["engine suspicious result includes rule name", testEngineSuspiciousResultIncludesRuleName],
];

let passed = 0;
let failed = 0;

for (const [name, fn] of tests) {
  try {
    fn();
    console.log("  PASS: %s", name);
    passed++;
  } catch (err) {
    console.error("  FAIL: %s", name);
    console.error("        %s", err.message);
    failed++;
  }
}

console.log("\nResults: %d passed, %d failed, %d total", passed, failed, tests.length);

if (failed > 0) {
  process.exit(1);
}
