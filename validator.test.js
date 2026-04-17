"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const {
  APPROVED,
  SUSPICIOUS,
  BLOCKED,
  checkHighAmount,
  checkMediumAmount,
} = require("./rules");
const { validateTransaction } = require("./validator");

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

function testEngineApprovesNegativeAmount() {
  const result = validateTransaction(makeTx({ amount: -1_000_000 }));
  assert.equal(result.verdict, APPROVED);
  assert.equal(result.rule, null);
}

// ─── Tests: data-driven (reads transactions.json) ───────────

function testSampleDataVerdictsMatchExpectations() {
  const dataPath = path.join(__dirname, "transactions.json");
  const transactions = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  const expected = {
    "tx-001": APPROVED,
    "tx-002": SUSPICIOUS,
    "tx-003": BLOCKED,
    "tx-005": SUSPICIOUS,
  };
  for (const tx of transactions) {
    if (!(tx.id in expected)) continue;
    const result = validateTransaction(tx);
    assert.equal(
      result.verdict,
      expected[tx.id],
      `${tx.id} should be ${expected[tx.id]}, got ${result.verdict}`
    );
  }
}

// ─── Tests: integration (runs validator.js as a child process) ─

function runValidatorCli() {
  const validatorPath = path.join(__dirname, "validator.js");
  return spawnSync(process.execPath, [validatorPath], { encoding: "utf-8" });
}

function testCliExitsWithZeroOnSampleRun() {
  const result = runValidatorCli();
  assert.equal(result.status, 0, "validator.js should exit with code 0");
  assert.equal(result.signal, null, "should not be terminated by a signal");
}

function testCliOutputsAllTransactionIds() {
  const result = runValidatorCli();
  const ids = ["tx-001", "tx-002", "tx-003", "tx-004", "tx-005"];
  for (const id of ids) {
    assert.ok(
      result.stdout.includes(id),
      `CLI stdout should contain ${id}, got:\n${result.stdout}`
    );
  }
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
  ["engine approves negative amount", testEngineApprovesNegativeAmount],

  // data-driven
  ["sample data: verdicts match expectations", testSampleDataVerdictsMatchExpectations],

  // integration (CLI)
  ["CLI exits with code 0 on sample run", testCliExitsWithZeroOnSampleRun],
  ["CLI stdout contains every transaction id", testCliOutputsAllTransactionIds],
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
