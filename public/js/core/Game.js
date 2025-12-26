import { Board } from './Board.js';
import { Timer } from './Timer.js';

/**
 * Gère une partie d'échecs avec une variante donnée
 */
export class Game {
  constructor(variant, mode = 'local', timeControl = 600) {
    this.variant = variant;
    this.mode = mode; // 'local', 'online', 'menu'
    this.board = variant.getInitialBoard();
    this.currentPlayer = 'white';
    this.selectedSquare = null;
    this.explosions = [];
    this.gameOver = null;
    this.moveHistory = [];
    this.reviewIndex = -1; // -1 means live game, >= 0 means reviewing history
    this.playerColor = null; // Pour le mode online
    this.opponentConnected = false;

    // Timer
    this.timer = new Timer(timeControl, timeControl);
    this.timer.onTick = (whiteTime, blackTime) => {
      if (this.onTimerUpdate) {
        this.onTimerUpdate(whiteTime, blackTime);
      }
    };
    this.timer.onTimeout = (winner) => {
      this.gameOver = winner;
      if (this.onGameOver) {
        this.onGameOver(winner, 'timeout');
      }
    };

    // Callbacks
    this.onMove = null;
    this.onGameOver = null;
    this.onStateChange = null;
    this.onTimerUpdate = null;
  }

  /**
   * Démarre le timer en fonction du mode de jeu
   */
  startTimer() {
    this.timer.start();

    // Logique pour mettre en pause le timer selon les conditions
    const updateTimerState = () => {
      const isGameStarted = this.moveHistory.length > 0;
      const canRun = !this.gameOver &&
        (this.mode === 'local' ||
          this.mode === 'ai' ||
          (this.mode === 'online' && this.opponentConnected && isGameStarted));

      if (canRun && !this.timer.isRunning) {
        this.timer.resume();
      } else if (!canRun && this.timer.isRunning) {
        this.timer.pause();
      }
    };

    // Mettre à jour l'état du timer périodiquement
    this.timerUpdateInterval = setInterval(() => {
      updateTimerState();
      // Passer le joueur actuel au tick
      this.timer.tick = (elapsed) => {
        if (this.currentPlayer === 'white') {
          this.timer.whiteTime = Math.max(0, this.timer.whiteTime - elapsed);
          if (this.timer.whiteTime === 0) return 'black';
        } else {
          this.timer.blackTime = Math.max(0, this.timer.blackTime - elapsed);
          if (this.timer.blackTime === 0) return 'white';
        }
        return null;
      };
    }, 100);

    updateTimerState();
  }

  /**
   * Clique sur une case de l'échiquier
   */
  handleSquareClick(row, col) {
    if (this.gameOver) return false;
    if (this.mode === 'online' && (this.currentPlayer !== this.playerColor || !this.opponentConnected)) {
      return false;
    }
    if (this.mode === 'ai' && this.currentPlayer !== this.playerColor) {
      return false;
    }

    const targetPiece = this.board[row][col];

    if (this.selectedSquare) {
      const [fR, fC] = this.selectedSquare;
      const movingPiece = this.board[fR][fC];

      // Si on clique sur une pièce de sa couleur, on change la sélection
      if (targetPiece && Board.getPieceColor(targetPiece) === this.currentPlayer) {
        this.selectedSquare = (row === fR && col === fC) ? null : [row, col];
        if (this.onStateChange) this.onStateChange();
        return false;
      }

      // Vérifie si le mouvement est valide
      const validMoves = this.variant.getValidMoves(this.board, fR, fC, this.currentPlayer);
      const isValid = validMoves.some(m => m[0] === row && m[1] === col);

      if (isValid) {
        return this.executeMove(this.selectedSquare, [row, col]);
      } else {
        // Mouvement invalide
        this.selectedSquare = null;
        if (this.onStateChange) this.onStateChange();
        return 'invalid';
      }
    } else if (targetPiece && Board.getPieceColor(targetPiece) === this.currentPlayer) {
      // Sélection d'une pièce
      this.selectedSquare = [row, col];
      if (this.onStateChange) this.onStateChange();
      return false;
    }

    return false;
  }

