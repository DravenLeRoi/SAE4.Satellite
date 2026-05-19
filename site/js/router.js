import { createRouter, createWebHashHistory } from 'vue-router';
import PageAccueil from './views/Accueil.js';
import PageSatellites from './views/Satellites.js';
import PageFichiers from './views/Fichiers.js';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/',           component: PageAccueil },
    { path: '/satellites', component: PageSatellites },
    { path: '/fichiers',   component: PageFichiers },
  ]
});

export default router;