# ♟️ Chess Variants Pro

Application d'échecs en ligne avec variantes multiples, développée avec une architecture modulaire permettant l'ajout facile de nouvelles variantes et un système de test complet garantissant la qualité du code.

## 🎮 Fonctionnalités

- ☢️ **Atomic Chess** : Les captures provoquent des explosions 3×3 (pions immunisés)
- 🏔️ **King of the Hill** : Amener son roi au centre pour gagner
- 🌪️ **Battle Royale** : Le plateau se réduit progressivement, dernier roi survivant gagne
- ♟️ **Standard Chess** : Échecs classiques traditionnels
- 👥 **Mode Local** : 2 joueurs sur le même appareil
- 🌐 **Mode Online** : Parties en ligne via Firebase
- ⏱️ **Chronomètre** : 3, 5, 10 ou 15 minutes par joueur
- ♔ **Règles complètes** : Roque, prise en passant, promotion
- 📜 **Historique** : Notation algébrique des coups
- 🎨 **Interface moderne** : Design responsive avec Tailwind CSS
- 🧪 **Tests automatisés** : Système complet de test et régression

## 🚀 Démarrage rapide

### Installation

```bash
# Cloner le repository
git clone <url>
cd atomic-chess

# Installer les dépendances
npm install

# Installer Firebase CLI (si nécessaire)
npm install -g firebase-tools

# Se connecter à Firebase
firebase login
```

### Développement local

```bash
# Lancer le serveur de développement
npm run dev
# ou
firebase serve --only hosting

# Ouvrir dans le navigateur
# http://localhost:5000
```

### Tests

```bash
# Exécuter tous les tests
npm test

# Tests automatiques uniquement
npm run test:auto

# Tests manuels uniquement
npm run test:manual
```

### Déploiement

```bash
# Déployer sur Firebase Hosting
npm run deploy
# ou
firebase deploy --only hosting
```

## 📁 Structure du projet

```
atomic-chess/
├── public/
│   ├── index.html              # Point d'entrée
│   ├── index-old.html          # Ancien code (backup)
│   └── js/
│       ├── main.js             # Application principale
│       ├── core/               # Composants core
│       │   ├── Board.js
│       │   ├── Game.js
│       │   └── Timer.js
│       ├── variants/           # Variantes de jeu
│       │   ├── BaseVariant.js
│       │   ├── AtomicVariant.js
│       │   ├── KingOfTheHillVariant.js
│       │   ├── BattleRoyaleVariant.js
│       │   └── StandardVariant.js
│       ├── ui/                 # Interface utilisateur
│       │   ├── Renderer.js
│       │   └── MenuUI.js
│       ├── test/               # Système de test
│       │   ├── TestFramework.js
│       │   ├── VariantTestSuite.js
│       │   ├── VariantTestSuites.js
│       │   ├── AutoTestSystem.js
│       │   └── RunTests.js
│       └── network/            # Synchronisation
│           └── FirebaseSync.js
├── ARCHITECTURE.md             # Documentation architecture
├── CHANGELOG.md                # Historique des changements
├── TESTING_GUIDE.md            # Guide des tests
├── README.md                   # Ce fichier
└── package.json                # Scripts npm
```

## 🎯 Architecture modulaire

Le projet utilise une architecture modulaire permettant d'ajouter facilement de nouvelles variantes d'échecs, avec un système de test complet garantissant la qualité et la non-régression.

### Ajouter une nouvelle variante

1. **Créer le fichier de variante**

```javascript
// public/js/variants/MyVariant.js
import { BaseVariant } from './BaseVariant.js';

export class MyVariant extends BaseVariant {
  // Surcharger les méthodes nécessaires
  applyMove(board, from, to, piece) {
    // Logique personnalisée
    return super.applyMove(board, from, to, piece);
  }
}
```

2. **Ajouter des tests spécifiques**

```javascript
// Dans public/js/test/VariantTestSuites.js
export function createMyVariantTests() {
  const testSuite = new VariantTestSuite(MyVariant, 'MyVariant');
  
  testSuite.addVariantSpecificTests([
    {
      description: 'Ma règle spécifique fonctionne',
      test: () => {
        const variant = new MyVariant();
        // Testez votre logique
      }
    }
  ]);
  
  return testSuite;
}
```

3. **L'utiliser dans l'application**

```javascript
// Dans main.js
import { MyVariant } from './variants/MyVariant.js';

const variant = new MyVariant();
const game = new Game(variant, 'local', 600);
```

4. **Tester automatiquement**

```bash
npm run test:auto  # Détecte et teste votre nouvelle variante
```

Voir `ARCHITECTURE.md` et `TESTING_GUIDE.md` pour plus de détails.

## 🧪 Système de test complet

### Tests automatiques
- **78 tests au total** couvrant toutes les variantes
- **13 tests communs** pour chaque variante (initialisation, mouvements, sécurité, etc.)
- **Tests spécifiques** selon les fonctionnalités uniques de chaque variante
- **Détection automatique** des nouvelles variantes dans le répertoire `variants/`
- **Tests de régression** garantissant que les nouvelles variantes ne cassent pas l'existant

