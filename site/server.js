// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path'); // à ajouter en haut du fichier
const TOML = require('@iarna/toml');
const app = express();

function log(emoji, message) {
  console.log(`${emoji} [${new Date().toLocaleString('fr-FR')}] ${message}`);
}

// --- Config loader
require('dotenv').config();

const PORT           = process.env.PORT;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TOKEN_SECRET   = process.env.TOKEN_SECRET;
const TOML_PATH      = process.env.TOML_PATH;

// Activation du CORS pour autoriser ton site à se connecter
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques (HTML, CSS, JS) depuis le dossier courant
app.use(express.static(__dirname));
app.use('/datas', express.static(path.join(__dirname, 'datas')));


// --- Admin panel

app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ token: TOKEN_SECRET });
    log('✅', `Connexion admin réussie depuis ${req.ip}`);
  } else {
    res.status(401).json({ erreur: 'Mot de passe incorrect' });
    log('❌', `Tentative échouée depuis ${req.ip}`);
  }
});

function requireAuth(req, res, next) {
  const token = req.headers['authorization'];
  if (token === TOKEN_SECRET) {
    next(); // ✅ autorisé
  } else {
    res.status(403).json({ erreur: 'Non autorisé' });
  }
}

// Lire les satellites (admin)
app.get('/api/admin/satellites', requireAuth, (req, res) => {
  res.json(getSatellites());
});

// Sauvegarder le TOML
app.post('/api/admin/satellites', requireAuth, (req, res) => {
  const satellites = req.body;
  const toml = TOML.stringify({ satellites });
  fs.writeFileSync(TOML_PATH, toml, 'utf-8');
  log('💾', `TOML sauvegardé — ${req.body.length} satellites depuis ${req.ip}`);
  res.json({ ok: true });
});

// --- API requests

app.get('/api/version', (req, res) => {
  res.json({ version: process.env.VERSION });
});

// Route pour tester que le serveur répond
app.get('/api/stats', (req, res) => {

  const taille = tailleDossier('./datas');

  const satellites = getSatellites();
  log('📊', `Stats demandées depuis ${req.ip}`);

  res.json({
    total: getImages().length,
    satsActifs: satellites.length,
    derniere: getDerniereReception(),
    stockage: formatTaille(taille)
  });
});

function getDerniereReception() {
  const images = getImages();
  if (images.length === 0) return "Aucune réception";

  const plusRecent = images.reduce((a, b) => 
    new Date(a.date) > new Date(b.date) ? a : b
  );

  return new Date(plusRecent.date).toLocaleString('fr-FR');
}

function tailleDossier(dossier) {
  const fichiers = fs.readdirSync(dossier);
  let total = 0;

  for (const fichier of fichiers) {
    const chemin = path.join(dossier, fichier);
    const stats = fs.statSync(chemin);

    if (stats.isDirectory()) {
      total += tailleDossier(chemin); // récursif pour les sous-dossiers
    } else {
      total += stats.size;
    }
  }

  return total;
}

function formatTaille(octets) {
  if (octets < 1024)        return `${octets} o`;
  if (octets < 1024 ** 2)   return `${(octets / 1024).toFixed(1)} Ko`;
  if (octets < 1024 ** 3)   return `${(octets / 1024 ** 2).toFixed(1)} Mo`;
                             return `${(octets / 1024 ** 3).toFixed(1)} Go`;
}

// Route pour récupérer les satellites
app.get('/api/satellites', (req, res) => {
  res.json(getSatellites())
});

// Route pour récupérer les satellites
app.get('/api/fichiers', (req, res) => {
  res.json(getImages())
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur : http://localhost:${PORT}`);

  // Créer un dossier par satellite
  for (const sat of getSatellites()) {
    const dossier = path.join(__dirname, 'datas', sat.name);
    if (!fs.existsSync(dossier)) {
      fs.mkdirSync(dossier, { recursive: true });
      console.log(`📁 Dossier créé : ${dossier}`);
    }
  }

});

function getSatellites()
{
  const fichier = fs.readFileSync(TOML_PATH, 'utf-8');
  const config  = TOML.parse(fichier);

  return config.satellites;
}

function getImages() {
  const dossierBase = path.join(__dirname, 'datas');
  const images = [];

  for (const sat of getSatellites()) {
    const dossierSat = path.join(dossierBase, sat.name);

    if (!fs.existsSync(dossierSat)) continue;

    const fichiers = fs.readdirSync(dossierSat);

    for (const fichier of fichiers) {
      const ext = path.extname(fichier).toLowerCase();
      if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue;

      const cheminComplet = path.join(dossierSat, fichier);
      const stats = fs.statSync(cheminComplet);

      images.push({
        nom:       fichier,
        satellite: sat.name,
        url:       `/datas/${encodeURIComponent(sat.name)}/${fichier}`, // ✅ "NOAA%2015"
        date:      stats.birthtime,
        taille:     formatTaille(stats.size)
      });
    }
  }

  return images;
}