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
   * Convertit une notation algébrique en coordonnées [row, col]
   */
  static fromAlgebraic(square) {
    const col = square.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = 8 - parseInt(square[1]);
    return [row, col];
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

  /**
   * Génère une chaîne FEN pour le plateau actuel
   */
  static toFEN(board, turn, variant, fullMove = 1) {
    let fen = '';

    // 1. Position des pièces
    for (let r = 0; r < 8; r++) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          if (empty > 0) {
            fen += empty;
            empty = 0;
          }
          fen += piece;
        } else {
          empty++;
        }
      }
      if (empty > 0) fen += empty;
      if (r < 7) fen += '/';
    }

    // 2. Trait
    fen += ` ${turn[0]}`;

    // 3. Flags (Roque et EP)
    const flags = variant.getFENFlags();
    fen += ` ${flags.castling} ${flags.enPassant}`;

    // 4. Halfmove et Fullmove
    // Halfmove (50 moves rule) on simplifie à 0 pour l'instant
    fen += ` 0 ${fullMove}`;

    return fen;
  }

  /**
   * Retourne la liste des pièces éliminées pour chaque camp
   */
  static getEliminatedPieces(board) {
    const initialCounts = {
      'P': 8, 'N': 2, 'B': 2, 'R': 2, 'Q': 1, 'K': 1,
      'p': 8, 'n': 2, 'b': 2, 'r': 2, 'q': 1, 'k': 1
    };

    const currentCounts = {};
    board.flat().forEach(piece => {
      if (piece) {
        currentCounts[piece] = (currentCounts[piece] || 0) + 1;
      }
    });

    const eliminated = { white: [], black: [] };
    for (const [piece, count] of Object.entries(initialCounts)) {
      const missing = count - (currentCounts[piece] || 0);
      if (missing > 0) {
        for (let i = 0; i < missing; i++) {
          if (Board.isWhitePiece(piece)) eliminated.white.push(piece);
          else eliminated.black.push(piece);
        }
      }
    }

    // Tri pour un affichage plus propre (Pions, Cavaliers, Fous, Tours, Dames)
    const order = { 'P': 1, 'N': 2, 'B': 3, 'R': 4, 'Q': 5, 'K': 6, 'p': 1, 'n': 2, 'b': 3, 'r': 4, 'q': 5, 'k': 6 };
    eliminated.white.sort((a, b) => order[a] - order[b]);
    eliminated.black.sort((a, b) => order[a] - order[b]);

    return eliminated;
  }
}
