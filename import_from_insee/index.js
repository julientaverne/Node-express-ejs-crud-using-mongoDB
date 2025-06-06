#!/usr/bin/env node

/**
 * dossier_colmar.js
 *
 * Récupère automatiquement tous les jeux de données Melodi
 * ayant une dimension GEO, puis stocke leurs données
 * pour la commune de Colmar (COM-68066) dans un seul fichier JSON.
 */

import fs from 'fs'
import path from 'path'
import axios from 'axios'
import qs from 'qs'
import 'dotenv/config'

// --------------------------------------------------------------------
// CONFIGURATION
// --------------------------------------------------------------------

// Point d’accès Melodi (API v2 sous-jacente)
// cf. « L’adresse d’accès à l’API Melodi est la suivante : https://api.insee.fr/melodi » :contentReference[oaicite:0]{index=0}
const MEL_BASE     = 'https://api.insee.fr/melodi'
const COMMUNE_CODE = 'COM-68066'
const OUTPUT_FILE  = path.resolve(process.cwd(), 'dossier_colmar.json')

// Vos identifiants API INSEE (OAuth2 client_credentials)
// À définir dans votre .env ou dans votre environnement :
//   INSEE_CLIENT_ID et INSEE_CLIENT_SECRET
/*const { INSEE_CLIENT_ID, INSEE_CLIENT_SECRET } = process.env

if (!INSEE_CLIENT_ID || !INSEE_CLIENT_SECRET) {
  console.error('❌ Veuillez définir INSEE_CLIENT_ID et INSEE_CLIENT_SECRET')
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
  const tokenRes = await axios.post(
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
  return tokenRes.data.access_token
}

/**
 * 2) Récupérer le catalogue Melodi
 */
async function fetchCatalog(token) {
  const url = `${MEL_BASE}/catalog/all`
  const res = await axios.get(url, {
    headers: {
      //Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  })
  return res.data
}

/**
 * 3) Filtrer les jeux de données à dimension GEO
 */
function filterGeoDataflows(catalog) {
    //console.log(catalog[0].ordreComposants)
   
    for (let index = 0; index < catalog.length; index++) {
    const element = catalog[index];
    //console.log(element.spatialResolution)
    //if(element.identifier="DS_POPULATIONS_REFERENCE") console.log(element)
    //    if(element.ordreComposants.includes('GEO')) console.log(element)
    //if (Array.isArray(element.ordreComposants) && element.ordreComposants.includes('COM')) console.log(element)
   }

   for (let index = 0; index < catalog.length; index++) {
    const element = catalog[index];
    for (let index2 = 0; index2 < element.spatialResolution.length; index2++) {
        const spatialResolutionItem = element.spatialResolution[index2];
        //if(spatialResolutionItem.id="COM") console.log(element.identifier, element.subtitle[0].content)
        if(spatialResolutionItem.id="COM") {
            for (let index3 = 0; index3 < spatialResolutionItem.label.length; index3++) {
                const labelCom = spatialResolutionItem.label[index3];
                //if(labelCom.content=="Commune" && labelCom.lang=="en") console.log(element.identifier, element.title[0].content, element.subtitle[0].content, element.product[0].accessURL)
                if(labelCom.content=="Commune" && labelCom.lang=="en") console.log(element)
            }
        }
   }
}
   
  // Dans l’XML renvoyé, <identifier>DS_RP_POPULATION_PRINC</identifier>, etc. :contentReference[oaicite:1]{index=1}
  return (catalog || [])
    .filter(df => Array.isArray(df.ordreComposants) && df.ordreComposants.includes('GEO'))
    //.map(df => df.identifier)
    .map(df => df.identifier)
}

/**
 * 4) Télécharger un jeu de données pour la commune donnée
 */
async function fetchDataset(token, datasetId) {
  const url = `${MEL_BASE}/data/${datasetId}`
  const res = await axios.get(url, {
    headers: {
      //Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    },
    params: {
      geo: COMMUNE_CODE,
      format: 'JSON',
      maxResult: 10000
    }
  })
  return res.data
}

// --------------------------------------------------------------------
// ENTRÉE
// --------------------------------------------------------------------

(async () => {
  try {
    console.error('▶ Obtention du token d’accès…')
    const token = "test";//await getAccessToken()

    console.error('▶ Récupération du catalogue Melodi…')
    const catalog = await fetchCatalog(token)

    console.error('▶ Filtrage des jeux de données GEO…')
    const geoIds = filterGeoDataflows(catalog)
    console.error(`  • ${geoIds.length} jeux GEO trouvés.`)

    const dossier = {}
    for (const ds of geoIds) {
      console.error(`▶ Téléchargement de ${ds}…`)
      try {
        dossier[ds] = await fetchDataset(token, ds)
      } catch (err) {
        console.error(`  ⚠️ Échec pour ${ds} : ${err.message}`)
      }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(dossier, null, 2), 'utf-8')
    console.error(`✅ Dossier complet enregistré dans ${OUTPUT_FILE}`)

  } catch (err) {
    console.error('❌ Erreur fatale :', err.message)
    process.exit(1)
  }
})()
