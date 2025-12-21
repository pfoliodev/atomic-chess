/**
 * Gère la synchronisation Firebase pour les parties en ligne
 */
export class FirebaseSync {
  constructor(db, auth) {
    this.db = db;
    this.auth = auth;
    this.userId = null;
    this.unsubscribe = null;
    this.gameCode = null;
  }

  /**
   * Initialise l'authentification anonyme
   */
  async initialize() {
    const { signInAnonymously } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const result = await signInAnonymously(this.auth);
    this.userId = result.user.uid;
    return this.userId;
  }

  /**
   * Crée une nouvelle partie en ligne
   */
  async createGame(initialState, timeControl) {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.gameCode = code;
    
    await setDoc(doc(this.db, 'games', code), {
      board: initialState.board,
      currentPlayer: 'white',
      playerWhite: this.userId,
      ...initialState.variantState,
      moveHistory: [],
      whiteTime: timeControl,
      blackTime: timeControl,
      lastTimerUpdate: Date.now(),
      gameOver: null
    });
    
    return { code, playerColor: 'white' };
  }

  /**
   * Rejoint une partie existante
   */
  async joinGame(code) {
    const { doc, getDoc, updateDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    const snap = await getDoc(doc(this.db, 'games', code));
    
    if (!snap.exists() || snap.data().playerBlack) {
      throw new Error('Code invalide ou partie déjà complète');
    }
    
    this.gameCode = code;
    const data = snap.data();
    
    await updateDoc(doc(this.db, 'games', code), {
      playerBlack: this.userId,
      playerBlackActive: serverTimestamp()
    });
    
    return {
      code,
      playerColor: 'black',
      state: {
        board: data.board,
        currentPlayer: data.currentPlayer,
        moveHistory: data.moveHistory || [],
        variantState: {
          kingMoved: data.kingMoved,
          rookMoved: data.rookMoved,
          lastMove: data.lastMove
        },
        whiteTime: data.whiteTime || 600,
        blackTime: data.blackTime || 600,
        lastTimerUpdate: data.lastTimerUpdate,
        gameOver: data.gameOver
      }
    };
  }

  /**
   * Synchronise l'état du jeu avec Firebase
   */
  startSync(onUpdate) {
    return new Promise(async (resolve) => {
      const { doc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      
      this.unsubscribe = onSnapshot(doc(this.db, 'games', this.gameCode), (snapshot) => {
        const data = snapshot.data();
        if (!data) return;
        
        const state = {
          board: data.board,
          currentPlayer: data.currentPlayer,
          moveHistory: data.moveHistory || [],
          variantState: {
            kingMoved: data.kingMoved,
            rookMoved: data.rookMoved,
            lastMove: data.lastMove
          },
          whiteTime: data.whiteTime,
          blackTime: data.blackTime,
          lastTimerUpdate: data.lastTimerUpdate,
          gameOver: data.gameOver,
          playerWhite: data.playerWhite,
          playerBlack: data.playerBlack
        };
        
        onUpdate(state);
      });
      
      resolve();
    });
  }

  /**
   * Met à jour l'état du jeu dans Firebase
   */
  async updateGame(state) {
    const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    await updateDoc(doc(this.db, 'games', this.gameCode), {
      board: state.board,
      currentPlayer: state.currentPlayer,
      ...state.variantState,
      moveHistory: state.moveHistory,
      whiteTime: state.whiteTime,
      blackTime: state.blackTime,
      lastTimerUpdate: Date.now(),
      ...(state.gameOver && { gameOver: state.gameOver })
    });
  }

  /**
   * Met à jour uniquement le timer
   */
  async updateTimer(whiteTime, blackTime) {
    const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    await updateDoc(doc(this.db, 'games', this.gameCode), {
      whiteTime,
      blackTime,
      lastTimerUpdate: Date.now()
    });
  }

  /**
   * Met à jour le game over
   */
  async updateGameOver(winner, whiteTime, blackTime) {
    const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    await updateDoc(doc(this.db, 'games', this.gameCode), {
      gameOver: winner,
      whiteTime,
      blackTime
    });
  }

  /**
   * Arrête la synchronisation
   */
  stopSync() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  /**
   * Nettoie les ressources
   */
  destroy() {
    this.stopSync();
  }
}
