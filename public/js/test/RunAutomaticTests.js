import { autoTestSystem } from './AutoTestSystem.js';

/**
 * Script d'exécution des tests automatiques
 * Peut être utilisé pour tester rapidement toutes les variantes
 */
async function runAutomaticTests() {
  console.log('🤖 Automatic Test Runner');
  console.log('========================\n');
  
  const success = await autoTestSystem.runAllTests();
  
  if (success) {
    console.log('\n✨ All automatic tests completed successfully!');
  } else {
    console.log('\n💥 Some automatic tests failed!');
  }
  
  return success;
}

// Exécute les tests automatiques
runAutomaticTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error in automatic tests:', error);
  process.exit(1);
});