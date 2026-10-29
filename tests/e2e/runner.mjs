#!/usr/bin/env node
/**
 * KoiStory E2E Test Suite Runner
 * Adheres strictly to the 4-tier methodology defined in TEST_INFRA.md:
 * - Tier 1: Feature Coverage (>=5 test cases per feature for F1 through F17)
 * - Tier 2: Boundary & Corner Cases (>=5 test cases per feature for F1 through F17)
 * - Tier 3: Cross-Feature Combinations (Pairwise coverage)
 * - Tier 4: Real-World Application Scenarios (5 multi-feature journeys)
 */

import { performance } from "node:perf_hooks";

export class TestHarness {
  constructor(name = "Test Suite") {
    this.name = name;
    this.tests = [];
    this.results = [];
    this.startTime = 0;
  }

  test(description, fn, metadata = {}) {
    this.tests.push({ description, fn, metadata });
  }

  async run() {
    this.startTime = performance.now();
    console.log(`\n===============================================================`);
    console.log(` Running ${this.name} (${this.tests.length} tests)`);
    console.log(`===============================================================`);

    let passed = 0;
    let failed = 0;

    for (let i = 0; i < this.tests.length; i++) {
      const { description, fn, metadata } = this.tests[i];
      const testStart = performance.now();
      const testId = `[${String(i + 1).padStart(3, "0")}]`;
      const featureTag = metadata.feature ? ` [${metadata.feature}]` : "";

      try {
        await fn();
        const duration = (performance.now() - testStart).toFixed(2);
        console.log(`  ✓ ${testId}${featureTag} ${description} (${duration}ms)`);
        this.results.push({ description, status: "PASS", duration, metadata });
        passed++;
      } catch (err) {
        const duration = (performance.now() - testStart).toFixed(2);
        console.error(`  ✗ ${testId}${featureTag} ${description} (${duration}ms)`);
        console.error(`    Error: ${err.message}`);
        if (err.stack) {
          const firstStackLine = err.stack.split("\n")[1] || "";
          console.error(`    ${firstStackLine.trim()}`);
        }
        this.results.push({ description, status: "FAIL", error: err.message, duration, metadata });
        failed++;
      }
    }

    const totalDuration = ((performance.now() - this.startTime) / 1000).toFixed(2);
    console.log(`\n--- ${this.name} Summary ---`);
    console.log(`Total: ${this.tests.length} | Passed: ${passed} | Failed: ${failed} | Time: ${totalDuration}s\n`);

    return { total: this.tests.length, passed, failed, duration: totalDuration, results: this.results };
  }
}

