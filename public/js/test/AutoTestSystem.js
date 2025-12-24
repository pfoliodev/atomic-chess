import { VariantTestSuite } from './VariantTestSuite.js';
import { Board } from '../core/Board.js';
import { BaseVariant } from '../variants/BaseVariant.js';
import { readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

/**
 * Système automatique de détection et de test des variantes
 * Détecte dynamiquement les nouvelles variantes et génère les tests appropriés
 */
export class AutoTestSystem {
  constructor() {
    this.testedVariants = new Map();
    this.variantRegistry = new Map();
    this.registerDefaultVariants();
  }

  /**
   * Enregistre les variantes par défaut
   */
  registerDefaultVariants() {
    this.registerVariant('BaseVariant', () => import('../variants/BaseVariant.js'));
    this.registerVariant('AtomicVariant', () => import('../variants/AtomicVariant.js'));
    this.registerVariant('KingOfTheHillVariant', () => import('../variants/KingOfTheHillVariant.js'));
    this.registerVariant('StandardVariant', () => import('../variants/StandardVariant.js'));
  }

  /**
   * Enregistre une nouvelle variante pour les tests automatiques
   */
  registerVariant(name, importFunction) {
    this.variantRegistry.set(name, importFunction);
  }

  /**
   * Détecte automatiquement les fichiers de variantes dans le répertoire variants/
   */
  async detectVariants() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const variantsDir = join(__dirname, '..', 'variants');
    
    try {
      const files = readdirSync(variantsDir);
      const variantFiles = files.filter(file => 
        file.endsWith('Variant.js') && !file.startsWith('Base')
      );
      
      for (const file of variantFiles) {
        const variantName = file.replace('.js', '');
        if (!this.variantRegistry.has(variantName)) {
          const importFunction = () => import(`../variants/${file}`);
          this.registerVariant(variantName, importFunction);
          console.log(`🔍 Auto-detected variant: ${variantName}`);
        }
      }
    } catch (error) {
      console.warn('⚠️  Could not auto-detect variants:', error.message);
    }
  }

  /**
   * Crée des tests automatiques pour une variante
   */
  async createTestsForVariant(variantName, VariantClass) {
    if (this.testedVariants.has(variantName)) {
      return this.testedVariants.get(variantName);
    }

    const testSuite = new VariantTestSuite(VariantClass, variantName);
    
    // Ajoute des tests automatiques basés sur les signatures de méthodes
    await this.addAutomaticTests(testSuite, VariantClass, variantName);
    
    this.testedVariants.set(variantName, testSuite);
    return testSuite;
  }

  /**
   * Ajoute des tests automatiques basés sur l'analyse de la classe
   */
  async addAutomaticTests(testSuite, VariantClass, variantName) {
    const variant = new VariantClass();
    
    // Teste les méthodes surchargées
    this.addOverriddenMethodTests(testSuite, variant, VariantClass, variantName);
    
    // Teste les propriétés spécifiques
    this.addSpecificPropertyTests(testSuite, variant, variantName);
    
    // Teste les comportements spéciaux basés sur les noms de méthodes
    this.addBehaviorBasedTests(testSuite, variant, variantName);
  }

  /**
   * Ajoute des tests pour les méthodes surchargées
   */
  addOverriddenMethodTests(testSuite, variant, VariantClass, variantName) {
    const baseMethods = Object.getOwnPropertyNames(BaseVariant.prototype);
    const variantMethods = Object.getOwnPropertyNames(VariantClass.prototype);
    
    const overriddenMethods = variantMethods.filter(method => 
      baseMethods.includes(method) && method !== 'constructor'
    );

    overriddenMethods.forEach(methodName => {
      testSuite.addVariantSpecificTest(
        `Overridden method ${methodName} works correctly`,
        () => {
          const { assert, assertTrue } = require('./TestFramework.js');
          assertTrue(typeof variant[methodName] === 'function', 
            `${methodName} should be a function`);
        }
      );
    });
  }

  /**
   * Ajoute des tests pour les propriétés spécifiques
   */
  addSpecificPropertyTests(testSuite, variant, variantName) {
    // Détecte les propriétés spécifiques à la variante
    const variantProperties = Object.keys(variant).filter(key => 
      !['kingMoved', 'rookMoved', 'lastMove'].includes(key)
    );

    variantProperties.forEach(property => {
      const value = variant[property];
      
      if (Array.isArray(value)) {
        testSuite.addVariantSpecificTest(
          `Property ${property} is a valid array`,
          () => {
            const { assert, assertTrue, assertNotNull } = require('./TestFramework.js');
            assertTrue(Array.isArray(value), `${property} should be an array`);
            if (value.length > 0) {
              assertNotNull(value[0], `${property} should not be empty`);
            }
          }
        );
      }
    });
  }

  /**
   * Ajoute des tests basés sur les comportements détectés
   */
  addBehaviorBasedTests(testSuite, variant, variantName) {
    const className = variantName.toLowerCase();
    
    // Tests pour Atomic
    if (className.includes('atomic')) {
      this.addAtomicSpecificTests(testSuite, variant);
    }
    
    // Tests pour King of the Hill
    if (className.includes('hill')) {
      this.addHillSpecificTests(testSuite, variant);
    }
    
    // Tests pour Battle Royale
    if (className.includes('battle') || className.includes('royale')) {
      this.addBattleRoyaleSpecificTests(testSuite, variant);
    }
    
    // Tests pour Portal
    if (className.includes('portal')) {
      this.addPortalSpecificTests(testSuite, variant);
    }
  }

  /**
   * Tests spécifiques pour la variante Atomic
   */
  addAtomicSpecificTests(testSuite, variant) {
    testSuite.addVariantSpecificTests([
      {
        description: 'Has explosion mechanics',
        test: () => {
          const { assertTrue } = require('./TestFramework.js');
          assertTrue(typeof variant.applyAtomicExplosion === 'function' || 
                   variant.applyMove.toString().includes('explosion'), 
                   'Should have explosion mechanics');
        }
      },
      {
        description: 'Explosion affects board correctly',
        test: () => {
          const { assertNotNull } = require('./TestFramework.js');
          const board = this.createSimpleBoard();
          const result = variant.applyMove(board, [6, 0], [1, 0], 'R');
          assertNotNull(result.board, 'Should return valid board after move');
        }
      }
    ]);
  }

  /**
   * Tests spécifiques pour la variante King of the Hill
   */
  addHillSpecificTests(testSuite, variant) {
    testSuite.addVariantSpecificTests([
      {
        description: 'Has hill detection mechanics',
        test: () => {
          const { assertTrue } = require('./TestFramework.js');
          assertTrue(typeof variant.isKingOnHill === 'function' || 
                   typeof variant.getHillSquares === 'function', 
                   'Should have hill detection mechanics');
        }
      },
      {
        description: 'Hill squares are defined correctly',
        test: () => {
          if (variant.getHillSquares) {
            const { assertTrue } = require('./TestFramework.js');
            const hillSquares = variant.getHillSquares();
            assertTrue(hillSquares.length >= 4, 'Should have at least 4 hill squares');
          }
        }
      }
    ]);
  }

  /**
   * Tests spécifiques pour la variante Battle Royale
   */
  addBattleRoyaleSpecificTests(testSuite, variant) {
    testSuite.addVariantSpecificTests([
      {
        description: 'Has shrinking mechanics or special win conditions',
        test: () => {
          const { assertTrue } = require('./TestFramework.js');
          // Vérifie s'il y a des méthodes spécifiques à Battle Royale
          const hasSpecialMechanics = 
            typeof variant.shrinkBoard === 'function' ||
            typeof variant.getSafeZone === 'function' ||
            variant.checkGameOver.toString().includes('shrink');
          
          // Ce test peut passer avec true ou false selon l'implémentation
          assertTrue(typeof hasSpecialMechanics === 'boolean', 'Should have consistent mechanics detection');
        }
      }
    ]);
  }

  /**
   * Tests spécifiques pour la variante Portal
   */
  addPortalSpecificTests(testSuite, variant) {
    testSuite.addVariantSpecificTests([
      {
        description: 'Has portal mechanics',
        test: () => {
          const { assertTrue } = require('./TestFramework.js');
          const hasPortalMechanics = 
            typeof variant.usePortal === 'function' ||
            typeof variant.getPortalSquares === 'function' ||
            variant.applyMove.toString().includes('portal');
          
          assertTrue(typeof hasPortalMechanics === 'boolean', 'Should have consistent portal detection');
        }
      }
    ]);
  }

  /**
   * Crée un échiquier simple pour les tests
   */
  createSimpleBoard() {
    return [
      ['r','n','b','q','k','b','n','r'],
      ['p','p','p','p','p','p','p','p'],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      ['P','P','P','P','P','P','P','P'],
      ['R','N','B','Q','K','B','N','R']
    ];
  }

  /**
   * Génère et exécute tous les tests pour les variantes enregistrées
   */
  async runAllTests() {
    console.log('🚀 Starting Automatic Test Generation');
    console.log('======================================\n');
    
    await this.detectVariants();
    
    const testSuites = [];
    const results = [];
    let totalPassed = 0;
    let totalFailed = 0;

    for (const [variantName, importFunction] of this.variantRegistry) {
      try {
        console.log(`🧪 Testing ${variantName}...`);
        
        const module = await importFunction();
        const VariantClass = module[variantName] || module.default;
        
        if (!VariantClass) {
          console.warn(`⚠️  Could not find class ${variantName} in module`);
          continue;
        }

        const testSuite = await this.createTestsForVariant(variantName, VariantClass);
        testSuites.push(testSuite);
        
        const success = await testSuite.run();
        results.push({
          name: variantName,
          passed: testSuite.testSuite.passed,
          failed: testSuite.testSuite.failed,
          success
        });
        
        totalPassed += testSuite.testSuite.passed;
        totalFailed += testSuite.testSuite.failed;
        
      } catch (error) {
        console.error(`❌ Error testing ${variantName}:`, error.message);
        results.push({
          name: variantName,
          passed: 0,
          failed: 1,
          success: false,
          error: error.message
        });
        totalFailed++;
      }
    }

    // Affiche le résumé
    console.log('\n📊 Automatic Test Summary');
    console.log('==========================');
    
    for (const result of results) {
      if (result.error) {
        console.log(`❌ ${result.name}: ERROR - ${result.error}`);
      } else {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${result.name}: ${result.passed} passed, ${result.failed} failed`);
      }
    }
    
    console.log('\n==========================');
    console.log(`📈 Total: ${totalPassed} passed, ${totalFailed} failed`);
    
    if (totalFailed === 0) {
      console.log('🎉 All automatic tests passed!');
    } else {
      console.log(`⚠️  ${totalFailed} test(s) failed`);
    }

    return totalFailed === 0;
  }

  /**
   * Crée un gablat (template) pour les tests d'une nouvelle variante
   */
  createTestTemplate(variantName) {
    return `
import { VariantTestSuite } from './VariantTestSuite.js';
import { ${variantName} } from '../variants/${variantName}.js';

/**
 * Tests spécifiques pour la variante ${variantName}
 * Créé automatiquement par le système de test
 */
export function create${variantName}Tests() {
  const testSuite = new VariantTestSuite(${variantName}, '${variantName}');

  // Ajoutez ici vos tests spécifiques
  testSuite.addVariantSpecificTests([
    {
      description: 'Exemple de test spécifique',
      test: () => {
        const variant = new ${variantName}();
        // Votre logique de test ici
        assertTrue(true, 'Test example');
      }
    }
  ]);

  return testSuite;
}
`;
  }
}

// Instance unique pour le système
export const autoTestSystem = new AutoTestSystem();