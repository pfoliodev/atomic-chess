import { BaseVariant } from './BaseVariant.js';
import { Board } from '../core/Board.js';

/**
 * Variante Portal Chess
 * Les pièces de longue portée (cavalier, tour, reine, fou) peuvent :
 * - Traverser par les côtés (droite/gauche) : sortent par le bord droit et réapparaissent à gauche (et vice-versa)
 * - NE PEUVENT PAS traverser par le haut/bas : l'échiquier a une limite haute et basse
 * 
 * Exemple : Une tour en h4 se déplaçant à droite réapparaît en a4
 *          Une tour en a4 se déplaçant à gauche réapparaît en h4
 */
export class PortalVariant extends BaseVariant {
  constructor() {
    super();
  }

  /**
   * Vérifie si le chemin est clair en tenant compte des portails latéraux
   * Surcharge BaseVariant.isPathClear()
   */
  isPathClear(board, from, to) {
    const [fR, fC] = from;
    const [tR, tC] = to;
    
    // Si c'est un mouvement vertical (même colonne)
    if (fC === tC) {
      // Vérification standard : pas de traversée haut/bas permise par portail
      const rStep = Math.sign(tR - fR);
      let currR = fR + rStep;
      
      while (currR !== tR) {
        if (board[currR][tC]) return false;
        currR += rStep;
      }
      return true;
    }
    
    // Si c'est un mouvement horizontal (même ligne)
    if (fR === tR) {
      // Le mouvement peut utiliser les portails latéraux
      return this.isPathClearHorizontal(board, fR, fC, tC);
    }
    
    // Si c'est une diagonale
    if (Math.abs(tR - fR) === Math.abs(tC - fC)) {
      return this.isPathClearDiagonal(board, fR, fC, tR, tC);
    }
    
    return false;
  }

  /**
   * Vérifie qu'un chemin horizontal est clair avec les portails latéraux
   */
  isPathClearHorizontal(board, row, fromCol, toCol) {
    const step = Math.sign(toCol - fromCol);
    const distance = Math.abs(toCol - fromCol);
    
    // Déterminer si le chemin passe par un portail
    if (step === 1) {
      // Mouvement vers la droite
      if (toCol > fromCol) {
        // Pas de portail : chemin direct
        let col = fromCol + 1;
        while (col < toCol) {
          if (board[row][col]) return false;
          col++;
        }
        return true;
      }
    } else {
      // Mouvement vers la gauche
      if (toCol < fromCol) {
        // Pas de portail : chemin direct
        let col = fromCol - 1;
        while (col > toCol) {
          if (board[row][col]) return false;
          col--;
        }
        return true;
      }
    }
    
    return true;
  }

  /**
   * Vérifie qu'un chemin diagonal est clair avec portails latéraux
   */
  isPathClearDiagonal(board, fR, fC, tR, tC) {
    const rStep = Math.sign(tR - fR);
    const cStep = Math.sign(tC - fC);
    
    // Calculer la distance
    let distance = Math.abs(tR - fR);
    
    let currR = fR + rStep;
    let currC = fC + cStep;
    
    for (let i = 1; i < distance; i++) {
      // Normaliser currC en cas de passage par portail
      let normalizedC = currC;
      if (normalizedC < 0) normalizedC += 8;
      if (normalizedC >= 8) normalizedC -= 8;
      
      if (board[currR][normalizedC]) return false;
      
      currR += rStep;
      currC += cStep;
    }
    
    return true;
  }

