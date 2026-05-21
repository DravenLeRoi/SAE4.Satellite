import { ref, computed, onMounted } from 'vue';
import { API } from '../config.js';

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
          </div>
          <div class="file-meta-row" style="margin-top:3px"><span>{{ new Date(f.date).toLocaleString('fr-FR') }}</span><span>{{ f.taille }}</span></div>
        </div>
      </div>
    </div>

    <div v-if="view==='list' && filtered.length" class="card" style="padding:0;overflow:hidden">
      <table class="file-table">
        <thead><tr><th>Fichier</th><th>Satellite</th><th>Date</th><th>Taille</th><th></th></tr></thead>
        <tbody>
          <tr v-for="f in filtered" :key="f.id">
            <td style="color:var(--accent2)">{{ f.nom }}</td>
            <td>{{ f.satellite }}</td>
            <td>{{ new Date(f.date).toLocaleString('fr-FR') }}</td>
            <td>{{ f.taille }}</td>
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
        <span>📅 {{ new Date(viewer.date).toLocaleString('fr-FR') }}</span>
        <span>💾 {{ viewer.taille }}</span>
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
        if (r.ok) { 
          const data = await r.json();
          files.value = data.sort((a, b) => new Date(b.date) - new Date(a.date)); // ✅ plus récent en premier
          return; 
        } 
      } catch {}
    }

    onMounted(fetchFiles);
    return { files, search, filterSat, view, viewer, satList, filtered, fetchFiles };
  }
};