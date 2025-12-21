import { AtomicVariant } from './variants/AtomicVariant.js';
import { PortalVariant } from './variants/PortalVariant.js';
import { Game } from './core/Game.js';
import { Board } from './core/Board.js';
import { Renderer } from './ui/Renderer.js';
import { MenuUI } from './ui/MenuUI.js';
import { FirebaseSync } from './network/FirebaseSync.js';

/**
 * Application principale
 */
class App {
  constructor() {
    this.game = null;
    this.renderer = new Renderer('app');
    this.menuUI = new MenuUI('app');
    this.firebaseSync = null;
    this.currentMode = 'menu';
    this.gameCode = null;
    
    this.init();
  }

  /**
   * Initialise l'application
   */
  async init() {
    // Initialise Firebase
    await this.initFirebase();
    
    // Affiche le menu
    this.showMenu();
  }

  /**
   * Initialise Firebase
   */
  async initFirebase() {
    try {
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
      const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

      const firebaseConfig = {
        apiKey: "AIzaSyCJc2nvexdOTAnwyGydexLYzdF0CmdTbg8",
        authDomain: "atomic-chess-221b3.firebaseapp.com",
        projectId: "atomic-chess-221b3",
        storageBucket: "atomic-chess-221b3.firebasestorage.app",
        messagingSenderId: "1005991526828",
        appId: "1:1005991526828:web:4b3f6e158ac94ecd443a09"
      };

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
      const auth = getAuth(app);

      this.firebaseSync = new FirebaseSync(db, auth);
      await this.firebaseSync.initialize();
    } catch (error) {
      console.error('Erreur Firebase:', error);
    }
  }

  /**
   * Affiche le menu
   */
  showMenu() {
    this.currentMode = 'menu';
    this.menuUI.render();
    
// Configure les callbacks du menu
    this.menuUI.onStartLocal = (timeControl, variant) => this.startLocalGame(timeControl, variant);
    this.menuUI.onCreateOnline = (timeControl, variant) => this.createOnlineGame(timeControl, variant);
    this.menuUI.onJoinOnline = (code) => this.joinOnlineGame(code);
  }

/**
   * Crée une variante selon le choix
   */
  createVariant(variantName) {
    switch (variantName) {
      case 'portal':
        return new PortalVariant();
      case 'atomic':
      default:
        return new AtomicVariant();
    }
  }

  /**
   * Démarre une partie locale
   */
  startLocalGame(timeControl, variantName) {
    const variant = this.createVariant(variantName);
    this.game = new Game(variant, 'local', timeControl);
    this.currentMode = 'local';
    this.gameCode = null;
    
    this.setupGameCallbacks();
    this.game.startTimer();
    this.renderer.renderGame(this.game);
  }

/**
   * Crée une partie en ligne
   */
  async createOnlineGame(timeControl, variantName) {
    try {
      const variant = this.createVariant(variantName);
      this.game = new Game(variant, 'online', timeControl);
      
      const initialState = {
        board: Board.flatten(this.game.board),
        variantState: variant.getState()
      };
      
      const result = await this.firebaseSync.createGame(initialState, timeControl);
      this.gameCode = result.code;
      this.game.playerColor = result.playerColor;
      this.currentMode = 'online';
      
      this.setupGameCallbacks();
      this.setupOnlineSync();
      this.game.startTimer();
      this.renderer.renderGame(this.game, this.gameCode);
    } catch (error) {
      console.error('Erreur création partie:', error);
      alert('Erreur lors de la création de la partie');
    }
  }

/**
   * Rejoint une partie en ligne
   */
  async joinOnlineGame(code) {
    try {
      // Pour le moment, on suppose que c'est toujours Atomic
      // TODO: Récupérer le type de variante depuis Firebase
      const variant = new AtomicVariant();
      this.game = new Game(variant, 'online', 600);
      
      const result = await this.firebaseSync.joinGame(code);
      this.gameCode = result.code;
      this.game.playerColor = result.playerColor;
      this.game.syncState(result.state);
      this.currentMode = 'online';
      
      this.setupGameCallbacks();
      this.setupOnlineSync();
      this.game.startTimer();
      this.renderer.renderGame(this.game, this.gameCode);
    } catch (error) {
      console.error('Erreur rejoindre partie:', error);
      alert('Code invalide ou partie déjà complète');
    }
  }

  /**
   * Configure les callbacks du jeu
   */
  setupGameCallbacks() {
    // Callback quand l'état change
    this.game.onStateChange = () => {
      this.renderer.renderGame(this.game, this.gameCode);
    };
    
    // Callback après un mouvement
    this.game.onMove = async (state) => {
      if (this.currentMode === 'online' && this.firebaseSync) {
        await this.firebaseSync.updateGame(state);
      }
    };
    
    // Callback fin de partie
    this.game.onGameOver = async (winner, reason) => {
      if (this.currentMode === 'online' && this.firebaseSync) {
        await this.firebaseSync.updateGameOver(
          winner,
          this.game.timer.whiteTime,
          this.game.timer.blackTime
        );
      }
      this.renderer.renderGame(this.game, this.gameCode);
    };
    
    // Callback mise à jour timer
    this.game.onTimerUpdate = async (whiteTime, blackTime) => {
      // Mettre à jour Firebase périodiquement (toutes les 2 secondes)
      if (this.currentMode === 'online' && this.firebaseSync) {
        const now = Date.now();
        if (!this.lastTimerSync || now - this.lastTimerSync > 2000) {
          this.lastTimerSync = now;
          await this.firebaseSync.updateTimer(whiteTime, blackTime);
        }
      }
    };
  }

  /**
   * Configure la synchronisation online
   */
  setupOnlineSync() {
    this.firebaseSync.startSync((state) => {
      // Détermine si l'adversaire est connecté
      const opponentConnected = this.game.playerColor === 'white' 
        ? !!state.playerBlack 
        : !!state.playerWhite;
      
      this.game.setOpponentConnected(opponentConnected);
      
      // Synchronise l'état du jeu
      this.game.syncState(state);
      
      this.renderer.renderGame(this.game, this.gameCode);
    });
  }

  /**
   * Gère le clic sur une case
   */
  handleSquareClick(row, col) {
    if (!this.game) return;
    
    const result = this.game.handleSquareClick(row, col);
    
    if (result === 'invalid') {
      this.renderer.shakeBoard();
    }
  }
}

// Initialise l'application
const app = new App();

// Expose handleSquareClick globalement pour les événements onclick
window.handleSquareClick = (row, col) => app.handleSquareClick(row, col);
