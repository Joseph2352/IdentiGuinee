import sharp from 'sharp';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import TextToSVG from 'text-to-svg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ImageService {
  private templatesPath = path.join(__dirname, '../../../../CNI');
  private uploadsPath = path.join(__dirname, '../../../../uploads');
  private textToSVG: TextToSVG;

  constructor() {
    const fontPath = path.join(__dirname, '../../../../CNI/font/OCRBStd.ttf');
    // On charge la police de manière synchrone lors de l'initialisation du service
    this.textToSVG = TextToSVG.loadSync(fontPath);
  }

  /**
   * Génère les images Recto et Verso de la carte
   */
  async generateCardImages(data: {
    id: string;
    nom: string;
    prenom: string;
    sexe: string;
    dateNaissance: Date;
    lieuNaissance: string;
    nationalite: string;
    taille?: string;
    nin: string;
    numeroCarte: string;
    dateEmission: Date;
    dateExpiration: Date;
    lieuDelivrance?: string;
    region: string;
    prefecture: string;
    sousPrefecture: string;
    quartier?: string;
    secteurVillage?: string;
    photoUrl?: string; // Relatif à uploads/
    signatureUrl?: string; // Relatif à uploads/
    mrz: string[];
    qrData: string;
  }) {
    const cardsDir = path.join(this.uploadsPath, 'cartes');
    if (!fs.existsSync(cardsDir)) {
      fs.mkdirSync(cardsDir, { recursive: true });
    }

    const rectoPath = path.join(cardsDir, `recto_${data.id}.png`);
    const versoPath = path.join(cardsDir, `verso_${data.id}.png`);

    await this.drawRecto(data, rectoPath);
    await this.drawVerso(data, versoPath);

    return {
      rectoUrl: `/uploads/cartes/recto_${data.id}.png`,
      versoUrl: `/uploads/cartes/verso_${data.id}.png`,
    };
  }

  private async drawRecto(data: any, outputPath: string) {
    const template = path.join(this.templatesPath, 'devant.png');
    
    // Formatting dates to official CEDEAO style (e.g. 12 JUN 1999)
    const dateNais = this.formatOfficialDate(data.dateNaissance);
    const dateEmis = this.formatOfficialDate(data.dateEmission);
    const dateExp = this.formatOfficialDate(data.dateExpiration);

    // 1. Préparer les textes via SVG
    const svgText = `
      <svg width="1536" height="1024">
        <style>
          .val { font-family: sans-serif; font-weight: bold; fill: #1a1a1a; font-size: 38px; text-transform: uppercase; }
          .nin-bottom { font-size: 44px; fill: #000; font-family: monospace; }
        </style>
        
        <!-- Main Info column -->
        <text x="510" y="310" class="val">${this.escapeXml((data.nom || '').toUpperCase())}</text>
        <text x="510" y="400" class="val">${this.escapeXml((data.prenom || '').toUpperCase())}</text>
        <text x="510" y="493" class="val">${this.escapeXml((data.nationalite || '').toUpperCase())}</text>
        <text x="510" y="582" class="val">${dateNais}</text>
        <text x="510" y="675" class="val">${dateEmis}</text>
        <text x="510" y="769" class="val">${dateExp}</text>
        
        <text x="510" y="865" class="val nin-bottom">${data.numeroCarte}</text>
        <text x="510" y="967" class="val">${this.escapeXml((data.lieuDelivrance || 'CONAKRY / M.S.P.C').toUpperCase())}</text>
        
        <!-- Right side info -->
        <text x="1190" y="490" class="val">${(data.sexe || '').toUpperCase()}</text>
        <text x="1190" y="585" class="val">${(data.taille || '1.75 M').toUpperCase()}</text>
      </svg>
    `;

    const layers: any[] = [{ input: Buffer.from(svgText), top: 0, left: 0 }];

    // 2. Ajouter la photo (Main left photo)
    if (data.photoUrl) {
      const fullPhotoPath = path.join(this.uploadsPath, '../', data.photoUrl.replace(/^\//, ''));
      if (fs.existsSync(fullPhotoPath)) {
        const photoBuffer = await sharp(fullPhotoPath)
          .resize(340, 425, { fit: 'cover' })
          .toBuffer();
        layers.push({ input: photoBuffer, top: 290, left: 85 });
      }
    }

    // Ajouter le QR code à droite à la place de l'ancienne "ghost image"
    if (data.qrData) {
      const qrCodeBuffer = await QRCode.toBuffer(data.qrData, {
        type: 'png',
        width: 140,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' }
      });
      layers.push({ input: qrCodeBuffer, top: 655, left: 1160 });
    }

    // 3. Ajouter la signature
    if (data.signatureUrl) {
      const fullSigPath = path.join(this.uploadsPath, '../', data.signatureUrl.replace(/^\//, ''));
      if (fs.existsSync(fullSigPath)) {
        const sigBuffer = await sharp(fullSigPath)
          .resize(250, 100, { fit: 'inside' })
          .toBuffer();
        layers.push({ input: sigBuffer, top: 830, left: 155 });
      }
    }

    await sharp(template).composite(layers).toFile(outputPath);
  }

  private async drawVerso(data: any, outputPath: string) {
    const template = path.join(this.templatesPath, 'derriere.jpeg');

    const svgText = `
      <svg width="1497" height="937">
        <style>
          .val { font-family: sans-serif; font-weight: bold; fill: #1a1a1a; font-size: 40px; text-transform: uppercase; }
          .mrz { font-family: "OCR-B", "OCR B", "Courier New", monospace; font-size: 58px; fill: #000; font-weight: bold; }
          .nin-top { font-size: 40px; fill: #000; letter-spacing: 2px; }
        </style>
        
        <text x="720" y="160" class="val nin-top">${data.nin}</text>
        
        <text x="530" y="410" class="val">${this.escapeXml((data.lieuNaissance || '').toUpperCase())}</text>
        <text x="530" y="455" class="val">${this.escapeXml((data.region || '').toUpperCase())}</text>
        <text x="1160" y="462" class="val">${this.escapeXml((data.prefecture || '').toUpperCase())}</text>
        <text x="530" y="500" class="val">${this.escapeXml((data.sousPrefecture || '').toUpperCase())}</text>
        <text x="530" y="545" class="val">${this.escapeXml((data.quartier || '').toUpperCase())}</text>
        <text x="530" y="590" class="val">${this.escapeXml((data.secteurVillage || '').toUpperCase())}</text>

        <!-- MRZ Lines générées vectoriellement pour garantir la police OCR-B -->
        <g transform="translate(90, 665) scale(1, 1)">
          ${data.mrz && data.mrz[0] ? this.textToSVG.getSVG(data.mrz[0], { x: 0, y: 0, fontSize: 58, anchor: 'left top', attributes: { fill: '#000' } }) : ''}
        </g>
        <g transform="translate(90, 735) scale(1, 1)">
          ${data.mrz && data.mrz[1] ? this.textToSVG.getSVG(data.mrz[1], { x: 0, y: 0, fontSize: 58, anchor: 'left top', attributes: { fill: '#000' } }) : ''}
        </g>
        <g transform="translate(90, 805) scale(1, 1)">
          ${data.mrz && data.mrz[2] ? this.textToSVG.getSVG(data.mrz[2], { x: 0, y: 0, fontSize: 58, anchor: 'left top', attributes: { fill: '#000' } }) : ''}
        </g>
      </svg>
    `;

    await sharp(template)
      .composite([
        { input: Buffer.from(svgText), top: 0, left: 0 }
      ])
      .toFile(outputPath);
  }

  private escapeXml(unsafe: string): string {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&"']/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '"': return '&quot;';
        case "'": return '&apos;';
        default: return c;
      }
    });
  }

  private formatOfficialDate(date: Date): string {
    if (!date || isNaN(date.getTime())) return '---';
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const d = date.getDate().toString().padStart(2, '0');
    const m = months[date.getMonth()];
    const y = date.getFullYear();
    return `${d} ${m} ${y}`;
  }
}

export default new ImageService();
