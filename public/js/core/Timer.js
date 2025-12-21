/**
 * Gestion du chronomètre de partie
 */
export class Timer {
  constructor(whiteTime, blackTime) {
    this.whiteTime = whiteTime;
    this.blackTime = blackTime;
    this.timerInterval = null;
    this.lastTimerUpdate = Date.now();
    this.isRunning = false;
    this.onTick = null;
    this.onTimeout = null;
  }

  /**
   * Démarre le chronomètre
   */
  start() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.lastTimerUpdate = Date.now();
    this.isRunning = true;
    
    this.timerInterval = setInterval(() => {
      if (!this.isRunning) {
        this.lastTimerUpdate = Date.now();
        return;
      }
      
      const now = Date.now();
      const elapsed = Math.floor((now - this.lastTimerUpdate) / 1000);
      
      if (elapsed >= 1) {
        this.lastTimerUpdate = now;
        
        const result = this.tick(elapsed);
        
        if (this.onTick) {
          this.onTick(this.whiteTime, this.blackTime);
        }
        
        if (result) {
          this.stop();
          if (this.onTimeout) {
            this.onTimeout(result);
          }
        }
      }
    }, 100);
  }

  /**
   * Arrête le chronomètre
   */
  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isRunning = false;
  }

  /**
   * Met en pause le chronomètre
   */
  pause() {
    this.isRunning = false;
    this.lastTimerUpdate = Date.now();
  }

  /**
   * Reprend le chronomètre
   */
  resume() {
    this.isRunning = true;
    this.lastTimerUpdate = Date.now();
  }

  /**
   * Décrémente le temps (appelé à chaque tick)
   * @returns {string|null} 'white' ou 'black' si un joueur n'a plus de temps
   */
  tick(elapsed, currentPlayer) {
    if (currentPlayer === 'white') {
      this.whiteTime = Math.max(0, this.whiteTime - elapsed);
      if (this.whiteTime === 0) return 'black';
    } else {
      this.blackTime = Math.max(0, this.blackTime - elapsed);
      if (this.blackTime === 0) return 'white';
    }
    return null;
  }

  /**
   * Définit les temps
   */
  setTimes(whiteTime, blackTime) {
    this.whiteTime = whiteTime;
    this.blackTime = blackTime;
  }

  /**
   * Réinitialise le chronomètre
   */
  reset(whiteTime, blackTime) {
    this.stop();
    this.whiteTime = whiteTime;
    this.blackTime = blackTime;
    this.lastTimerUpdate = Date.now();
  }

  /**
   * Formate le temps en mm:ss
   */
  static formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