  /**
   * Exécute un mouvement
   */
  executeMove(from, to) {
    const [fR, fC] = from;
    const piece = this.board[fR][fC];

    if (!piece) {
      console.error(`Erreur: Pas de pièce à la case ${from}`);
      return;
    }

    // Applique le mouvement via la variante
    const result = this.variant.applyMove(this.board, from, to, piece);

    this.board = result.board;
    this.explosions = result.explosionSquares;
    this.moveHistory.push({
      from,
      to,
      notation: result.moveNotation,
      board: Board.clone(this.board)
    });
    this.reviewIndex = -1;
    this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
    this.selectedSquare = null;
    this.timer.lastTimerUpdate = Date.now();

    // Vérifie la fin de partie
    const gameOverState = this.variant.checkGameOver(this.board, this.currentPlayer);
    if (gameOverState) {
      this.gameOver = gameOverState;
      this.timer.stop();
      if (this.onGameOver) {
        // Détermine la raison de la fin de partie
        let reason = 'checkmate';
        if (this.variant.isKingOnHill && this.variant.isKingOnHill(this.board, gameOverState)) {
          reason = 'hill';
        } else if (gameOverState === 'draw') {
          reason = 'stalemate';
        }
        this.onGameOver(gameOverState, reason);
      }
    }

    // Callback pour animation d'explosion
    if (this.explosions.length > 0) {
      setTimeout(() => {
        this.explosions = [];
        if (this.onStateChange) this.onStateChange();
      }, 600);
    }

    // Callback après le mouvement
    if (this.onMove) {
      this.onMove({
        board: Board.flatten(this.board),
        currentPlayer: this.currentPlayer,
        moveHistory: this.moveHistory,
        variantState: this.variant.getState(),
        whiteTime: this.timer.whiteTime,
        blackTime: this.timer.blackTime,
        gameOver: this.gameOver
      });
    }

    if (this.onStateChange) this.onStateChange();

    return true;
  }

  /**
   * Obtient les mouvements valides pour la case sélectionnée
   */
  getValidMovesForSelected() {
    if (!this.selectedSquare) return [];
    return this.variant.getValidMoves(
      this.board,
      this.selectedSquare[0],
      this.selectedSquare[1],
      this.currentPlayer
    );
  }

  /**
   * Synchronise l'état depuis une source externe (Firebase)
   */
  syncState(state) {
    this.board = Board.unflatten(state.board);
    this.currentPlayer = state.currentPlayer;
    this.moveHistory = state.moveHistory || [];
    this.variant.setState(state.variantState || {
      kingMoved: state.kingMoved,
      rookMoved: state.rookMoved,
      lastMove: state.lastMove
    });

    if (state.whiteTime !== undefined) this.timer.whiteTime = state.whiteTime;
    if (state.blackTime !== undefined) this.timer.blackTime = state.blackTime;
    if (state.lastTimerUpdate) this.timer.lastTimerUpdate = state.lastTimerUpdate;
    if (state.gameOver) {
      this.gameOver = state.gameOver;
      this.timer.stop();
    }

    if (this.onStateChange) this.onStateChange();
  }

  /**
   * Définit la connexion de l'adversaire
   */
  setOpponentConnected(connected) {
    this.opponentConnected = connected;
    if (this.onStateChange) this.onStateChange();
  }

  /**
   * Réinitialise la partie
   */
  reset() {
    this.board = this.variant.getInitialBoard();
    this.variant.reset();
    this.currentPlayer = 'white';
    this.selectedSquare = null;
    this.explosions = [];
    this.gameOver = null;
    this.moveHistory = [];
    this.timer.reset(600, 600);
    this.reviewIndex = -1;
    if (this.onStateChange) this.onStateChange();
  }

  /**
   * Navigue dans l'historique (mode analyse)
   */
  setReviewIndex(index) {
    if (!this.gameOver || index < -1 || index >= this.moveHistory.length) return;
    this.reviewIndex = index;
    if (this.onStateChange) this.onStateChange();
  }

  /**
   * Récupère le plateau actuel (live ou historique)
   */
  getDisplayBoard() {
    if (this.reviewIndex === -1) return this.board;
    return this.moveHistory[this.reviewIndex].board;
  }

  /**
   * Nettoie les ressources
   */
  destroy() {
    this.timer.stop();
    if (this.timerUpdateInterval) {
      clearInterval(this.timerUpdateInterval);
    }
  }
}