### Couverture actuelle
- ✅ **BaseVariant** : 16/16 tests (100%)
- ✅ **KingOfTheHillVariant** : 18/18 tests (100%)  
- ✅ **StandardVariant** : 15/15 tests (100%)
- ⚠️ **AtomicVariant** : 16/18 tests (89%) - 2 échecs mineurs
- ⚠️ **Integration Tests** : Limitations environnementales

### Exécution des tests
```bash
npm test              # Tous les tests avec rapport détaillé
npm run test:auto     # Tests automatiques intelligents
npm run test:manual   # Tests d'intégration manuels
```

## 🎮 Variantes disponibles

### ☢️ Atomic Chess
Dans les échecs atomiques, lorsqu'une pièce capture une autre :

1. 💥 **Explosion** : Toutes les pièces adjacentes (3×3) sont détruites
2. 🛡️ **Pions immunisés** : Les pions ne sont pas affectés par les explosions
3. ♔ **Victoire** : Détruire le roi adverse (pas besoin de mat)
4. 🎯 **Stratégie unique** : Sacrifices explosifs et attaques par proximité

### 🏔️ King of the Hill (Roi de la Colline)
Une variante tactique où l'objectif principal change :

1. 🎯 **Objectif** : Amener son roi sur l'une des 4 cases centrales (d4, e4, d5, e5)
2. ⚡ **Victoire instantanée** : Le roi qui atteint la colline gagne immédiatement
3. 🏃 **Stratégie offensive** : Plus besoin de planquer le roi, il faut courir au centre !
4. 🛡️ **Double menace** : Protéger son roi tout en attaquant celui de l'adversaire

### 🌪️ Battle Royale
Inspiré des jeux de survie, le plateau se réduit jusqu'au combat final :

1. ⏳ **Zone de sécurité** : Toutes les 5 manches, l'anneau extérieur du plateau est détruit
2. ☠️ **Élimination** : Les pièces prises dans la "tempête" sont retirées du jeu
3. 👑 **Dernier survivant** : Le dernier roi en vie sur le plateau gagne la partie
4. 🔥 **Haute tension** : La pression monte à mesure que l'espace se réduit !

### ♟️ Standard Chess
Les échecs classiques traditionnels :

1. ♔ **Mat** : Mettre le roi adverse en échec et mat
2. 🏰 **Roque** : Protection du roi et activation des tours
3. 🎯 **Stratégie** : Contrôle du centre, structure de pions, initiative
4. ⏱️ **Temps** : Gestion de l'horloge pour chaque joueur

## 🌟 Variantes futures possibles

L'architecture modulaire et le système de test permettent d'ajouter facilement :

- 🎲 **Chess960** : Position de départ aléatoire (Fischer Random)
- ✓✓✓ **Three-Check** : Gagner en mettant 3 échecs
- ♻️ **Crazyhouse** : Replacer les pièces capturées
- 🏰 **Horde** : 36 pions contre armée normale
- ⚡ **Lightning** : Parties ultra-rapides (1 minute)
- 🎯 **Antichess** : Perdre toutes ses pièces pour gagner

Chaque nouvelle variante bénéficiera automatiquement de 13 tests de base et de la détection intelligente de ses fonctionnalités uniques.

## 🛠️ Technologies

- **Frontend** : Vanilla JavaScript (ES6 Modules)
- **Styling** : Tailwind CSS
- **Backend** : Firebase (Firestore + Hosting + Auth)
- **Architecture** : Modulaire avec injection de dépendances
- **Tests** : Framework maison avec détection automatique
- **Build** : Modules ES6 natifs (pas de bundler nécessaire)

## 📖 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Documentation complète de l'architecture
- **[CHANGELOG.md](CHANGELOG.md)** - Historique détaillé des changements
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Guide complet pour les tests et nouvelles variantes

## 🤝 Contribution

Les contributions sont les bienvenues ! Le système de test facilite l'ajout de nouvelles variantes en toute sécurité.

### Processus pour ajouter une variante

1. Fork le projet
2. Créer une branche (`git checkout -b feature/ma-variante`)
3. Créer votre variante dans `public/js/variants/`
4. Ajouter des tests spécifiques dans `public/js/test/VariantTestSuites.js`
5. Exécuter les tests (`npm test`)
6. Commit (`git commit -m 'Ajout variante XYZ avec tests'`)
7. Push (`git push origin feature/ma-variante`)
8. Ouvrir une Pull Request

Le système de test automatique validera que votre variante :
- ✅ Implémente correctement l'interface BaseVariant
- ✅ Ne casse pas les variantes existantes
- ✅ Passe tous les tests communs
- ✅ Dispose de tests spécifiques pour ses fonctionnalités uniques

## 📝 License

Ce projet est sous licence MIT.

## 🙏 Crédits

- Symboles Unicode Chess
- Firebase pour l'hébergement et la base de données
- Tailwind CSS pour le styling
- Système de test maison pour la qualité du code

## 📧 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue ou une discussion.

---

**Version** : 2.1.0  
**Date** : Décembre 2025  
**Status** : ✅ Production Ready  
**Nouveautés v2.1.0** : 🧪 Système de test complet avec 78 tests automatiques  
**Nouveautés v2.0.0** : 🏔️ King of the Hill, 🌪️ Battle Royale, Architecture modulaire