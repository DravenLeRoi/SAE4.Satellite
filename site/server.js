// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path'); // à ajouter en haut du fichier
const app = express();
const PORT = 3000;

// Activation du CORS pour autoriser ton site à se connecter
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques (HTML, CSS, JS) depuis le dossier courant
app.use(express.static(__dirname));

// Route pour tester que le serveur répond
app.get('/api/stats', (req, res) => {

  const taille = tailleDossier('./datas');

  const satellites = getSatellites();

  res.json({
    total: 0,
    satsActifs: satellites.length,
    derniere: "Aujourd'hui",
    stockage: formatTaille(taille)
  });
});

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

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur : http://localhost:${PORT}`);
});

function getSatellites()
{
  const TOML = require('@iarna/toml');

  const fichier = fs.readFileSync('./datas/satellites.toml', 'utf-8');
  const config  = TOML.parse(fichier);

  return config.satellites;
}