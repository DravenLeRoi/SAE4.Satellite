import { ref, onMounted } from 'vue';
import { API } from '../config.js';

export default {
  template: `
  <div class="page">
    <div class="sat-toolbar">
      <div class="section-title" style="margin:0;border:none;padding:0">Satellites configurés</div>
    </div>

    <div class="sat-list" v-if="satellites.length">
      <div class="sat-card" v-for="sat in satellites">
        <div class="sat-indicator">{{ sat.emoji || '🛰' }}</div>
        <div>
          <div class="sat-name">{{ sat.name }}</div>
          <div class="sat-meta">
            <span class="badge badge-neutral">{{ sat.frequency }} MHz</span>
          </div>
          <div class="sat-detail-grid">
            <div class="sat-detail">Démodulation <span>{{ sat.demodulation || '—' }}</span></div>
            <div class="sat-detail">Record format <span>{{ sat.record_format || '—' }}</span></div>
            <div class="sat-detail">Bande passante <span>{{ sat.bandwidth || '—' }}</span> MHz</div>
            <div class="sat-detail">Élévation minimale <span>{{ sat.min_culmination || '—' }}</span></div>       
          </div>
        </div>
      </div>
    </div>
    <div class="empty-state" v-else>
      <div class="empty-icon">🛰</div>
      <div>Aucun satellite configuré</div>
    </div>
  </div>`,
  setup() {
    const satellites = ref([]);
    const showModal  = ref(false);
    const editTarget = ref(null);
    const emptyForm  = () => ({ nom:'', emoji:'🛰', frequence:'', type:'APT', orbite:'', altitude:'', inclinaison:'', actif:true, description:'' });
    const form       = ref(emptyForm());

    onMounted(async () => {
      try { 
        const r = await fetch(`${API}/api/satellites`); 
        if (r.ok) { satellites.value = await r.json(); return; } 
      } catch {}

    });

    return { satellites, showModal, editTarget, form };
  }
};