#!/usr/bin/env node

/**
 * dossier_colmar_ddl.js
 *
 * Récupère automatiquement toutes les données disponibles
 * via l’API Données locales pour la commune de Colmar (COM-68066),
 * et les enregistre dans un unique fichier JSON.
 */

import fs    from 'fs'
import path  from 'path'
import axios from 'axios'
import qs    from 'qs'
import 'dotenv/config'

// --------------------------------------------------------------------
// CONFIGURATION
// --------------------------------------------------------------------

// Racine de l’API Données locales
const DDL_ROOT     = 'https://api.insee.fr/donnees-locales'
// Version de l'API
const API_VERSION  = 'V0.1'
// Code INSEE de Colmar (niveau COMMUNE)
const COMMUNE_CODE = '68066'
const NIVEAU       = 'COM'
const OUTPUT_FILE  = path.resolve(process.cwd(), 'dossier_colmar_ddl.json')

// Vos identifiants OAuth2 (client_credentials) Insee :
// à définir dans votre .env : INSEE_CLIENT_ID et INSEE_CLIENT_SECRET
/*
const { INSEE_CLIENT_ID, INSEE_CLIENT_SECRET } = process.env
if (!INSEE_CLIENT_ID || !INSEE_CLIENT_SECRET) {
  console.error('❌ Veuillez définir INSEE_CLIENT_ID et INSEE_CLIENT_SECRET dans votre .env')
  process.exit(1)
}
  */

// --------------------------------------------------------------------
// FONCTIONS
// --------------------------------------------------------------------

/**
 * 1) Obtenir un token via OAuth2 client_credentials
 */
async function getAccessToken() {
  const res = await axios.post(
    'https://api.insee.fr/token',
    qs.stringify({ grant_type: 'client_credentials' }),
    {
      auth: {
        username: INSEE_CLIENT_ID,
        password: INSEE_CLIENT_SECRET
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  )
  return res.data.access_token
}

/**
 * 2) Lister les sources (cubes prédéfinis)
 */
async function listSources(token) {
  const res = await axios.get(
    `${DDL_ROOT}/${API_VERSION}/sources`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
  )
  return res.data.sources
}

/**
 * 3) Pour une source donnée, lister les croisements disponibles
 */
async function listCroisements(token, source) {
  const res = await axios.get(
    `${DDL_ROOT}/${API_VERSION}/sources/${source}/croisements`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
  )
  return res.data.croisements
}

/**
 * 4) Pour une source et un croisement, lister les modalités disponibles
 */
async function listModalites(token, source, croisement) {
  const res = await axios.get(
    `${DDL_ROOT}/${API_VERSION}/sources/${source}/croisements/${croisement}/modalites`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
  )
  return res.data.modalites
}

/**
 * 5) Télécharger les données pour un triplet (source, croisement, modalité)
 */
async function fetchData(token, source, croisement, modalite) {
  const url = `${DDL_ROOT}/${API_VERSION}/data/${source}/${croisement}/${modalite}/${NIVEAU}/${COMMUNE_CODE}`
  const res = await axios.get(
    url,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, params: { format: 'JSON' } }
  )
  return res.data
}

// --------------------------------------------------------------------
// PROGRAMME PRINCIPAL
// --------------------------------------------------------------------

(async () => {
  try {
    console.error('▶ Obtention du token…')
    const token = await getAccessToken()

    console.error('▶ Récupération des sources…')
    const sources = await listSources(token)
    console.error(`  • ${sources.length} sources trouvées`)

    const dossier = {}

    for (const src of sources) {
      console.error(`▶ Source : ${src}`)
      dossier[src] = {}
      
      const croisements = await listCroisements(token, src)
      for (const cr of croisements) {
        console.error(`  • Croisement : ${cr}`)
        dossier[src][cr] = {}

        const modalites = await listModalites(token, src, cr)
        for (const mod of modalites) {
          process.stderr.write(`    - Modalité : ${mod} … `)
          try {
            const data = await fetchData(token, src, cr, mod)
            dossier[src][cr][mod] = data
            process.stderr.write('OK\n')
          } catch (e) {
            process.stderr.write(`ÉCHEC (${e.message})\n`)
          }
        }
      }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(dossier, null, 2), 'utf-8')
    console.error(`✅ Tout le dossier local enregistré dans ${OUTPUT_FILE}`)

  } catch (err) {
    console.error('❌ Erreur fatale :', err.message)
    process.exit(1)
  }
})()
