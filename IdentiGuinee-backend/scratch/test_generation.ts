import imageService from '../src/modules/cartes/service/image.service.js';
import { MRZUtils } from '../src/common/utils/mrz.utils.js';
import path from 'path';
import fs from 'fs';

async function test() {
  const data = {
    id: 'test-card-123',
    nom: 'KING',
    prenom: 'Joseph',
    sexe: 'M',
    dateNaissance: new Date('2000-01-02'),
    lieuNaissance: 'LOLA',
    nationalite: 'GUINEENNE',
    taille: '1.76m',
    nin: '2004010203647631',
    numeroCarte: '5165062410070014',
    dateEmission: new Date('2024-11-18'),
    dateExpiration: new Date('2029-11-18'),
    lieuDelivrance: 'CONAKRY / M.S.P.C',
    region: 'CONAKRY',
    prefecture: 'CONAKRY',
    sousPrefecture: 'RATOMA',
    quartier: 'KIPÉ',
    secteurVillage: 'KIPÉ 2',
    photoUrl: '/uploads/photo-1776285077244-675945648.png',
    signatureUrl: '',
    qrData: '{"test": true}'
  };

  // Génération dynamique du MRZ pour le test
  const mrz = MRZUtils.generateTD1({
    numeroCarte: data.numeroCarte,
    nin: data.nin,
    dateNaissance: data.dateNaissance,
    sexe: data.sexe as 'M' | 'F',
    dateExpiration: data.dateExpiration,
    nom: data.nom,
    prenom: data.prenom,
  });

  console.log("Generating test images...");
  try {
    const result = await imageService.generateCardImages({ ...data, mrz });
    console.log("Success! Images generated:", result);
    console.log("Check the uploads/cartes directory.");
  } catch (error) {
    console.error("Error generating images:", error);
  }
}

test();
