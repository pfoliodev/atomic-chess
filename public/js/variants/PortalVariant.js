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
    
    // Vérifie si la destination est en dehors de l'échiquier (implique un portail)
    if (tR < 0 || tR > 7 || tC < 0 || tC > 7) {
      // Détermine la direction du portail
      if (tC < 0) return 'left';
      if (tC > 7) return 'right';
      if (tR < 0) return 'top';
      if (tR > 7) return 'bottom';
    }
    
    // Vérifie les mouvements longs qui pourraient être des portails
    const colDiff = Math.abs(tC - fC);
    const rowDiff = Math.abs(tR - fR);
    
    // Mouvements très longs sont probablement des portails
    if (colDiff > 4) {
      return tC > fC ? 'right' : 'left';
    }
    if (rowDiff > 4) {
      return tR > fR ? 'bottom' : 'top';
    }
    
    return null;
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
    
    // Pour Portal Chess, TOUTES les pièces peuvent utiliser les portails
    // On simplifie la logique en autorisant les mouvements qui suivent les règles de base
    // mais en tenant compte des portails
    
    // Pour les pièces à mouvement continu (fou, tour, reine)
    if (type === 'b' || type === 'r' || type === 'q') {
      // Vérifie si c'est un mouvement dans la bonne direction
      const isValidDirection = 
        (type === 'b' && (rowDiff === colDiff || rowDiff === 0 || colDiff === 0)) || // Fou peut aller en diagonal + portail
        (type === 'r' && (fR === normR || fC === normC)) || // Tour doit rester en ligne
        (type === 'q' && (fR === normR || fC === normC || rowDiff === colDiff)); // Reine = tour + fou
      
      if (!isValidDirection) return false;
      
      // Vérifie si le chemin est clair
      if (type === 'b' || (type === 'q' && rowDiff === colDiff)) {
        return this.isDiagonalPathClearWithPortals(board, from, [normR, normC]);
      }
      if (type === 'r' || (type === 'q' && (fR === normR || fC === normC))) {
        return this.isStraightPathClearWithPortals(board, from, [normR, normC]);
      }
    }
    
    // Pour les pièces à mouvement discret
    if (type === 'n') {
      // Cavaliers peuvent utiliser les portails pour des sauts plus longs
      const baseMove = (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
      const portalMove = (rowDiff === 6 && colDiff === 1) || (rowDiff === 1 && colDiff === 6) ||
                        (rowDiff === 7 && colDiff === 2) || (rowDiff === 2 && colDiff === 7);
      return baseMove || portalMove;
    }
    
    if (type === 'k') {
      // Rois peuvent faire un mouvement de portail
      const baseMove = (rowDiff <= 1 && colDiff <= 1);
      const portalMove = (rowDiff === 7 && colDiff === 0) || (rowDiff === 0 && colDiff === 7) ||
                        (rowDiff === 7 && colDiff === 7) || (rowDiff === 7 && colDiff === 1) ||
                        (rowDiff === 1 && colDiff === 7);
      return baseMove || portalMove;
    }
    
    if (type === 'p') {
      const dir = Board.isWhitePiece(piece) ? -1 : 1;
      
      // Mouvement vers l'avant (avec portail possible)
      if (fC === normC && !target) {
        if (normR === fR + dir) return true;
        // Premier mouvement de 2 cases
        const startRow = Board.isWhitePiece(piece) ? 6 : 1;
        if (fR === startRow && normR === fR + 2 * dir) {
          // Vérifie si les cases intermédiaires sont libres
          const midR = this.normalizePosition(fR + dir, fC)[0];
          if (!board[midR][fC]) return true;
        }
      }
      
      // Capture en diagonale (avec portail)
      if (colDiff === 1 && normR === fR + dir && (target || this.canCaptureEnPassant(board, from, [normR, normC]))) {
        return true;
      }
      
      return false;
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
    
    // Limite pour éviter les boucles infinies
    let maxSteps = 15; // Maximum 8 cases normales + 7 cases de portail
    let steps = 0;
    
    while ((currentR !== tR || currentC !== tC) && steps < maxSteps) {
      const [normR, normC] = this.normalizePosition(currentR, currentC);
      
      // Vérifie si on atteint la destination normalisée
      if (normR === tR && normC === tC) {
        return true;
      }
      
      if (board[normR][normC] !== null) {
        return false;
      }
      currentR += rowDir;
      currentC += colDir;
      steps++;
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
    
    // Pour Portal Chess, on vérifie TOUTES les cases possibles y compris celles en dehors
    // car une pièce peut aller n'importe où et utiliser les portails
    for (let r = -8; r <= 15; r++) {
      for (let c = -8; c <= 15; c++) {
        // Ignore la position actuelle
        if (r === fromRow && c === fromCol) continue;
        
        // Normalise la destination pour voir où elle atterrit sur l'échiquier
        const [normR, normC] = this.normalizePosition(r, c);
        
        // Vérifie si la destination normalisée est dans l'échiquier
        if (normR < 0 || normR >= 8 || normC < 0 || normC >= 8) continue;
        
        const target = board[normR][normC];
        
        // Vérifie si la cible n'est pas une pièce alliée
        if (target && Board.getPieceColor(target) === currentPlayer) continue;
        
        // Vérifie si le mouvement est valide (avec portails)
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