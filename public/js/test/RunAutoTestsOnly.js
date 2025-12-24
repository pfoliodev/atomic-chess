import { autoTestSystem } from './AutoTestSystem.js';

/**
 * Test runner pour le système de test automatique uniquement
 */
async function runAutoTests() {
  console.log('🤖 Automatic Test System');
  console.log('========================\n');
  
  const success = await autoTestSystem.runAllTests();
  
  return success;
}

runAutoTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error in automatic tests:', error);
  process.exit(1);
});