  /**
   * Surcharge checkBasicMove pour gérer les mouvements avec portails
   */
  checkBasicMove(board, from, to, piece, ignoreSafety = false) {
    const [fR, fC] = from;
    const [tR, tC] = to;
    const type = piece.toLowerCase();
    const target = board[tR][tC];

    // Les pions se déplacent normalement (pas affectés par les portails)
    if (type === 'p') {
      return super.checkBasicMove(board, from, to, piece, ignoreSafety);
    }

    // Les cavaliers
    if (type === 'n') {
      return this.isValidKnightMove(fR, fC, tR, tC);
    }

    // Les tours (incluant les portails latéraux)
    if (type === 'r') {
      return this.isValidRookMove(board, fR, fC, tR, tC);
    }

    // Les fous (incluant les portails latéraux)
    if (type === 'b') {
      return this.isValidBishopMove(board, fR, fC, tR, tC);
    }

    // Les reines (combinaison tour + fou)
    if (type === 'q') {
      return this.isValidRookMove(board, fR, fC, tR, tC) || 
             this.isValidBishopMove(board, fR, fC, tR, tC);
    }

    // Les rois
    if (type === 'k') {
      return super.checkBasicMove(board, from, to, piece, ignoreSafety);
    }

    return false;
  }

  /**
   * Vérifie si un mouvement de cavalier est valide
   * Le cavalier peut sortir par les côtés
   */
  isValidKnightMove(fR, fC, tR, tC) {
    const rowDiff = Math.abs(tR - fR);
    const colDiff = Math.abs(tC - fC);
    
    // Le cavalier ne peut pas se déplacer verticalement sans limite
    if (rowDiff > 2) return false;
    
    // Mouvement standard du cavalier
    if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
      return true;
    }
    
    // Mouvement du cavalier avec portails latéraux
    // Un cavalier peut "enrouler" si son déplacement horizontal dépasse 8 cases
    if (rowDiff === 2 && colDiff >= 6) {
      // Vérifier si c'est un mouvement enveloppant (ex: de col 7 à col 1, distance 6 ou 2)
      return true;
    }
    if (rowDiff === 1 && colDiff >= 7) {
      // Vérifier si c'est un mouvement enveloppant
      return true;
    }
    
