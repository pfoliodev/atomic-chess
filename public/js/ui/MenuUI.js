/**
 * Gère l'affichage du menu principal
 */
export class MenuUI {
  constructor(appElementId = 'app') {
    this.appElement = document.getElementById(appElementId);
    this.selectedTimeControl = 600;
    this.selectedVariant = 'atomic';
    this.onStartLocal = null;
    this.onStartAI = null;
    this.onCreateOnline = null;
    this.onJoinOnline = null;
    this.selectedLevel = 1;
  }

  /**
   * Rend le menu principal
   */
  render() {
    this.appElement.innerHTML = `<div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div class="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <h1 class="text-4xl font-bold text-white mb-8">♟️ CHESS VARIANTS</h1>
        <div class="mb-6">
          <p class="text-slate-400 text-sm mb-3">🎮 Variante</p>
          <div class="grid grid-cols-1 gap-2">
            <button data-variant="atomic" class="variant-btn bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 text-sm ring-2 ring-yellow-400">☢️ Atomic Chess</button>
            <button data-variant="kingofthehill" class="variant-btn bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 text-sm">🏔️ King of the Hill</button>
            <button data-variant="standard" class="variant-btn bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 text-sm">♟️ Standard Chess</button>
            <button data-variant="battleroyale" class="variant-btn bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 text-sm">🌪️ Battle Royale</button>
          </div>
        </div>
        <div class="mb-6">
          <p class="text-slate-400 text-sm mb-3">⏱️ Contrôle du temps</p>
          <div class="grid grid-cols-4 gap-2">
            <button data-time="180" class="time-btn bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-600 text-sm">3min</button>
            <button data-time="300" class="time-btn bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-600 text-sm">5min</button>
            <button data-time="600" class="time-btn bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-600 text-sm ring-2 ring-yellow-400">10min</button>
            <button data-time="900" class="time-btn bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-600 text-sm">15min</button>
          </div>
        </div>
        <div class="mb-6">
          <p class="text-slate-400 text-sm mb-3">🤖 Niveau de l'IA</p>
          <div class="grid grid-cols-8 gap-1">
            ${[1, 2, 3, 4, 5, 6, 7, 8].map(l => `<button data-level="${l}" class="level-btn bg-slate-700 text-white py-1 rounded-md hover:bg-slate-600 text-xs ${l === 1 ? 'ring-2 ring-yellow-400' : ''}">${l}</button>`).join('')}
          </div>
        </div>
        <button id="btn-ai" class="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold mb-4 hover:bg-emerald-700 transition transform hover:scale-105">SOLO VS IA</button>
        <button id="btn-local" class="w-full bg-purple-600 text-white py-4 rounded-xl font-bold mb-4 hover:bg-purple-700 transition transform hover:scale-105">LOCAL</button>
        <button id="btn-create" class="w-full bg-blue-600 text-white py-4 rounded-xl font-bold mb-4 hover:bg-blue-700 transition transform hover:scale-105">CRÉER EN LIGNE</button>
        <input type="text" id="inputCode" placeholder="Code à 6 chiffres" class="w-full p-4 rounded-xl mb-4 text-center font-bold text-slate-900">
        <button id="btn-join" class="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition transform hover:scale-105">REJOINDRE</button>
      </div>
    </div>`;

    this.attachEventListeners();
  }

  /**
   * Attache les gestionnaires d'événements
   */
  attachEventListeners() {
    // Boutons de variante
    document.querySelectorAll('.variant-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectedVariant = e.target.dataset.variant;
        document.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('ring-2', 'ring-yellow-400'));
        e.target.classList.add('ring-2', 'ring-yellow-400');
      });
    });

    // Boutons de contrôle du temps
    document.querySelectorAll('.time-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectedTimeControl = parseInt(e.target.dataset.time);
        document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('ring-2', 'ring-yellow-400'));
        e.target.classList.add('ring-2', 'ring-yellow-400');
      });
    });

    // Bouton AI
    const btnAI = document.getElementById('btn-ai');
    if (btnAI) {
      btnAI.addEventListener('click', () => {
        if (this.onStartAI) {
          this.onStartAI(this.selectedTimeControl, this.selectedVariant, this.selectedLevel);
        }
      });
    }

    // Boutons de niveau
    document.querySelectorAll('.level-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectedLevel = parseInt(e.target.dataset.level);
        document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('ring-2', 'ring-yellow-400'));
        e.target.classList.add('ring-2', 'ring-yellow-400');
      });
    });

    // Bouton Local
    const btnLocal = document.getElementById('btn-local');
    if (btnLocal) {
      btnLocal.addEventListener('click', () => {
        if (this.onStartLocal) {
          this.onStartLocal(this.selectedTimeControl, this.selectedVariant);
        }
      });
    }

    // Bouton Créer en ligne
    const btnCreate = document.getElementById('btn-create');
    if (btnCreate) {
      btnCreate.addEventListener('click', () => {
        if (this.onCreateOnline) {
          this.onCreateOnline(this.selectedTimeControl, this.selectedVariant);
        }
      });
    }

    // Bouton Rejoindre
    const btnJoin = document.getElementById('btn-join');
    if (btnJoin) {
      btnJoin.addEventListener('click', () => {
        const code = document.getElementById('inputCode').value;
        if (this.onJoinOnline && code) {
          this.onJoinOnline(code);
        }
      });
    }
  }
}
