# Architecture Modulaire - Atomic Chess

## 📋 Vue d'ensemble

L'application a été refactorisée d'une architecture monolithique vers une architecture modulaire permettant d'ajouter facilement de nouvelles variantes d'échecs.

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
    │   └── AtomicVariant.js    # Règles atomic (explosions)
    ├── ui/                     # Interface utilisateur
    │   ├── Renderer.js         # Rendu de l'échiquier
    │   └── MenuUI.js           # Menu principal
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

### Autres exemples de variantes possibles :
- **Standard Chess** : Échecs classiques (sans explosion)
- **Three-Check** : Gagner en mettant 3 échecs
- **King of the Hill** : Amener son roi au centre
- **Crazyhouse** : Replacer les pièces capturées
- **Horde** : Un camp a 36 pions contre l'autre

## 🎨 Personnalisation de l'UI

Pour personnaliser l'apparence :
- **Échiquier** : Modifier les couleurs dans `Renderer.js` (bg-[#eeeed2], bg-[#769656])
- **Menu** : Éditer `MenuUI.js`
- **Styles** : Modifier le `<style>` dans `index.html`

## 🔧 Maintenance

### Tests
Pour tester une variante :
```javascript
const variant = new AtomicVariant();
const board = variant.getInitialBoard();
const moves = variant.getValidMoves(board, 6, 4, 'white');
console.log(moves);
```

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

## 🔄 Migration de l'ancien code

L'ancien code monolithique est sauvegardé dans `public/index-old.html`. 
Toutes les fonctionnalités ont été préservées dans la nouvelle architecture.

## 📝 Notes

- Le mode atomic continue de fonctionner exactement comme avant
- Les parties en ligne utilisent Firebase Firestore
- Le chronomètre ne démarre qu'une fois les deux joueurs connectés (online)
- Les explosions atomiques ne détruisent pas les pions
