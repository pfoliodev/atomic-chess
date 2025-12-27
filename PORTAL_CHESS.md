# 🌀 Portal Chess - Variante avec Portails Latéraux

## 📖 Description

Portal Chess est une variante d'échecs fascinante où les pièces de longue portée peuvent "enrouler" l'échiquier par les côtés (gauche/droite), créant des mouvements impossibles aux échecs classiques.

## 🎯 Règles principales

### Pièces affectées par les portails

Les **cavaliers, tours, reines et fous** peuvent traverser les côtés de l'échiquier :

#### 📍 Mouvements horizontaux (Tours, Reines)
- Une tour en **h4** se déplaçant vers la **droite** réapparaît en **a4**
- Une tour en **a4** se déplaçant vers la **gauche** réapparaît en **h4**
- Toutes les cases intermédiaires doivent être libres

#### 🔀 Mouvements diagonaux (Fous, Reines)
- Un fou en **h2** se déplaçant en diagonale vers le haut-droit réapparaît en **a1**
- Les chemins enveloppés doivent être dégagés
- Les diagonales peuvent s'enrouler latéralement

#### 🐴 Mouvements de cavalier
- Un cavalier en **h5** peut sauter en **a4** ou **a6** (enroule par la droite)
- Les cavaliers ne peuvent pas "sauter" plus haut ou plus bas que normalement
- Les portails latéraux élargissent les possibilités de mouvement

### Pièces NON affectées

#### ✋ Roi
- Le roi se déplace normalement (1 case dans toutes les directions)
- Pas d'enroulement possible

#### ♟️ Pions
- Les pions avancent et capturent normalement
- Pas d'enroulement possible
- Les lignes 1 et 8 restent impassables par le bas/haut

#### ⚠️ Frontières verticales
**IMPORTANT** : Les pièces **NE PEUVENT PAS** traverser par le haut (ligne 8) ou le bas (ligne 1). L'échiquier a des murs invisibles en haut et en bas !

## 🎮 Exemples de jeu

### Exemple 1 : Tour enveloppée
```
Position initiale (4ème rang) :
a4 - b4(libre) - c4(libre) - d4(libre) - e4(libre) - f4(libre) - g4(libre) - h4(TOUR)

La tour en h4 se déplace à droite → elle réapparaît en a4
```

### Exemple 2 : Fou diagonal avec portail
```
Position : Fou en h1
Mouvement : vers haut-droit (la vraie diagonale l'enrouleraient)
Résultat : Le fou peut atteindre des cases hors-limite en passant par les côtés
```

### Exemple 3 : Cavalier intelligent
```
Position : Cavalier en h5
Mouvements possibles :
- Mouvements normaux : f6, f4, g7, g3
- Mouvements enveloppés : a6, a4
- Les portails doublent presque les options !
```

## 🔐 Règles spéciales

### 🛡️ Sécurité du roi
- Les vérifications et mat fonctionnent normalement
- Un roi ne peut pas se mettre en sécurité à travers le vide
- Les coups doivent être légaux comme aux échecs classiques

### 🔄 Roque
- Le roque fonctionne normalement
- Les conditions standard s'appliquent (roi et tour n'ont pas bougé)
- Pas d'enroulement pour le roque

### ♕ Prise en passant
- Fonctionne normalement pour les pions

## 🎲 Stratégie

### Avantages des portails

1. **Meilleure activité des pièces** - Les tours et fous accédent à plus de cases
2. **Tactiques de pincement** - Combiner attaques par deux côtés différents
3. **Évasion rapide** - Les pièces peuvent fuir rapidement via les portails
4. **Chasse aux roi** - Les cavaliers sont redoutablement mobiles

### Défense

1. **Contrôle des côtés** - Garder les bords de l'échiquier libres
2. **Bloquer les chemins** - Les pièces bloquent aussi par les portails
3. **Centrer le roi** - Les rois au centre sont plus en sécurité
4. **Positions compactes** - Grouper ses pièces limite les infiltrations

## ♾️ Variantes possibles

### Portal Chess Plus
- Autoriser aussi les enroulements haut/bas (échiquier complètement toroïdal)
- Ajouter des obstacles spéciaux

### Atomic Portal Chess
- Combiner les explosions atomiques avec les portails latéraux
- Stratégie encore plus agressive

### Portal Chess avec zones
- Ajouter des cases "sûres" ou "dangereuses"
- Mettre en place des règles asymétriques

## 📊 Différences avec les échecs classiques

| Aspect | Standard | Portal |
|--------|----------|--------|
| Tours | 14 cases max | Jusqu'à 28 cases (avec portails) |
| Fous | Jusqu'à 13 cases | Jusqu'à 26 cases (avec portails) |
| Cavaliers | ~8 cases | Jusqu'à 16 cases (avec portails) |
| Rois | 8 cases | 8 cases (pas de changement) |
| Pions | Normal | Normal (pas de changement) |

## 🧪 Astuces de jeu

1. **Développement rapide** - Les cavaliers se déploient très vite
2. **Doubles attaques** - Attaquer par deux côtés simultanément
3. **Sacrifices créatifs** - Les portails permettent des combinaisons surprenantes
4. **Contrôle du centre** - Plus important qu'aux échecs classiques
5. **Mobilité du roi** - Protéger le roi devient crucial

## 🎯 Conseils pour débuter

1. Maîtrisez les mouvements standards d'abord
2. Expérimentez les portails latéraux avec les tours
3. Apprenez les nouveaux chemins des cavaliers
4. Découvrez les tactiques diagonales des fous
5. Adaptez votre ouverture (pas de d4/d5 classique !)

## 📝 Notes importantes

- Les portails latéraux permettent aussi de **prendre** des pièces à distance
- Un roi peut être **attaqué par les côtés**
- Les cases adjacentes aux bords sont **très importantes**
- La notation algébrique reste la même (a-h, 1-8)

---

**Version** : 1.0  
**Type** : Variante contrôlée (avec limites verticales)  
**Complexité** : Intermédiaire  
**Équilibre** : Favorable aux pièces actives