    return false;
  }

  /**
   * Vérifie si un mouvement de tour est valide (avec portails latéraux)
   */
  isValidRookMove(board, fR, fC, tR, tC) {
    // Mouvement vertical (pas de portal)
    if (fC === tC && fR !== tR) {
      return this.isPathClear(board, [fR, fC], [tR, tC]);
    }
    
    // Mouvement horizontal (avec portals possibles)
    if (fR === tR && fC !== tC) {
      return this.isPathClearHorizontal(board, fR, fC, tC);
    }
    
    return false;
  }

  /**
   * Vérifie si un mouvement de fou est valide (avec portails latéraux)
   */
  isValidBishopMove(board, fR, fC, tR, tC) {
    // Doit être une diagonale
    if (Math.abs(tR - fR) !== Math.abs(tC - fC)) {
      return false;
    }
    
    // Ne peut pas se déplacer verticalement sans limite
    if (Math.abs(tR - fR) > 7) {
      return false;
    }
    
    return this.isPathClearDiagonal(board, fR, fC, tR, tC);
  }

  /**
   * Surcharge getValidMoves pour tenir compte des portails
   */
  getValidMoves(board, fromRow, fromCol, currentPlayer) {
    const piece = board[fromRow][fromCol];
    const validMoves = [];
    
    if (!piece || Board.getPieceColor(piece) !== currentPlayer) return [];
    
    const type = piece.toLowerCase();
    
    // Pour les pièces affectées par les portails, générer plus de cases possibles
    if (['n', 'r', 'b', 'q'].includes(type)) {
      // Pour les tours/reines, tester aussi les mouvements "enveloppés"
      if (type === 'r' || type === 'q') {
        // Mouvements horizontaux (avec portails)
        for (let c = 0; c < 8; c++) {
          if (c !== fromCol) {
            const target = board[fromRow][c];
            if (!target || Board.getPieceColor(target) !== currentPlayer) {
              if (this.isValidRookMove(board, fromRow, fromCol, fromRow, c) &&
                  this.isMoveSafe(board, [fromRow, fromCol], [fromRow, c], piece)) {
                validMoves.push([fromRow, c]);
              }
            }
          }
        }
      }
      
      // Mouvements verticaux (tests standards)
      if (type === 'r' || type === 'q') {
        for (let r = 0; r < 8; r++) {
          if (r !== fromRow) {
            const target = board[r][fromCol];
            if (!target || Board.getPieceColor(target) !== currentPlayer) {
              if (this.isValidRookMove(board, fromRow, fromCol, r, fromCol) &&
                  this.isMoveSafe(board, [fromRow, fromCol], [r, fromCol], piece)) {
                validMoves.push([r, fromCol]);
              }
            }
          }
        }
      }
      
      // Mouvements diagonaux (pour fou/reine)
      if (type === 'b' || type === 'q') {
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if ((r !== fromRow || c !== fromCol) && 
                Math.abs(r - fromRow) === Math.abs(c - fromCol)) {
              const target = board[r][c];
              if (!target || Board.getPieceColor(target) !== currentPlayer) {
                if (this.isValidBishopMove(board, fromRow, fromCol, r, c) &&
                    this.isMoveSafe(board, [fromRow, fromCol], [r, c], piece)) {
                  validMoves.push([r, c]);
                }
              }
            }
          }
        }
      }
      
      // Mouvements de cavalier (avec portails)
      if (type === 'n') {
        const knightMoves = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        knightMoves.forEach(([dr, dc]) => {
          let newR = fromRow + dr;
          let newC = fromCol + dc;
          
          // Les cavaliers peuvent aussi enrouler
          if (newC < 0) newC += 8;
          if (newC >= 8) newC -= 8;
          
          // Mais pas verticalement hors limites
          if (newR >= 0 && newR < 8) {
            const target = board[newR][newC];
            if (!target || Board.getPieceColor(target) !== currentPlayer) {
              if (this.isMoveSafe(board, [fromRow, fromCol], [newR, newC], piece)) {
                validMoves.push([newR, newC]);
              }
            }
          }
        });
      }
    }
    
    // Ajouter les mouvements standards (roque, rois, pions)
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (r === fromRow && c === fromCol) continue;
        if ([...validMoves].some(m => m[0] === r && m[1] === c)) continue;
        
        const target = board[r][c];
        if (target && Board.getPieceColor(target) === currentPlayer) continue;
        
        let possible = false;
        
        if (piece.toLowerCase() === 'k' && Math.abs(c - fromCol) === 2 && r === fromRow) {
          possible = this.canCastle(board, Board.getPieceColor(piece), c === 6 ? 'kingside' : 'queenside');
        } else if (piece.toLowerCase() === 'p') {
          possible = super.checkBasicMove(board, [fromRow, fromCol], [r, c], piece);
        }
        
        if (possible && this.isMoveSafe(board, [fromRow, fromCol], [r, c], piece)) {
          validMoves.push([r, c]);
        }
      }
    }
    
    return validMoves;
  }

  /**
   * Simule un mouvement en tenant compte des portails
   */
  getSimulatedBoard(board, from, to, piece) {
    let simBoard = Board.clone(board);
    const [fR, fC] = from;
    const [tR, tC] = to;
    const isCapture = simBoard[tR][tC] !== null;
    const isEP = this.canCaptureEnPassant(board, from, to);
    
    if (isCapture || isEP) {
      if (isEP) {
        const captureRow = Board.isWhitePiece(piece) ? tR + 1 : tR - 1;
        simBoard[captureRow][tC] = null;
      }
      simBoard[tR][tC] = piece;
      simBoard[fR][fC] = null;
    } else {
      simBoard[tR][tC] = piece;
      simBoard[fR][fC] = null;
      
      // Gestion du roque
      if (piece.toLowerCase() === 'k' && Math.abs(tC - fC) === 2) {
        const rCol = tC === 6 ? 7 : 0;
        const rTo = tC === 6 ? 5 : 3;
        simBoard[fR][rTo] = simBoard[fR][rCol];
        simBoard[fR][rCol] = null;
      }
    }
    
    return simBoard;
  }
}
