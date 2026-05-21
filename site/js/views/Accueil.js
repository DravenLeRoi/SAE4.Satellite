import { ref, onMounted } from 'vue';
import { API } from '../config.js';



export default {
  template: `
  <div class="page">
    <div class="hero">
      <div>
        <p class="hero-label">// Réception satellite météo</p>
        <h1 class="hero-title">Visualisation<br>de données<br><span>spatiales</span></h1>
        <p class="hero-desc">
          Plateforme de réception et d'affichage d'images satellite météorologiques.<br>
          Les données sont acquises, décodées et stockées automatiquement<br>pour être consultées ici.
        </p>
        <div class="hero-actions">
          <button class="btn" @click="$router.push('/fichiers')">→ Voir les fichiers</button>
          <button class="btn btn-ghost" @click="$router.push('/satellites')">Satellites configurés</button>
        </div>
      </div>
      <div class="hero-visual">
        <svg class="orbit-svg" viewBox="0 0 280 280" fill="none">
          <ellipse cx="140" cy="140" rx="120" ry="40" stroke="#1e2d42" stroke-width="1" stroke-dasharray="4 4"/>
          <ellipse cx="140" cy="140" rx="90" ry="30" stroke="#1e2d42" stroke-width="1" stroke-dasharray="3 6" transform="rotate(40 140 140)"/>
          <circle cx="140" cy="140" r="30" fill="#0e1520" stroke="#1e2d42" stroke-width="1.5"/>
          <circle cx="140" cy="140" r="30" fill="none" stroke="#3b82f6" stroke-width="0.5" opacity="0.4"/>
          <text x="140" y="146" text-anchor="middle" font-size="20">🌍</text>
          <g style="animation:spin 6s linear infinite;transform-origin:140px 140px;">
            <rect x="248" y="96" width="12" height="8" rx="1" fill="#0ea5e9" stroke="#3b82f6" stroke-width="0.5"/>
            <line x1="248" y1="100" x2="240" y2="100" stroke="#1e2d42" stroke-width="1"/>
            <line x1="260" y1="100" x2="268" y2="100" stroke="#1e2d42" stroke-width="1"/>
            <rect x="237" y="98" width="6" height="4" rx="0.5" fill="#1e2d42" stroke="#3b82f6" stroke-width="0.5"/>
            <rect x="262" y="98" width="6" height="4" rx="0.5" fill="#1e2d42" stroke="#3b82f6" stroke-width="0.5"/>
          </g>
          <line x1="140" y1="140" x2="248" y2="100" stroke="#3b82f6" stroke-width="0.5" stroke-dasharray="3 4" opacity="0.4"/>
          <text x="140" y="250" text-anchor="middle" font-family="'Space Mono',monospace" font-size="9" fill="#4a6280">RÉCEPTION 137 MHz</text>
        </svg>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Images reçues</div>
        <div class="stat-value blue">{{ stats.total }}</div>
      </div>
      <div class="stat-card" style="--accent:var(--success)">
        <div class="stat-label">Satellites actifs</div>
        <div class="stat-value green">{{ stats.satsActifs }}</div>
      </div>
      <div class="stat-card" style="--accent:var(--warning)">
        <div class="stat-label">Dernière réception</div>
        <div class="stat-value" style="color:var(--warning)">{{ stats.derniere }}</div>
      </div>
      <div class="stat-card" style="--accent:var(--purple)">
        <div class="stat-label">Stockage utilisé</div>
        <div class="stat-value" style="color:var(--purple)">{{ stats.stockage }}</div>
      </div>
    </div>

    <div class="section-title">Fonctionnalités</div>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">🛰</div>
        <div class="feature-title">Multi-satellites</div>
        <div class="feature-desc">Gestion de plusieurs satellites météo (NOAA, Meteor-M…) avec leurs fréquences et paramètres de décodage.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🖼</div>
        <div class="feature-title">Images APT / LRPT</div>
        <div class="feature-desc">Affichage des images météo reçues avec métadonnées de réception.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">💾</div>
        <div class="feature-title">Stockage interne</div>
        <div class="feature-desc">Toutes les images et métadonnées sont récupérés et stockés sur le site.</div>
      </div>
    </div>
  </div>`,
  setup() {
    const stats = ref({ total: '—', satsActifs: '—', derniere: '—', stockage: '—' });
    onMounted(async () => {
      try { 
        const r = await fetch(`${API}/api/stats`); 
        if (r.ok) { stats.value = await r.json(); return; } 
      } catch {}
      stats.value = { total: '0', satsActifs: '0', derniere: "Erreur", stockage: 'Erreur' };
    });
    return { stats };
  }
};