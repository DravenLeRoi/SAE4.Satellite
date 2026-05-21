export default {
  template: `
  <div class="page">
    <div class="section-title">Crédits</div>

    <div style="display:grid;grid-template-columns:1fr 280px;gap:1.5rem;max-width:1000px;margin:0 auto;align-items:start">

      <!-- CARTE PRINCIPALE -->
      <div class="card" style="line-height:1.8">
        <h2 style="font-size:1.2rem;font-weight:800;margin-bottom:1rem">SatView</h2>
        <p style="font-family:var(--mono);font-size:0.78rem;color:var(--muted);margin-bottom:1.5rem">
          SatView est une plateforme de réception et de visualisation d'images satellite météorologiques.
          Les données sont acquises automatiquement via une antenne SDR, décodées, puis stockées et
          consultables depuis cette interface.
          <br><br>
          Ce projet s'inscrit dans le cadre de la SAÉ4 de BUT2 GEII ESE de l'Université de Toulon, La Garde.
        </p>

        <div class="section-title" style="margin-top:1.5rem">Auteurs</div>
        <p style="font-family:var(--mono);font-size:0.78rem;color:var(--muted)">
          Clément Raimbaud &amp; Ajami Sammer<br>
          BUT GEII — IUT de Toulon, La Garde<br>
          SAÉ4 — 2026
        </p>
      </div>

      <!-- LIENS -->
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <div class="section-title" style="margin:0 0 0.5rem 0;border:none;padding:0">Liens</div>

        <a v-for="lien in liens" :key="lien.url" :href="lien.url" target="_blank" class="gh-link">
          <div class="gh-icon">{{ lien.icone }}</div>
          <div>
            <div style="color:var(--text);font-size:0.72rem;font-weight:600">{{ lien.titre }}</div>
            <div style="color:var(--muted);font-size:0.62rem;margin-top:2px">{{ lien.description }}</div>
          </div>
          <div class="gh-arrow">→</div>
        </a>
      </div>

    </div>
  </div>`,

  setup() {
    const liens = [
      { icone: '⌥', titre: 'SAE4.Satellite',  description: 'Depôt Github du projet',  url: 'https://github.com/DravenLeRoi/SAE4.Satellite' },
      { icone: '📄', titre: 'Rapport SAÉ4',     description: 'Document PDF',                url: 'https://example.com/rapport.pdf' },
      { icone: '🌐', titre: 'IUT de Toulon',    description: 'Université de Toulon',        url: 'https://iut.univ-tln.fr' },
    ];

    return { liens };
  }
};