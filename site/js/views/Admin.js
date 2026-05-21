import { ref, onMounted } from 'vue';
import { API } from '../config.js';

const CHAMPS = [
  { key: 'name',            label: 'Nom',               type: 'text' },
  { key: 'frequency',       label: 'Fréquence (MHz)',    type: 'number' },
  { key: 'min_elevation',   label: 'Élévation min',      type: 'number' },
  { key: 'min_culmination', label: 'Culmination min',    type: 'number' },
  { key: 'bandwidth',       label: 'Bandwidth (MHz)',    type: 'number' },
  { key: 'demodulation',    label: 'Démodulation',       type: 'select', options: ['none','fm','ssb'] },
  { key: 'record_format',   label: 'Format',             type: 'select', options: ['cs16','c32','cu8','wav'] },
  { key: 'doppler_track',   label: 'Doppler track',      type: 'select', options: ['off','on'] },
];

function nouveauSat() {
  return { name: '', frequency: 137.5, min_elevation: 5, min_culmination: 10, bandwidth: 0.5, demodulation: 'none', record_format: 'cs16', doppler_track: 'off' };
}

export default {
  template: `
  <div class="page">

    <!-- LOGIN -->
    <div v-if="!connecte" style="max-width:380px;margin:4rem auto">
      <div class="card">
        <div class="section-title">Accès administrateur</div>
        <div style="display:flex;flex-direction:column;gap:0.75rem;margin-top:1rem">
          <input v-model="password" type="password" placeholder="Mot de passe" @keyup.enter="login"/>
          <p v-if="erreur" style="font-family:var(--mono);font-size:0.7rem;color:var(--danger)">{{ erreur }}</p>
          <button class="btn" @click="login">→ Connexion</button>
        </div>
      </div>
    </div>

    <!-- ADMIN -->
    <div v-else>
      <div class="section-title">
        Administration
        <button class="btn btn-sm btn-ghost" style="margin-left:auto" @click="deconnecter">Déconnexion</button>
      </div>

      <!-- TOOLBAR -->
      <div style="display:flex;gap:0.75rem;margin-bottom:1.5rem;flex-wrap:wrap">
        <button class="btn" @click="ajouterSat">+ Ajouter un satellite</button>
        <button class="btn" style="border-color:var(--success);color:var(--success)" @click="sauvegarder">
          💾 Sauvegarder le fichier TOML
        </button>
        <span v-if="message" style="font-family:var(--mono);font-size:0.7rem;color:var(--success);align-self:center">
          {{ message }}
        </span>
      </div>

      <!-- LISTE SATELLITES -->
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <div
          v-for="(sat, index) in satellites"
          :key="index"
          class="card"
          draggable="true"
          @dragstart="dragStart(index)"
          @dragover.prevent="dragOver(index)"
          @dragend="dragEnd"
          :style="dragIndex === index ? 'opacity:0.4;border-color:var(--accent)' : ''"
        >
          <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem">
            <span style="cursor:grab;font-size:1.2rem;color:var(--muted)" title="Déplacer">⠿</span>
            <span style="font-family:var(--mono);font-size:0.8rem;font-weight:700;color:var(--accent2)">
              {{ sat.name || 'Nouveau satellite' }}
            </span>
            <button
              class="btn btn-sm btn-ghost"
              style="margin-left:auto;border-color:var(--danger);color:var(--danger)"
              @click="supprimer(index)"
            >🗑 Supprimer</button>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.75rem">
            <div v-for="champ in CHAMPS" :key="champ.key" style="display:flex;flex-direction:column;gap:0.3rem">
              <label style="font-family:var(--mono);font-size:0.6rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em">
                {{ champ.label }}
              </label>
              <select v-if="champ.type === 'select'" v-model="sat[champ.key]">
                <option v-for="opt in champ.options" :key="opt" :value="opt">{{ opt }}</option>
              </select>
              <input v-else :type="champ.type" v-model="sat[champ.key]" />
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>`,

  setup() {
    const password   = ref('');
    const erreur     = ref('');
    const connecte   = ref(!!sessionStorage.getItem('token'));
    const satellites = ref([]);
    const message    = ref('');
    const dragIndex  = ref(null);
    const overIndex  = ref(null);
    const CHAMPS_REF = CHAMPS;

    async function login() {
      erreur.value = '';
      try {
        const r = await fetch(`${API}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: password.value })
        });
        if (r.ok) {
          const data = await r.json();
          sessionStorage.setItem('token', data.token);
          connecte.value = true;
          await charger();
        } else {
          erreur.value = 'Mot de passe incorrect.';
        }
      } catch {
        erreur.value = 'Erreur de connexion au serveur.';
      }
    }

    function deconnecter() {
      sessionStorage.removeItem('token');
      connecte.value = false;
    }

    async function charger() {
      const token = sessionStorage.getItem('token');
      const r = await fetch(`${API}/api/admin/satellites`, {
        headers: { 'authorization': token }
      });
      if (r.ok) satellites.value = await r.json();
    }

    async function sauvegarder() {
      const token = sessionStorage.getItem('token');
      const r = await fetch(`${API}/api/admin/satellites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'authorization': token },
        body: JSON.stringify(satellites.value)
      });
      if (r.ok) {
        message.value = '✓ Sauvegardé !';
        setTimeout(() => message.value = '', 3000);
      }
    }

    function ajouterSat() {
      satellites.value.push(nouveauSat());
    }

    function supprimer(index) {
      satellites.value.splice(index, 1);
    }

    // Drag & drop
    function dragStart(index) { dragIndex.value = index; }
    function dragOver(index) {
      if (dragIndex.value === null || dragIndex.value === index) return;
      const arr = [...satellites.value];
      const item = arr.splice(dragIndex.value, 1)[0];
      arr.splice(index, 0, item);
      satellites.value = arr;
      dragIndex.value = index;
    }
    function dragEnd() { dragIndex.value = null; }

    onMounted(() => { if (connecte.value) charger(); });

    return { password, erreur, connecte, satellites, message, dragIndex,
             login, deconnecter, sauvegarder, ajouterSat, supprimer,
             dragStart, dragOver, dragEnd, CHAMPS: CHAMPS_REF };
  }
};