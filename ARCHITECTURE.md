# Architecture Modulaire - Atomic Chess

## 📋 Vue d'ensemble

L'application a été refactorisée d'une architecture monolithique vers une architecture modulaire permettant d'ajouter facilement de nouvelles variantes d'échecs, avec un système de test complet et automatisé.

## 🏗️ Structure des fichiers

```
public/
├── index.html                    # Point d'entrée HTML (simplifié)
├── index-old.html               # Ancienne version monolithique (backup)
└── js/
    ├── main.js                  # Point d'entrée de l'application
    ├── core/                    # Composants principaux
    │   ├── Board.js            # Utilitaires échiquier
    │   ├── Game.js             # Gestionnaire de partie
    │   └── Timer.js            # Gestion du chronomètre
    ├── variants/               # Variantes de jeu
    │   ├── BaseVariant.js      # Classe abstraite (interface commune)
    │   ├── AtomicVariant.js    # Règles atomic (explosions)
    │   ├── KingOfTheHillVariant.js # Règles King of the Hill
    │   ├── BattleRoyaleVariant.js   # Règles Battle Royale
    │   └── StandardVariant.js  # Règles échecs classiques
    ├── ui/                     # Interface utilisateur
    │   ├── Renderer.js         # Rendu de l'échiquier
    │   └── MenuUI.js           # Menu principal
    ├── test/                   # Système de test
    │   ├── TestFramework.js    # Framework de test de base
    │   ├── VariantTestSuite.js # Suite de tests abstraite
    │   ├── VariantTestSuites.js # Tests spécifiques par variante
    │   ├── AutoTestSystem.js  # Système de test automatique
    │   ├── RunTests.js         # Exécuteur principal
    │   ├── RunAutomaticTests.js # Tests automatiques seulement
    │   └── RunAutoTestsOnly.js # Tests auto isolés
    └── network/                # Réseau
        └── FirebaseSync.js     # Synchronisation online
```

## 🎯 Composants clés

### Core

#### **Board.js**
Utilitaires pour l'échiquier :
- `pieceSymbols` : Symboles Unicode des pièces
- `isWhitePiece()` : Détermine la couleur d'une pièce
- `toAlgebraic()` : Convertit en notation algébrique
- `findKing()` : Trouve la position d'un roi
- `flatten()` / `unflatten()` : Conversion pour Firebase

#### **Game.js**
Orchestre une partie complète :
- Accepte une variante en paramètre (injection de dépendance)
- Gère le tour des joueurs et l'historique
- Délègue la logique métier à la variante
- Callbacks : `onMove`, `onGameOver`, `onStateChange`

#### **Timer.js**
Gestion du chronomètre :
- `start()` / `stop()` / `pause()` / `resume()`
- Callbacks : `onTick`, `onTimeout`
- Formatage du temps

### Variants

#### **BaseVariant.js**
Interface commune pour toutes les variantes :
```javascript
class BaseVariant {
  getInitialBoard()              // Position de départ
  checkBasicMove()               // Validation des mouvements
  isSquareAttacked()             // Détection d'attaques
  canCastle()                    // Roque
  canCaptureEnPassant()          // Prise en passant
  isMoveSafe()                   // Sécurité du roi
  getSimulatedBoard()            // Simulation de coup
  applyMove()                    // Application d'un coup
  getValidMoves()                // Coups valides
  checkGameOver()                // Fin de partie
  setState() / getState()        // Sérialisation
}
```

#### **AtomicVariant.js**
Hérite de `BaseVariant` et implémente :
- `applyAtomicExplosion()` : Explosion 3×3 (sans les pions)
- Surcharge `getSimulatedBoard()` : Simulation avec explosion
- Surcharge `applyMove()` : Application avec explosion

#### **KingOfTheHillVariant.js**
Hérite de `BaseVariant` et implémente :
- `isKingOnHill()` : Détection roi sur cases centrales
- `getHillSquares()` : Retourne les 4 cases centrales
- Surcharge `checkGameOver()` : Victoire par colline + mat
- Surcharge `applyMove()` : Notation spéciale avec emoji 🏔️

#### **BattleRoyaleVariant.js**
Hérite de `BaseVariant` et implémente :
- `shrinkBoard()` : Réduction du plateau toutes les 5 manches
- `getSafeZone()` : Zone de sécurité actuelle
- Surcharge `checkGameOver()` : Dernier roi survivant
- Surcharge `applyMove()` : Logique de réduction progressive

#### **StandardVariant.js**
Hérite de `BaseVariant` sans surcharge :
- Implémente les échecs classiques traditionnels
- Utilise directement les règles de BaseVariant

### UI

#### **Renderer.js**
Rendu de l'interface :
- `renderGame()` : Affiche l'échiquier et l'état
- `renderGameOverModal()` : Modal de fin de partie
- `shakeBoard()` : Animation de mouvement invalide

#### **MenuUI.js**
Menu principal :
- Sélection du mode (Local / Online)
- Choix du temps de jeu (3/5/10/15 min)
- Callbacks : `onStartLocal`, `onCreateOnline`, `onJoinOnline`

### Network

#### **FirebaseSync.js**
Synchronisation Firebase :
- `createGame()` : Crée une partie en ligne
- `joinGame()` : Rejoint une partie
- `startSync()` : Écoute les changements
- `updateGame()` : Met à jour l'état
- `updateTimer()` : Sync du chronomètre

### Test

