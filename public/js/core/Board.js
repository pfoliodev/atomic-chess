/**
 * Classe représentant l'échiquier et les utilitaires de base
 */
export class Board {
  static pieceSymbols = {
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
    'K': '♔\uFE0E', 'Q': '♕\uFE0E', 'R': '♖\uFE0E', 'B': '♗\uFE0E', 'N': '♘\uFE0E', 'P': '♙\uFE0E'
  };

  /**
   * Vérifie si une pièce est blanche
   */
  static isWhitePiece(piece) {
    return piece && piece === piece.toUpperCase();
  }

  /**
   * Retourne la couleur d'une pièce
   */
  static getPieceColor(piece) {
    return Board.isWhitePiece(piece) ? 'white' : 'black';
  }

  /**
   * Convertit des coordonnées en notation algébrique
   */
  static toAlgebraic(row, col) {
    return ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][col] + (8 - row);
  }

  /**
   * Trouve la position du roi d'une couleur donnée
   */
  static findKing(board, color) {
    const target = color === 'white' ? 'K' : 'k';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] === target) return [r, c];
      }
    }
    return null;
  }

  /**
   * Vérifie si le chemin entre deux cases est libre
   */
  static isPathClear(board, from, to) {
    const [fR, fC] = from;
    const [tR, tC] = to;
    const rStep = Math.sign(tR - fR);
    const cStep = Math.sign(tC - fC);
    let currR = fR + rStep;
    let currC = fC + cStep;
    
    while (currR !== tR || currC !== tC) {
      if (board[currR][currC]) return false;
      currR += rStep;
      currC += cStep;
    }
    return true;
  }

  /**
   * Copie profonde d'un échiquier
   */
  static clone(board) {
    return board.map(row => [...row]);
  }

  /**
   * Crée un échiquier vide
   */
  static createEmpty() {
    return Array(8).fill(null).map(() => Array(8).fill(null));
  }

  /**
   * Aplatit un échiquier 2D en array 1D (pour Firebase)
   */
  static flatten(board) {
    return board.flat();
  }

  /**
   * Reconstitue un échiquier 2D depuis un array 1D
   */
  static unflatten(flatBoard) {
    const board = [];
    for (let i = 0; i < 8; i++) {
      board.push(flatBoard.slice(i * 8, (i + 1) * 8));
    }
    return board;
  }
}