// Global assertion helper compatible with standard test assertions
export const assert = {
  ok(val, msg = "Expected truthy value") {
    if (!val) throw new Error(msg);
  },
  equal(actual, expected, msg) {
    if (actual !== expected) {
      throw new Error(msg || `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    }
  },
  notEqual(actual, unexpected, msg) {
    if (actual === unexpected) {
      throw new Error(msg || `Expected values not to equal ${JSON.stringify(actual)}`);
    }
  },
  deepEqual(actual, expected, msg) {
    const actStr = JSON.stringify(actual);
    const expStr = JSON.stringify(expected);
    if (actStr !== expStr) {
      throw new Error(msg || `Expected ${expStr} but got ${actStr}`);
    }
  },
  greaterThan(actual, expected, msg) {
    if (!(actual > expected)) {
      throw new Error(msg || `Expected ${actual} > ${expected}`);
    }
  },
  greaterThanOrEqual(actual, expected, msg) {
    if (!(actual >= expected)) {
      throw new Error(msg || `Expected ${actual} >= ${expected}`);
    }
  },
  lessThan(actual, expected, msg) {
    if (!(actual < expected)) {
      throw new Error(msg || `Expected ${actual} < ${expected}`);
    }
  },
  lessThanOrEqual(actual, expected, msg) {
    if (!(actual <= expected)) {
      throw new Error(msg || `Expected ${actual} <= ${expected}`);
    }
  },
  closeTo(actual, expected, delta = 0.001, msg) {
    if (Math.abs(actual - expected) > delta) {
      throw new Error(msg || `Expected ${actual} to be close to ${expected} (within ${delta}), diff: ${Math.abs(actual - expected)}`);
    }
  },
  match(actual, regex, msg) {
    if (!regex.test(actual)) {
      throw new Error(msg || `Expected "${actual}" to match regex ${regex}`);
    }
  },
  doesNotMatch(actual, regex, msg) {
    if (regex.test(actual)) {
      throw new Error(msg || `Expected "${actual}" NOT to match regex ${regex}`);
    }
  },
  throws(fn, expectedErrorRegex, msg) {
    let threw = false;
    try {
      fn();
    } catch (e) {
      threw = true;
      if (expectedErrorRegex && !expectedErrorRegex.test(e.message)) {
        throw new Error(msg || `Function threw "${e.message}", which did not match ${expectedErrorRegex}`);
      }
    }
    if (!threw) {
      throw new Error(msg || "Expected function to throw an error, but it did not");
    }
  }
};

// Main execution entry point
async function runAllSuites() {
  const overallStart = performance.now();
  console.log(`===================================================================`);
  console.log(` KOISTORY OPAQUE-BOX E2E TEST RUNNER`);
  console.log(` Adheres strictly to 4-Tier Test Infra Architecture`);
  console.log(`===================================================================`);

  const summary = {
    tier1: null,
    tier2: null,
    tier3: null,
    tier4: null,
    totalTests: 0,
    totalPassed: 0,
    totalFailed: 0,
  };

  try {
    // Dynamically import test suites
    const { registerTier1Tests } = await import("./tier1_features.test.mjs");
    const { registerTier2Tests } = await import("./tier2_boundaries.test.mjs");
    const { registerTier3Tests } = await import("./tier3_combinations.test.mjs");
    const { registerTier4Tests } = await import("./tier4_realworld.test.mjs");

    // Tier 1: Feature Coverage (F1 through F17)
    const tier1Harness = new TestHarness("Tier 1: Feature Coverage (F1 to F17)");
    registerTier1Tests(tier1Harness);
    summary.tier1 = await tier1Harness.run();

    // Tier 2: Boundary & Corner Cases (F1 through F17)
    const tier2Harness = new TestHarness("Tier 2: Boundary & Corner Cases (F1 to F17)");
    registerTier2Tests(tier2Harness);
    summary.tier2 = await tier2Harness.run();

    // Tier 3: Cross-Feature Combinations (Pairwise coverage)
    const tier3Harness = new TestHarness("Tier 3: Cross-Feature Combinations");
    registerTier3Tests(tier3Harness);
    summary.tier3 = await tier3Harness.run();

    // Tier 4: Real-World Application Scenarios (5 Workflows)
    const tier4Harness = new TestHarness("Tier 4: Real-World Application Scenarios");
    registerTier4Tests(tier4Harness);
    summary.tier4 = await tier4Harness.run();

    summary.totalTests = summary.tier1.total + summary.tier2.total + summary.tier3.total + summary.tier4.total;
    summary.totalPassed = summary.tier1.passed + summary.tier2.passed + summary.tier3.passed + summary.tier4.passed;
    summary.totalFailed = summary.tier1.failed + summary.tier2.failed + summary.tier3.failed + summary.tier4.failed;

    const totalTimeSec = ((performance.now() - overallStart) / 1000).toFixed(2);

    console.log(`\n===================================================================`);
    console.log(` FINAL TEST EXECUTION REPORT`);
    console.log(`===================================================================`);
    console.log(` Tier 1 (Feature Coverage):     ${summary.tier1.passed}/${summary.tier1.total} passed`);
    console.log(` Tier 2 (Boundary & Corner):    ${summary.tier2.passed}/${summary.tier2.total} passed`);
    console.log(` Tier 3 (Cross-Combinations):   ${summary.tier3.passed}/${summary.tier3.total} passed`);
    console.log(` Tier 4 (Real-World Scenarios): ${summary.tier4.passed}/${summary.tier4.total} passed`);
    console.log(`-------------------------------------------------------------------`);
    console.log(` GRAND TOTAL:                   ${summary.totalPassed}/${summary.totalTests} passed (${summary.totalFailed} failed) in ${totalTimeSec}s`);
    console.log(`===================================================================\n`);

    if (summary.totalFailed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("Fatal test harness error:", err);
    process.exit(1);
  }
}

// Execute if run directly from CLI
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("runner.mjs")) {
  runAllSuites();
}
