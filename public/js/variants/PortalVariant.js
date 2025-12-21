import { BaseVariant } from './BaseVariant.js';
import { Board } from '../core/Board.js';

/**
 * Variante Portal Chess
 * Les bords de l'échiquier sont connectés comme dans Pac-Man
 * Sortir par une bordure fait réapparaître de l'autre côté
 */
export class PortalVariant extends BaseVariant {
  constructor() {
    super();
    this.portalAnimations = []; // Stocke les animations de portail en cours
  }

  /**
   * Applique la logique de portail : normalise les coordonnées qui sortent de l'échiquier
   */
  normalizePosition(row, col) {
    // Gère les colonnes (portail horizontal)
    if (col < 0) return [row, col + 8]; // Sortie à gauche -> entrée à droite
    if (col > 7) return [row, col - 8]; // Sortie à droite -> entrée à gauche
    
    // Gère les lignes (portail vertical)
    if (row < 0) return [row + 8, col]; // Sortie en haut -> entrée en bas
    if (row > 7) return [row - 8, col]; // Sortie en bas -> entrée en haut
    
    return [row, col]; // Position normale
  }

  /**
   * Vérifie si un mouvement traverse un portail
   */
  getPortalCrossing(from, to) {
    const [fR, fC] = from;
    const [tR, tC] = to;
    
    let crossing = null;
    
    // Vérifie le portail horizontal
    if (fC >= 0 && fC <= 7 && tC >= 0 && tC <= 7) {
      // Mouvement normal horizontal
      if (Math.abs(tC - fC) > 4) {
        crossing = tC > fC ? 'right' : 'left';
      }
    } else {
      // Mouvement avec portail explicite
      if ((fC >= 0 && fC <= 7 && tC < 0) || (fC < 0 && tC >= 0 && tC <= 7)) {
        crossing = 'left';
      } else if ((fC >= 0 && fC <= 7 && tC > 7) || (fC > 7 && tC >= 0 && tC <= 7)) {
        crossing = 'right';
      }
    }
    
    // Vérifie le portail vertical
    if (fR >= 0 && fR <= 7 && tR >= 0 && tR <= 7) {
      // Mouvement normal vertical
      if (Math.abs(tR - fR) > 4) {
        crossing = tR > fR ? 'bottom' : 'top';
      }
    } else {
      // Mouvement avec portail explicite
      if ((fR >= 0 && fR <= 7 && tR < 0) || (fR < 0 && tR >= 0 && tR <= 7)) {
        crossing = 'top';
      } else if ((fR >= 0 && fR <= 7 && tR > 7) || (fR > 7 && tR >= 0 && tR <= 7)) {
        crossing = 'bottom';
      }
    }
    
    return crossing;
  }

