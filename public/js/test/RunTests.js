/**
 * Main test runner - executes all test suites
 */

import { createBaseVariantTests } from './VariantTestSuites.js';
import { createAtomicVariantTests } from './VariantTestSuites.js';
import { createKingOfTheHillVariantTests } from './VariantTestSuites.js';
import { createStandardVariantTests } from './VariantTestSuites.js';
import { integrationTests } from './IntegrationTests.js';

async function runAllTests() {
  console.log('🧪 Starting Atomic Chess Test Suite');
  console.log('====================================\n');
  
  const testSuites = [
    createBaseVariantTests(),
    createAtomicVariantTests(),
    createKingOfTheHillVariantTests(),
    createStandardVariantTests(),
    integrationTests
  ];
  
  let totalPassed = 0;
  let totalFailed = 0;
  const results = [];
  
  for (const suite of testSuites) {
    const success = await suite.run();
    results.push({
      name: suite.name,
      passed: suite.passed,
      failed: suite.failed,
      success
    });
    totalPassed += suite.passed;
    totalFailed += suite.failed;
  }
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('====================================');
  for (const result of results) {
    const status = result.success ? '✓' : '✗';
    const passed = result.passed || 0;
    const failed = result.failed || 0;
    console.log(`${status} ${result.name}: ${passed} passed, ${failed} failed`);
  }
  
  console.log('\n====================================');
  console.log(`📈 Total: ${totalPassed} passed, ${totalFailed} failed`);
  
  if (totalFailed === 0) {
    console.log('✅ All tests passed!');
  } else {
    console.log(`❌ ${totalFailed} test(s) failed`);
  }
  
  return totalFailed === 0;
}

// Run tests
runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
