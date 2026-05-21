import { ref, onMounted } from 'vue';
import { createApp, defineComponent } from 'vue';
import router from './router.js';
import { API } from './config.js';

export const API_URL = API;

const RootApp = defineComponent({
  setup() {
    const version = ref('');
    onMounted(async () => {
      const r = await fetch(`${API}/api/version`);
      if (r.ok) { const d = await r.json(); version.value = d.version; }
    });
    return { version };
  },
  template: `
    <nav>
      <router-link to="/" class="nav-logo">
        <div class="logo-ring">◎</div>SatView
      </router-link>
      <div class="nav-links">
        <router-link to="/"           class="nav-link">Accueil</router-link>
        <router-link to="/satellites" class="nav-link">Satellites</router-link>
        <router-link to="/fichiers"   class="nav-link">Fichiers</router-link>
        <router-link to="/credits" class="nav-link">Crédits</router-link>
        <router-link to="/admin" class="nav-link">Admin</router-link>
      </div>
      <div class="nav-status">
        <span style="font-family:var(--mono);font-size:0.6rem;color:var(--success);border:1px solid var(--success);padding:2px 8px;border-radius:3px;margin-right:0.75rem">v{{ version }}</span>
        <div class="dot dot-ok"></div>Système actif
      </div>
    </nav>

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

  <footer>SatView · Vue 3 + Express · Node.js        SAÉ4 2026 · BUT GEII IUT Toulon</footer>
  `
});

const app = createApp(RootApp);
app.use(router);
app.mount('#app');