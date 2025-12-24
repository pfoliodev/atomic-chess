# Guide de Test pour Variantes d'Échecs

Ce guide explique comment ajouter des tests pour vos variantes d'échecs et garantir la qualité du code.

## 📋 Vue d'Ensemble

Le système de test est composé de plusieurs couches :

1. **TestFramework.js** - Framework de test de base
2. **VariantTestSuite.js** - Classe de test abstraite pour variantes
3. **VariantTestSuites.js** - Tests spécifiques pour chaque variante
4. **AutoTestSystem.js** - Système de test automatique
5. **RunTests.js** - Exécuteur principal des tests

## 🚀 Comment Ajouter une Nouvelle Variante

### Étape 1: Créer la classe de variante

```javascript
// public/js/variants/MaVariante.js
import { BaseVariant } from './BaseVariant.js';

export class MaVariante extends BaseVariant {
  constructor() {
    super();
    // Propriétés spécifiques à votre variante
    this.maProprieteSpeciale = true;
  }

  // Surchargez les méthodes nécessaires
  checkGameOver(board) {
    // Logique spécifique de fin de partie
    return super.checkGameOver(board);
  }

  applyMove(board, from, to, piece) {
    // Logique spécifique d'application de mouvement
    return super.applyMove(board, from, to, piece);
  }
}
```

### Étape 2: Créer les tests spécifiques

Utilisez le système de test automatique pour générer un template :

```javascript
// public/js/test/MaVarianteTests.js
import { VariantTestSuite } from './VariantTestSuite.js';
import { MaVariante } from '../variants/MaVariante.js';

export function createMaVarianteTests() {
  const testSuite = new VariantTestSuite(MaVariante, 'MaVariante');

  // Tests spécifiques à votre variante
  testSuite.addVariantSpecificTests([
    {
      description: 'Ma propriété spécifique fonctionne',
      test: () => {
        const variant = new MaVariante();
        assertTrue(variant.maProprieteSpeciale, 'Propriété should be true');
      }
    },
    {
      description: 'Logique de fin de partie spécifique',
      test: () => {
        const variant = new MaVariante();
        const board = variant.getInitialBoard();
        // Testez votre condition de victoire
        const result = variant.checkGameOver(board);
        assertNull(result, 'Game should not be over initially');
      }
    }
  ]);

  return testSuite;
}
```

### Étape 3: Intégrer dans le système de test

1. **Option A - Manuelle** : Ajoutez vos tests à `RunTests.js` :
```javascript
import { createMaVarianteTests } from './MaVarianteTests.js';

// Dans runAllTests():
const testSuites = [
  // ... autres tests
  createMaVarianteTests(),
];
```

2. **Option B - Automatique** : Le système `AutoTestSystem` détectera automatiquement votre variante si elle suit le pattern de nommage (`*Variant.js`).

## 🧪 Types de Tests Disponibles

### Tests Communs (automatiques)

Toutes les variantes bénéficient automatiquement de ces tests :

- ✅ Initialisation de la variante
- ✅ Configuration de l'échiquier initial
- ✅ Mouvements de base des pièces
- ✅ Validation de sécurité des mouvements
- ✅ Détection de fin de partie
- ✅ Application des mouvements
- ✅ Roque
- ✅ Prise en passant
- ✅ Génération de coups valides
- ✅ Gestion de l'état

### Tests Spécifiques

Ajoutez des tests pour les fonctionnalités uniques de votre variante :

```javascript
// Exemples de tests spécifiques
testSuite.addVariantSpecificTests([
  {
    description: 'Explosion atomique détruit les pièces adjacentes',
    test: () => {
      const variant = new AtomicVariant();
      // Testez l'explosion
    }
  },
  {
    description: 'Roi sur la colline gagne la partie',
    test: () => {
      const variant = new KingOfTheHillVariant();
      // Testez la condition de victoire
    }
  }
]);
```

## 🤖 Tests Automatiques

### Détection Automatique

Le système détecte automatiquement les variantes dans `public/js/variants/` :

- Fichiers se terminant par `Variant.js`
- Non préfixés par `Base`
- Exportant une classe

### Génération Automatique

Pour générer des tests automatiquement :

```bash
# Exécutez tous les tests (automatique + manuels)
node public/js/test/RunTests.js

# Exécutez uniquement les tests automatiques
node public/js/test/RunAutomaticTests.js
```

### Tests Intelligents

Le système génère des tests basés sur :

- **Méthodes surchargées** : Détecte quand vous surchargez `applyMove`, `checkGameOver`, etc.
- **Propriétés spécifiques** : Teste les propriétés ajoutées à votre variante
- **Noms de méthodes** : Détecte des patterns comme `applyAtomicExplosion`, `isKingOnHill`, etc.

## 📊 Lancement des Tests

### Tous les Tests
```bash
npm test
# ou
node public/js/test/RunTests.js
```

### Tests Automatiques Seulement
```bash
node public/js/test/RunAutomaticTests.js
```

### Tests d'une Variante Spécifique
```javascript
import { createMaVarianteTests } from './MaVarianteTests.js';

const tests = createMaVarianteTests();
tests.run().then(success => {
  console.log(success ? '✅ Passed' : '❌ Failed');
});
```

