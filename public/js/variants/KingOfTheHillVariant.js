import { BaseVariant } from './BaseVariant.js';
import { Board } from '../core/Board.js';

/**
 * Variante King of the Hill (Roi de la Colline)
 * Le roi qui atteint l'une des 4 cases centrales (e4, d4, e5, d5) gagne instantanément
 */
export class KingOfTheHillVariant extends BaseVariant {
  constructor() {
    super();
    // Cases centrales qui font gagner : d4(3,3), e4(3,4), d5(4,3), e5(4,4)
    this.hillSquares = [
      [3, 3], // d4
      [3, 4], // e4
      [4, 3], // d5
      [4, 4]  // e5
    ];
  }

  /**
   * Vérifie si un roi est sur la colline (cases centrales)
   */
  isKingOnHill(board, color) {
    const kingPos = Board.findKing(board, color);
    if (!kingPos) return false;
    
    return this.hillSquares.some(([row, col]) => 
      kingPos[0] === row && kingPos[1] === col
    );
  }

  /**
   * Surcharge : Vérifie si la partie est terminée avec la règle du roi de la colline
   */
  checkGameOver(board) {
    // Vérifie d'abord si un roi est sur la colline
    if (this.isKingOnHill(board, 'white')) return 'white';
    if (this.isKingOnHill(board, 'black')) return 'black';
    
    // Sinon, vérifie l'échec et mat
    return this.checkCheckmate(board);
  }

  /**
   * Vérifie l'échec et mat
   */
  checkCheckmate(board) {
    const wK = Board.findKing(board, 'white');
    const bK = Board.findKing(board, 'black');
    
    if (!wK && !bK) return 'draw';
    if (!wK) return 'black';
    if (!bK) return 'white';
    
    // Vérifie si le roi blanc est en échec et mat
    if (this.isKingInCheck(board, 'white')) {
      if (!this.hasAnyLegalMove(board, 'white')) {
        return 'black';
      }
    }
    
    // Vérifie si le roi noir est en échec et mat
    if (this.isKingInCheck(board, 'black')) {
      if (!this.hasAnyLegalMove(board, 'black')) {
        return 'white';
      }
    }
    
    // Vérifie le pat (pas d'échec mais aucun coup légal)
    if (!this.isKingInCheck(board, 'white') && !this.hasAnyLegalMove(board, 'white')) {
      return 'draw';
    }
    if (!this.isKingInCheck(board, 'black') && !this.hasAnyLegalMove(board, 'black')) {
      return 'draw';
    }
    
    return null;
  }

  /**
   * Vérifie si un roi est en échec
   */
  isKingInCheck(board, color) {
    const kingPos = Board.findKing(board, color);
    if (!kingPos) return false;
    
    return this.isSquareAttacked(board, kingPos[0], kingPos[1], color);
  }

  /**
   * Vérifie si une couleur a au moins un coup légal
   */
  hasAnyLegalMove(board, color) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && Board.getPieceColor(piece) === color) {
          const validMoves = this.getValidMoves(board, r, c, color);
          if (validMoves.length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Surcharge : Applique un mouvement et vérifie la victoire par colline
   */
  applyMove(board, from, to, piece) {
    const result = super.applyMove(board, from, to, piece);
    
    // Vérifie si ce mouvement place un roi sur la colline
    if (this.isKingOnHill(result.board, 'white')) {
      result.moveNotation += " 🏔️";
      result.gameOver = 'white';
    } else if (this.isKingOnHill(result.board, 'black')) {
      result.moveNotation += " 🏔️";
      result.gameOver = 'black';
    }
    
    return result;
  }

  /**
   * Retourne les cases de la colline pour l'affichage visuel
   */
  getHillSquares() {
    return this.hillSquares;
  }
}