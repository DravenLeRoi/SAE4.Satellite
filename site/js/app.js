import { createApp, defineComponent } from 'vue';
import router from './router.js';

import { API } from './config.js';
export { API };

// Composant racine qui reprend le template défini dans index.html
const RootApp = defineComponent({
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
        <div class="dot dot-ok"></div>Système actif
      </div>
    </nav>

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

  <footer>SatView • v0.1</footer>
  `
});

const app = createApp(RootApp);
app.use(router);
app.mount('#app');