## 🔧 Assertions Disponibles

```javascript
import { 
  assert, 
  assertEqual, 
  assertDeepEqual, 
  assertArrayIncludes,
  assertNull, 
  assertNotNull, 
  assertTrue, 
  assertFalse 
} from './TestFramework.js';

// Assertions de base
assert(condition, message);
assertEqual(actual, expected, message);
assertDeepEqual(actual, expected, message);

// Assertions de collections
assertArrayIncludes(array, item, message);

// Assertions de null/boolean
assertNull(value, message);
assertNotNull(value, message);
assertTrue(value, message);
assertFalse(value, message);
```

## 🎯 Bonnes Pratiques

### 1. Tests Descriptifs
```javascript
// ✅ Bon
testSuite.addVariantSpecificTest('King reaches center wins game', () => {
  // Test
});

// ❌ Éviter
testSuite.addVariantSpecificTest('Test 1', () => {
  // Test
});
```

### 2. Tests Isolés
Chaque test doit être indépendant des autres :

```javascript
// ✅ Bon - Crée un nouvel état à chaque fois
testSuite.addVariantSpecificTest('Specific scenario', () => {
  const variant = new MaVariante();
  const board = createSpecificBoard();
  // Test
});

// ❌ Éviter - Dépend de l'état précédent
let sharedVariant;
testSuite.addVariantSpecificTest('Setup', () => {
  sharedVariant = new MaVariante();
});
testSuite.addVariantSpecificTest('Use shared state', () => {
  // Utilise sharedVariant
});
```

### 3. Tests de Limites
Testez les cas extrêmes :

```javascript
testSuite.addVariantSpecificTests([
  {
    description: 'Empty board handling',
    test: () => {
      const variant = new MaVariante();
      const emptyBoard = Array(8).fill(null).map(() => Array(8).fill(null));
      // Testez comment votre variante gère un échiquier vide
    }
  },
  {
    description: 'Full board handling',
    test: () => {
      const variant = new MaVariante();
      const fullBoard = Array(8).fill(null).map(() => 
        Array(8).fill('Q') // Échiquier plein de reines
      );
      // Testez les performances et la logique
    }
  }
]);
```

## 🐛 Débogage des Tests

### Logs Détaillés
Activez les logs pour déboguer :

```javascript
testSuite.addVariantSpecificTest('Debug test', () => {
  const variant = new MaVariante();
  const board = variant.getInitialBoard();
  
  console.log('Board state:', JSON.stringify(board, null, 2));
  console.log('Variant properties:', Object.keys(variant));
  
  // Votre test
  const result = variant.someMethod(board, ...args);
  console.log('Method result:', result);
  
  assertTrue(result.someCondition, 'Condition should be true');
});
```

### Tests Isolés
Pour tester un seul cas problématique :

```javascript
// Créez un fichier temporaire
import { VariantTestSuite } from './VariantTestSuite.js';
import { MaVariante } from '../variants/MaVariante.js';

const debugSuite = new VariantTestSuite(MaVariante, 'Debug');

debugSuite.addVariantSpecificTest('Specific failing case', () => {
  // Reproduisez le problème exact
});

debugSuite.run();
```

## 📈 Métriques et Couverture

Le système fournit automatiquement :

- **Nombre de tests par variante**
- **Taux de réussite/échec**
- **Tests de régression automatiques**
- **Détection de nouvelles fonctionnalités**

### Rapport d'Exemple
```
🧪 Starting Atomic Chess Test Suite
====================================

BaseVariant Tests
==================================================
✓ BaseVariant - Initialization
✓ BaseVariant - Initial board setup
✓ ...
Result: 10 passed, 0 failed

AtomicVariant Tests
==================================================
✓ AtomicVariant - Initialization
✓ AtomicVariant - Initial board setup
✓ AtomicVariant - Atomic explosion destroys adjacent pieces except pawns
✓ ...
Result: 12 passed, 0 failed

📊 Test Summary
====================================
✅ BaseVariant: 10 passed, 0 failed
✅ AtomicVariant: 12 passed, 0 failed
✅ KingOfTheHillVariant: 8 passed, 0 failed
✅ StandardVariant: 6 passed, 0 failed

📈 Total: 36 passed, 0 failed
✅ All tests passed!
```

## 🔄 Tests de Régression

Le système garantit que les nouvelles variantes ne cassent pas l'existant :

1. **Tests communs** : Toutes les variantes sont testées sur les mêmes bases
2. **Héritage** : Vérifie que `super()` est appelé correctement
3. **Signatures** : Valide que les méthodes surchargées gardent les bonnes signatures
4. **Comportements** : Détecte les changements inattendus dans les comportements existants

## 🎉 Conclusion

Avec ce système de test :

- ✅ **Robustesse** : Toutes les variantes sont testées automatiquement
- ✅ **Maintenance** : Facile d'ajouter des tests pour de nouvelles variantes
- ✅ **Régression** : Détecte automatiquement les régressions
- ✅ **Documentation** : Les tests servent de documentation vivante
- ✅ **Confiance** : Permet de refactoriser en toute sécurité

Pour toute question ou problème avec les tests, référez-vous aux exemples dans les fichiers existants ou utilisez le système de test automatique comme guide.