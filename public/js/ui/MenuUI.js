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
    this.onStartCoach = null;
    this.onCreateOnline = null;
    this.onJoinOnline = null;
    this.selectedLevel = 1;
  }

  /**
   * Rend le menu principal
   */
  render() {
    this.appElement.innerHTML = `
    <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-8 font-sans">
      <div class="glass-panel p-6 sm:p-10 rounded-3xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[95vh] border border-white/10">
        
        <header class="mb-8">
          <h1 class="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">Chess Pro</h1>
          <p class="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">Variantes de Compétition</p>
        </header>

        <section class="space-y-8">
          <!-- Variante Selection -->
          <div>
            <label class="text-slate-400 text-[10px] font-bold uppercase tracking-widest block mb-3">SÉLECTIONNER UNE VARIANTE</label>
            <div class="grid grid-cols-2 gap-3">
              ${this.renderVariantBtn('atomic', 'Atomic', './assets/menu/atom.png')}
              ${this.renderVariantBtn('kingofthehill', 'King of the Hill', './assets/menu/KOFTH.png')}
              ${this.renderVariantBtn('standard', 'Standard', './assets/menu/standard.png')}
              ${this.renderVariantBtn('battleroyale', 'Battle Royale', './assets/menu/BattleRoyale.png')}
            </div>
          </div>

          <!-- Time & Level Settings -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label class="text-slate-400 text-[10px] font-bold uppercase tracking-widest block mb-3">CADENCE</label>
              <div class="grid grid-cols-2 gap-2">
                ${this.renderTimeBtn(180, '3 min')}
                ${this.renderTimeBtn(300, '5 min')}
                ${this.renderTimeBtn(600, '10 min')}
                ${this.renderTimeBtn(900, '15 min')}
              </div>
            </div>
            <div>
              <label class="text-slate-400 text-[10px] font-bold uppercase tracking-widest block mb-3">NIVEAU IA</label>
              <div class="flex flex-wrap gap-1.5">
                ${[1, 2, 3, 4, 5, 6, 7, 8].map(l => `
                  <button data-level="${l}" class="level-btn w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all border ${this.selectedLevel === l ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}">
                    ${l}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Main Actions -->
          <div class="space-y-3 pt-4 border-t border-white/5">
            <button id="btn-ai" class="w-full flex items-center bg-blue-600 hover:bg-blue-500 p-2 pr-6 rounded-2xl font-bold text-white shadow-lg shadow-blue-900/40 active:scale-[0.98] transition-all group">
              <div class="p-1 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                <img src="./assets/menu/offline_vs_ia.png" class="h-12 w-12 object-contain" alt="IA">
              </div>
              <span class="text-lg tracking-tight uppercase">Offline vs ia</span>
            </button>

            <button id="btn-coach" class="w-full flex items-center bg-indigo-600 hover:bg-indigo-500 p-2 pr-6 rounded-2xl font-bold text-white transition-all active:scale-[0.98] shadow-lg shadow-indigo-900/40 group">
              <div class="p-1 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                <img src="./assets/menu/coach_ia.png" class="h-12 w-12 object-contain" alt="Coach">
              </div>
              <div class="text-left">
                <span class="text-lg tracking-tight uppercase">Mode Coach</span>
                <span class="text-[8px] bg-white/20 px-1.5 py-0.5 rounded ml-2 align-middle">BETA</span>
              </div>
            </button>

            <button id="btn-local" class="w-full flex items-center bg-slate-800 hover:bg-slate-700 p-2 pr-6 rounded-2xl font-bold text-white transition-all active:scale-[0.98] border border-white/5 group">
              <div class="p-1 mr-4 group-hover:scale-110 transition-transform">
                <img src="./assets/menu/duel_local.png" class="h-10 w-10 object-contain" alt="Local">
              </div>
              <span class="text-base tracking-tight uppercase">Duel Local</span>
            </button>
            
            <div class="relative py-4">
              <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-white/5"></div></div>
              <div class="relative flex justify-center text-xs uppercase font-bold text-slate-600"><span class="bg-slate-900 px-3 tracking-widest">MULTIJOUEUR</span></div>
            </div>

            <button id="btn-create" class="w-full flex items-center bg-slate-800 hover:bg-slate-700 p-2 pr-6 rounded-2xl font-bold text-white transition-all active:scale-[0.98] border border-white/5 group">
               <div class="p-1 mr-4 group-hover:scale-110 transition-transform">
                <img src="./assets/menu/salon.png" class="h-10 w-10 object-contain" alt="Salon">
              </div>
              <span class="text-base tracking-tight uppercase">Créer un salon</span>
            </button>
            
            <div class="flex gap-2">
              <div class="relative flex-1 group">
                <div class="absolute left-3 top-1/2 -translate-y-1/2">
                  <img src="./assets/menu/code_salon.png" class="h-8 w-8 object-contain opacity-50 group-focus-within:opacity-100 transition-opacity" alt="Code">
                </div>
                <input type="text" id="inputCode" placeholder="CODE SALON" class="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-4 py-4 font-mono font-bold text-white placeholder:text-slate-800 focus:outline-none focus:border-blue-500 transition-colors">
              </div>
              <button id="btn-join" class="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/20 uppercase text-sm">Rejoindre</button>
            </div>
          </div>
        </section>

        <footer class="mt-8 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] animate-pulse">
          Connecté au réseau mondial
        </footer>
      </div>
    </div>`;

    this.attachEventListeners();
  }

  renderVariantBtn(variant, label, iconSrc) {
    const isSelected = this.selectedVariant === variant;
    return `
      <button data-variant="${variant}" class="variant-btn flex items-center gap-3 p-3 sm:p-4 rounded-xl text-[10px] sm:text-xs font-bold transition-all border ${isSelected ? 'bg-blue-600/10 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'}">
        <div class="shrink-0">
          <img src="${iconSrc}" class="h-8 w-8 object-contain ${isSelected ? '' : 'opacity-50 grayscale'} transition-all" alt="${label}">
        </div>
        <span class="text-left leading-tight">${label}</span>
      </button>
    `;
  }

  renderTimeBtn(time, label) {
    const isSelected = this.selectedTimeControl === time;
    return `
      <button data-time="${time}" class="time-btn p-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all border ${isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}">
        ${label}
      </button>
    `;
  }

  /**
   * Attache les gestionnaires d'événements
   */
  attachEventListeners() {
    // Boutons de variante
    document.querySelectorAll('.variant-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget;
        this.selectedVariant = target.dataset.variant;
        document.querySelectorAll('.variant-btn').forEach(b => {
          b.classList.remove('bg-blue-600/10', 'border-blue-500', 'text-white', 'shadow-[0_0_20px_rgba(59,130,246,0.1)]');
          b.classList.add('bg-slate-800/50', 'border-slate-700', 'text-slate-400');
          // Reset icon opacity
          const img = b.querySelector('img');
          if (img) {
            img.classList.add('opacity-50', 'grayscale');
          }
        });
        target.classList.add('bg-blue-600/10', 'border-blue-500', 'text-white', 'shadow-[0_0_20px_rgba(59,130,246,0.1)]');
        target.classList.remove('bg-slate-800/50', 'border-slate-700', 'text-slate-400', 'hover:border-slate-500');
        // Set active icon opacity
        const targetImg = target.querySelector('img');
        if (targetImg) {
          targetImg.classList.remove('opacity-50', 'grayscale');
        }
      });
    });

    // Boutons de contrôle du temps
    document.querySelectorAll('.time-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget;
        this.selectedTimeControl = parseInt(target.dataset.time);
        document.querySelectorAll('.time-btn').forEach(b => {
          b.classList.remove('bg-blue-600', 'border-blue-500', 'text-white');
          b.classList.add('bg-slate-800', 'border-slate-700', 'text-slate-400');
        });
        target.classList.add('bg-blue-600', 'border-blue-500', 'text-white');
        target.classList.remove('bg-slate-800', 'border-slate-700', 'text-slate-400', 'hover:border-slate-500');
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

    // Bouton Coach
    const btnCoach = document.getElementById('btn-coach');
    if (btnCoach) {
      btnCoach.addEventListener('click', () => {
        if (this.onStartCoach) {
          this.onStartCoach(this.selectedTimeControl, this.selectedVariant, this.selectedLevel);
        }
      });
    }

    // Boutons de niveau
    document.querySelectorAll('.level-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget;
        this.selectedLevel = parseInt(target.dataset.level);
        document.querySelectorAll('.level-btn').forEach(b => {
          b.classList.remove('bg-blue-600', 'border-blue-500', 'text-white', 'shadow-[0_0_15px_rgba(59,130,246,0.3)]');
          b.classList.add('bg-slate-800', 'border-slate-700', 'text-slate-400');
        });
        target.classList.add('bg-blue-600', 'border-blue-500', 'text-white', 'shadow-[0_0_15px_rgba(59,130,246,0.3)]');
        target.classList.remove('bg-slate-800', 'border-slate-700', 'text-slate-400', 'hover:border-slate-500');
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