#### **TestFramework.js**
Framework de test minimaliste :
- `TestSuite` : Conteneur de tests avec exécution asynchrone
- Assertions : `assert`, `assertEqual`, `assertTrue`, etc.
- Pas de dépendances externes, fonctionne avec Node.js

#### **VariantTestSuite.js**
Classe de test abstraite pour variantes :
- 10 tests communs automatiques pour toutes les variantes
- `addVariantSpecificTest()` : Ajout de tests personnalisés
- Validation de l'interface BaseVariant
- Tests de régression intégrés

#### **AutoTestSystem.js**
Système de test automatique intelligent :
- Détection automatique des nouvelles variantes
- Génération de tests basés sur les méthodes surchargées
- Analyse des propriétés spécifiques aux variantes
- Rapport détaillé de couverture

### Main

#### **main.js**
Orchestre l'application :
- Initialise Firebase
- Crée les composants (Game, Renderer, MenuUI)
- Connecte les callbacks entre composants
- Gère les modes (menu / local / online)

## 🔄 Flux de données

### Mode Local
```
User Click → Game.handleSquareClick()
          → Variant.applyMove()
          → Game.onMove callback
          → Renderer.renderGame()
```

### Mode Online
```
User Click → Game.handleSquareClick()
          → Variant.applyMove()
          → Game.onMove callback
          → FirebaseSync.updateGame()
          → Firebase (sync)
          → FirebaseSync callback
          → Game.syncState()
          → Renderer.renderGame()
```

## ➕ Ajouter une nouvelle variante

### Exemple : Chess960 (Fischer Random)

1. **Créer le fichier** `public/js/variants/Chess960Variant.js` :

```javascript
import { BaseVariant } from './BaseVariant.js';

export class Chess960Variant extends BaseVariant {
  getInitialBoard() {
    // Générer une position Fischer Random
    return this.generateFischerRandomPosition();
  }
  
  generateFischerRandomPosition() {
    // Logique de génération aléatoire
    // ...
  }
}
```

2. **Utiliser la variante** dans `main.js` :

```javascript
import { Chess960Variant } from './variants/Chess960Variant.js';

// Dans une méthode de App
startChess960Game(timeControl) {
  const variant = new Chess960Variant();
  this.game = new Game(variant, 'local', timeControl);
  // ...
}
```

3. **Ajouter un bouton** dans `MenuUI.js` pour sélectionner la variante

### Variantes actuellement implémentées :
- **Standard Chess** : Échecs classiques (✅ implémenté)
- **King of Hill** : Amener son roi au centre (✅ implémenté)
- **Battle Royale** : Plateau qui réduit progressivement (✅ implémenté)

### Autres exemples de variantes possibles :
- **Three-Check** : Gagner en mettant 3 échecs
- **Crazyhouse** : Replacer les pièces capturées
- **Horde** : Un camp a 36 pions contre l'autre
- **Chess960** : Position de départ aléatoire (Fischer Random)
- **Antichess** : Perdre toutes ses pièces pour gagner

## 🎨 Personnalisation de l'UI

Pour personnaliser l'apparence :
- **Échiquier** : Modifier les couleurs dans `Renderer.js` (bg-[#eeeed2], bg-[#769656])
- **Menu** : Éditer `MenuUI.js`
- **Styles** : Modifier le `<style>` dans `index.html`

## 🔧 Maintenance

### Tests
Système de test complet et automatisé :

#### Tests manuels
```bash
npm test                    # Tous les tests
npm run test:manual         # Tests manuels seulement
```

#### Tests automatiques
```bash
npm run test:auto           # Tests automatiques seulement
```

#### Tests de variante spécifique
```javascript
import { createAtomicVariantTests } from './test/VariantTestSuites.js';
const tests = createAtomicVariantTests();
tests.run();
```

#### Tests en console
```javascript
const variant = new AtomicVariant();
const board = variant.getInitialBoard();
const moves = variant.getValidMoves(board, 6, 4, 'white');
console.log(moves);
```

#### Couverture de test automatique
- 13 tests communs pour toutes les variantes
- Tests spécifiques selon les méthodes surchargées
- Détection automatique des nouvelles variantes
- Validation de l'interface et régressions

### Debug
Activer les logs dans les composants :
```javascript
// Dans Game.js
console.log('Move applied:', result);
```

## 📦 Déploiement

```bash
# Local
firebase serve --only hosting

# Production
firebase deploy --only hosting
```

## ✅ Avantages de l'architecture

1. **Modularité** : Ajout de variantes sans modifier le code existant
2. **Séparation des responsabilités** : UI / Logique / Réseau isolés
3. **Testabilité** : Chaque module peut être testé indépendamment
4. **Maintenabilité** : Code organisé et documenté
5. **Réutilisabilité** : Components réutilisables (Timer, Renderer, etc.)
6. **Extensibilité** : Facile d'ajouter de nouvelles fonctionnalités
7. **Qualité assurée** : Tests automatiques et régression

## 🔄 Migration de l'ancien code

L'ancien code monolithique est sauvegardé dans `public/index-old.html`. 
Toutes les fonctionnalités ont été préservées dans la nouvelle architecture.

## 📝 Notes

- Le mode atomic continue de fonctionner exactement comme avant
- Les parties en ligne utilisent Firebase Firestore
- Le chronomètre ne démarre qu'une fois les deux joueurs connectés (online)
- Les explosions atomiques ne détruisent pas les pions
- Les tests garantissent la qualité et la non-régression du code
- Le système de test automatique valide les nouvelles variantes automatiquement