  /**
   * Surcharge : Vérifie les mouvements avec la logique de portail
   */
  checkBasicMove(board, from, to, piece, ignoreSafety = false) {
    const [fR, fC] = from;
    const [tR, tC] = to;
    const type = piece.toLowerCase();
    
    // Normalise la position de destination
    const [normR, normC] = this.normalizePosition(tR, tC);
    
    // Vérifie si la case de destination est valide sur l'échiquier normalisé
    if (normR < 0 || normR > 7 || normC < 0 || normC > 7) {
      return false;
    }
    
    const target = board[normR][normC];
    const rowDiff = Math.abs(normR - fR);
    const colDiff = Math.abs(normC - fC);
    
    // Logique spéciale pour les portails
    if (type === 'n') {
      // Les cavaliers peuvent faire des sauts "portail" plus longs
      const directMove = (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
      const portalMove = (rowDiff === 6 && colDiff === 1) || (rowDiff === 1 && colDiff === 6) ||
                        (rowDiff === 7 && colDiff === 2) || (rowDiff === 2 && colDiff === 7);
      return directMove || portalMove;
    }
    
    if (type === 'p') {
      const dir = Board.isWhitePiece(piece) ? -1 : 1;
      const pawnRow = Board.isWhitePiece(piece) ? fR : fR;
      
      // Mouvement normal
      if (fC === normC && !target) {
        if (normR === fR + dir) return true;
        if (pawnRow === (Board.isWhitePiece(piece) ? 6 : 1) && normR === fR + 2 * dir && !board[fR + dir][fC]) return true;
      }
      
      // Capture avec portail possible
      if (colDiff === 1 && normR === fR + dir && (target || this.canCaptureEnPassant(board, from, [normR, normC]))) {
        return true;
      }
      
      return false;
    }
    
    if (type === 'b') {
      // Les fous peuvent traverser les portails en diagonale
      if (rowDiff === colDiff) {
        // Vérifie si le chemin est clair en tenant compte des portails
        return this.isDiagonalPathClearWithPortals(board, from, [normR, normC]);
      }
      return false;
    }
    
    if (type === 'r') {
      // Les tours peuvent traverser les portails en ligne droite
      if (fR === normR || fC === normC) {
        return this.isStraightPathClearWithPortals(board, from, [normR, normC]);
      }
      return false;
    }
    
    if (type === 'q') {
      // Les reines combinent tour et fou avec portails
      if (fR === normR || fC === normC) {
        return this.isStraightPathClearWithPortals(board, from, [normR, normC]);
      }
      if (rowDiff === colDiff) {
        return this.isDiagonalPathClearWithPortals(board, from, [normR, normC]);
      }
      return false;
    }
    
    if (type === 'k') {
      // Les rois peuvent faire un mouvement de portail (max 1 case avec portail)
      const portalMove = (rowDiff === 7 && colDiff === 0) || (rowDiff === 0 && colDiff === 7) ||
                        (rowDiff === 7 && colDiff === 7) || (rowDiff === 7 && colDiff === 1) ||
                        (rowDiff === 1 && colDiff === 7);
      return (rowDiff <= 1 && colDiff <= 1) || portalMove;
    }
    
    return false;
  }

  /**
   * Vérifie si le chemin en diagonale est clair avec les portails
   */
  isDiagonalPathClearWithPortals(board, from, to) {
    const [fR, fC] = from;
    const [tR, tC] = to;
    const rowDir = tR > fR ? 1 : -1;
    const colDir = tC > fC ? 1 : -1;
    
    let currentR = fR + rowDir;
    let currentC = fC + colDir;
    
    while (currentR !== tR || currentC !== tC) {
      const [normR, normC] = this.normalizePosition(currentR, currentC);
      if (board[normR][normC] !== null) {
        return false;
      }
      currentR += rowDir;
      currentC += colDir;
    }
    
    return true;
  }

  /**
   * Vérifie si le chemin en ligne droite est clair avec les portails
   */
  isStraightPathClearWithPortals(board, from, to) {
    const [fR, fC] = from;
    const [tR, tC] = to;
    
    if (fR === tR) {
      // Mouvement horizontal
      const dir = tC > fC ? 1 : -1;
      let currentC = fC + dir;
      
      while (currentC !== tC) {
        const [normR, normC] = this.normalizePosition(fR, currentC);
        if (board[normR][normC] !== null) {
          return false;
        }
        currentC += dir;
      }
    } else if (fC === tC) {
      // Mouvement vertical
      const dir = tR > fR ? 1 : -1;
      let currentR = fR + dir;
      
      while (currentR !== tR) {
        const [normR, normC] = this.normalizePosition(currentR, fC);
        if (board[normR][normC] !== null) {
          return false;
        }
        currentR += dir;
      }
    }
    
    return true;
  }

  /**
   * Surcharge : Applique un mouvement avec les animations de portail
   */
  applyMove(board, from, to, piece) {
    const [fR, fC] = from;
    const [tR, tC] = to;
    
    // Normalise la destination
    const [normR, normC] = this.normalizePosition(tR, tC);
    const actualTo = [normR, normC];
    
    // Détecte le portail traversé
    const portalCrossing = this.getPortalCrossing(from, actualTo);
    
    // Utilise la logique de base mais avec les coordonnées normalisées
    const result = super.applyMove(board, from, actualTo, piece);
    
    // Ajoute l'animation de portail si nécessaire
    if (portalCrossing) {
      result.portalAnimation = {
        type: portalCrossing,
        from: from,
        to: actualTo,
        piece: piece
      };
      result.moveNotation += " 🌀";
    }
    
    return result;
  }

  /**
   * Surcharge : Obtient les coups valides avec la logique de portail
   */
  getValidMoves(board, fromRow, fromCol, currentPlayer) {
    const piece = board[fromRow][fromCol];
    const validMoves = [];
    
    if (!piece || Board.getPieceColor(piece) !== currentPlayer) return [];
    
    // Pour les portails, on doit vérifier plus de cases
    for (let r = -2; r <= 9; r++) {
      for (let c = -2; c <= 9; c++) {
        // Ignore la position actuelle
        if (r === fromRow && c === fromCol) continue;
        
        const [normR, normC] = this.normalizePosition(r, c);
        const target = board[normR][normC];
        
        // Vérifie si la cible n'est pas une pièce alliée
        if (target && Board.getPieceColor(target) === currentPlayer) continue;
        
        // Vérifie si le mouvement est valide
        if (this.checkBasicMove(board, [fromRow, fromCol], [r, c], piece)) {
          // Vérifie si le mouvement est sûr
          if (this.isMoveSafe(board, [fromRow, fromCol], [r, c], piece)) {
            validMoves.push([normR, normC]);
          }
        }
      }
    }
    
    // Élimine les doublons (plusieurs chemins de portail peuvent mener à la même case)
    const uniqueMoves = [];
    const seen = new Set();
    
    for (const move of validMoves) {
      const key = `${move[0]},${move[1]}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueMoves.push(move);
      }
    }
    
    return uniqueMoves;
  }
}