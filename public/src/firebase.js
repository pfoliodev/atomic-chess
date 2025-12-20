// src/firebase.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyCJc2nvexdOTAnwyGydexLYzdF0CmdTbg8",
    authDomain: "atomic-chess-221b3.firebaseapp.com",
    projectId: "atomic-chess-221b3",
    storageBucket: "atomic-chess-221b3.firebasestorage.app",
    messagingSenderId: "1005991526828",
    appId: "1:1005991526828:web:4b3f6e158ac94ecd443a09"
};

export class FirebaseManager {
    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.db = getFirestore(this.app);
        this.auth = getAuth(this.app);
        this.userId = null;
        this.gameId = null;
        this.unsubscribe = null;
        
        // Auto login
        signInAnonymously(this.auth).then(res => {
            this.userId = res.user.uid;
            console.log("Connecté Firebase:", this.userId);
        });
    }

    async createGame(gameInstance) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        this.gameId = code;
        
        await setDoc(doc(this.db, 'games', code), {
            board: gameInstance.board.flat(),
            turn: 'white',
            whitePlayer: this.userId,
            history: [],
            lastUpdate: serverTimestamp()
        });
        return code;
    }

    async joinGame(code, onUpdate) {
        const snap = await getDoc(doc(this.db, 'games', code));
        if (!snap.exists()) throw new Error("Partie introuvable");
        
        this.gameId = code;
        await updateDoc(doc(this.db, 'games', code), { blackPlayer: this.userId });
        
        this.listen(onUpdate);
        return 'black'; // On retourne la couleur du joueur
    }

    listen(onUpdateCallback) {
        if (this.unsubscribe) this.unsubscribe();
        
        this.unsubscribe = onSnapshot(doc(this.db, 'games', this.gameId), (snap) => {
            const data = snap.data();
            if (data) onUpdateCallback(data);
        });
    }

    async sendMove(gameInstance) {
        if (!this.gameId) return;
        
        await updateDoc(doc(this.db, 'games', this.gameId), {
            board: gameInstance.board.flat(),
            turn: gameInstance.turn,
            timers: gameInstance.timers,
            history: gameInstance.history,
            lastMove: gameInstance.lastMove,
            gameOver: gameInstance.gameOver
        });
    }
}