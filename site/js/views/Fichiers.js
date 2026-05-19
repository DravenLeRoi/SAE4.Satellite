import { ref, computed, onMounted } from 'vue';
import { API } from '../app.js';

export default {
  template: `
  <div class="page">
    <div class="files-toolbar">
      <input v-model="search" placeholder="Rechercher…" style="width:200px"/>
      <select v-model="filterSat">
        <option value="">Tous les satellites</option>
        <option v-for="s in satList" :key="s" :value="s">{{ s }}</option>
      </select>
      <div class="spacer"></div>
      <span style="font-family:var(--mono);font-size:.65rem;color:var(--muted)">{{ filtered.length }} fichier(s)</span>
      <div class="view-toggle">
        <button :class="['view-btn',{active:view==='grid'}]" @click="view='grid'">⊞</button>
        <button :class="['view-btn',{active:view==='list'}]" @click="view='list'">☰</button>
      </div>
      <button class="btn" @click="fetchFiles">⟳ Rafraîchir</button>
    </div>

    <div class="files-grid" v-if="view==='grid' && filtered.length">
      <div class="file-card" v-for="f in filtered" :key="f.id" @click="viewer=f">
        <img v-if="f.url" :src="f.url" class="file-thumb" :alt="f.nom"/>
        <div v-else class="file-thumb-placeholder">🖼</div>
        <div class="file-info">
          <div class="file-name">{{ f.nom }}</div>
          <div class="file-meta-row">
            <span>{{ f.satellite }}</span>
            <span :class="['badge',f.ok?'badge-ok':'badge-error']" style="font-size:.55rem;padding:1px 5px">{{ f.ok?'✓':'✗' }}</span>
          </div>
          <div class="file-meta-row" style="margin-top:3px"><span>{{ f.date }}</span><span>{{ f.taille }}</span></div>
        </div>
      </div>
    </div>

    <div v-if="view==='list' && filtered.length" class="card" style="padding:0;overflow:hidden">
      <table class="file-table">
        <thead><tr><th>Fichier</th><th>Satellite</th><th>Date</th><th>Taille</th><th>Statut</th><th></th></tr></thead>
        <tbody>
          <tr v-for="f in filtered" :key="f.id">
            <td style="color:var(--accent2)">{{ f.nom }}</td>
            <td>{{ f.satellite }}</td>
            <td>{{ f.date }}</td>
            <td>{{ f.taille }}</td>
            <td><span :class="['badge',f.ok?'badge-ok':'badge-error']">{{ f.ok?'Valide':'Erreur' }}</span></td>
            <td><button class="btn btn-sm btn-ghost" @click="viewer=f">Ouvrir</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="empty-state" v-if="!filtered.length">
      <div class="empty-icon">🖼</div>
      <div>Aucun fichier trouvé</div>
      <div style="margin-top:.5rem;font-size:.65rem">{{ files.length ? 'Modifiez les filtres' : 'Cliquez sur Rafraîchir' }}</div>
    </div>

    <div class="viewer-overlay" v-if="viewer">
      <div class="viewer-header">
        <span style="font-family:var(--mono);font-size:.75rem;color:var(--accent2)">{{ viewer.nom }}</span>
        <button class="btn btn-sm btn-ghost" @click="viewer=null">✕ Fermer</button>
      </div>
      <div class="viewer-body">
        <img v-if="viewer.url" :src="viewer.url" class="viewer-img" :alt="viewer.nom"/>
        <div v-else style="color:var(--muted);font-family:var(--mono);font-size:.75rem;text-align:center">
          <div style="font-size:3rem;margin-bottom:1rem;opacity:.3">🖼</div>Image non disponible
        </div>
      </div>
      <div class="viewer-footer">
        <span>📡 {{ viewer.satellite }}</span>
        <span>📅 {{ viewer.date }}</span>
        <span>💾 {{ viewer.taille }}</span>
        <span :class="['badge',viewer.ok?'badge-ok':'badge-error']">{{ viewer.ok?'✓ Valide':'✗ Corrompu' }}</span>
      </div>
    </div>
  </div>`,
  setup() {
    const files     = ref([]);
    const search    = ref('');
    const filterSat = ref('');
    const view      = ref('grid');
    const viewer    = ref(null);
    const satList   = computed(() => [...new Set(files.value.map(f => f.satellite))]);
    const filtered  = computed(() => files.value.filter(f =>
      (!search.value || f.nom.toLowerCase().includes(search.value.toLowerCase())) &&
      (!filterSat.value || f.satellite === filterSat.value)
    ));

    async function fetchFiles() {
      try { 
        const r = await fetch(`${API}/api/fichiers`); 
        if (r.ok) { files.value = await r.json(); return; } 
      } catch {}
      files.value = [
        { id:1, nom:'noaa18_20260519_1432.png', satellite:'NOAA-18',        date:'19/05/2026 14:32', taille:'842 Ko', ok:true,  url:'https://upload.wikimedia.org/wikipedia/commons/2/2d/Meteosat-12-fci-march-equinox-2025-noon.jpg' },
        { id:2, nom:'noaa19_20260519_1218.png', satellite:'NOAA-19',        date:'19/05/2026 12:18', taille:'910 Ko', ok:true,  url:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/400px-The_Earth_seen_from_Apollo_17.jpg' },
        { id:3, nom:'noaa18_20260518_1547.png', satellite:'NOAA-18',        date:'18/05/2026 15:47', taille:'788 Ko', ok:true,  url:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/400px-The_Earth_seen_from_Apollo_17.jpg' },
        { id:4, nom:'noaa19_20260518_1102.png', satellite:'NOAA-19',        date:'18/05/2026 11:02', taille:'654 Ko', ok:false, url:null },
        { id:5, nom:'noaa18_20260517_1623.png', satellite:'NOAA-18',        date:'17/05/2026 16:23', taille:'901 Ko', ok:true,  url:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/400px-The_Earth_seen_from_Apollo_17.jpg' },
        { id:6, nom:'meteor_20260516_0944.png', satellite:'Meteor-M N°2-3', date:'16/05/2026 09:44', taille:'2.1 Mo', ok:true,  url:null },
      ];
    }

    onMounted(fetchFiles);
    return { files, search, filterSat, view, viewer, satList, filtered, fetchFiles };
  }
};