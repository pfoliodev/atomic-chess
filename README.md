# ☢️ Atomic Chess Pro

Application d'échecs en ligne avec variante Atomic, développée avec une architecture modulaire permettant l'ajout facile de nouvelles variantes.

## 🎮 Fonctionnalités

- ⚛️ **Mode Atomic** : Les captures provoquent des explosions 3×3 (pions immunisés)
- 👥 **Mode Local** : 2 joueurs sur le même appareil
- 🌐 **Mode Online** : Parties en ligne via Firebase
- ⏱️ **Chronomètre** : 3, 5, 10 ou 15 minutes par joueur
- ♔ **Règles complètes** : Roque, prise en passant, promotion
- 📜 **Historique** : Notation algébrique des coups
- 🎨 **Interface moderne** : Design responsive avec Tailwind CSS

## 🚀 Démarrage rapide

### Installation

```bash
# Cloner le repository
git clone <url>
cd atomic-chess

# Installer Firebase CLI (si nécessaire)
npm install -g firebase-tools

# Se connecter à Firebase
firebase login
```

### Développement local

```bash
# Lancer le serveur de développement
firebase serve --only hosting

# Ouvrir dans le navigateur
# http://localhost:5000
```

### Déploiement

```bash
# Déployer sur Firebase Hosting
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
│       │   └── StandardVariant.js
│       ├── ui/                 # Interface utilisateur
│       │   ├── Renderer.js
│       │   └── MenuUI.js
│       └── network/            # Synchronisation
│           └── FirebaseSync.js
├── ARCHITECTURE.md             # Documentation architecture
├── CHANGELOG.md                # Historique des changements
└── README.md                   # Ce fichier
```

## 🎯 Architecture modulaire

Le projet utilise une architecture modulaire permettant d'ajouter facilement de nouvelles variantes d'échecs.

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

2. **L'utiliser dans l'application**

```javascript
// Dans main.js
import { MyVariant } from './variants/MyVariant.js';

const variant = new MyVariant();
const game = new Game(variant, 'local', 600);
```

Voir `ARCHITECTURE.md` pour plus de détails.

## 🛠️ Technologies

- **Frontend** : Vanilla JavaScript (ES6 Modules)
- **Styling** : Tailwind CSS
- **Backend** : Firebase (Firestore + Hosting + Auth)
- **Architecture** : Modulaire avec injection de dépendances

## 📖 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Documentation complète de l'architecture
- **[CHANGELOG.md](CHANGELOG.md)** - Historique des changements

## 🎮 Règles Atomic Chess

Dans les échecs atomiques, lorsqu'une pièce capture une autre :

1. 💥 **Explosion** : Toutes les pièces adjacentes (3×3) sont détruites
2. 🛡️ **Pions immunisés** : Les pions ne sont pas affectés par les explosions
3. ♔ **Victoire** : Détruire le roi adverse (pas besoin de mat)
4. 🎯 **Stratégie unique** : Sacrifices explosifs et attaques par proximité

## 🌟 Exemples de variantes possibles

L'architecture permet d'ajouter facilement :

- ♟️ **Standard Chess** : Échecs classiques
- 🎲 **Chess960** : Position de départ aléatoire (Fischer Random)
- ✓✓✓ **Three-Check** : Gagner en mettant 3 échecs
- 👑 **King of the Hill** : Amener le roi au centre
- ♻️ **Crazyhouse** : Replacer les pièces capturées
- 🏰 **Horde** : 36 pions contre armée normale

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour ajouter une variante :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/ma-variante`)
3. Créer votre variante dans `public/js/variants/`
4. Commit (`git commit -m 'Ajout variante XYZ'`)
5. Push (`git push origin feature/ma-variante`)
6. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT.

## 🙏 Crédits

- Symboles Unicode Chess
- Firebase pour l'hébergement et la base de données
- Tailwind CSS pour le styling

## 📧 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue.

---

**Version** : 2.0.0  
**Date** : Décembre 2025  
**Status** : ✅ Production Ready
