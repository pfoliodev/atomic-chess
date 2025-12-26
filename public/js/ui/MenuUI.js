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
              ${this.renderVariantBtn('atomic', 'Atomic')}
              ${this.renderVariantBtn('kingofthehill', 'King of the Hill')}
              ${this.renderVariantBtn('standard', 'Standard')}
              ${this.renderVariantBtn('battleroyale', 'Battle Royale')}
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
            <button id="btn-ai" class="w-full btn-primary py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-900/20 active:scale-[0.98]">OFFLINE VS IA</button>
            <button id="btn-coach" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold transition-all border border-indigo-500 active:scale-[0.98] shadow-lg shadow-indigo-900/20">MODE COACH <span class="text-[8px] bg-white/20 px-1.5 py-0.5 rounded ml-2">BETA</span></button>
            <button id="btn-local" class="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold transition-all border border-slate-700 active:scale-[0.98]">DUEL LOCAL</button>
            
            <div class="relative py-4">
              <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-white/5"></div></div>
              <div class="relative flex justify-center text-xs uppercase font-bold text-slate-600"><span class="bg-slate-900 px-3 tracking-widest">MULTIJOUEUR</span></div>
            </div>

            <button id="btn-create" class="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold transition-all border border-slate-700 active:scale-[0.98]">CRÉER UN SALON</button>
            
            <div class="flex flex-col sm:flex-row gap-2">
              <input type="text" id="inputCode" placeholder="CODE SALON" class="w-full sm:flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-center font-mono font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500 transition-colors">
              <button id="btn-join" class="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/10">REJOINDRE</button>
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

  renderVariantBtn(variant, label) {
    const isSelected = this.selectedVariant === variant;
    return `
      <button data-variant="${variant}" class="variant-btn flex items-center justify-center p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold transition-all border ${isSelected ? 'bg-blue-600/10 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'}">
        ${label}
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
        });
        target.classList.add('bg-blue-600/10', 'border-blue-500', 'text-white', 'shadow-[0_0_20px_rgba(59,130,246,0.1)]');
        target.classList.remove('bg-slate-800/50', 'border-slate-700', 'text-slate-400', 'hover:border-slate-500');
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
