import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration & Common
import prisma, { testConnection } from './common/config/prisma.js';
import { errorHandler } from './common/middlewares/error.middleware.js';

// Modules
import authRoutes from './modules/auth/router/auth.router.js';
import citoyenRoutes from './modules/citoyens/router/citoyen.router.js';
import demandeRoutes from './modules/demandes/router/demande.router.js';
import blockchainRoutes from './modules/blockchain/router/blockchain.router.js';
import verificationRoutes from './modules/verifications/router/verification.router.js';
import geoRoutes from './modules/geo/router/geo.router.js';
import carteRoutes from './modules/cartes/router/carte.router.js';
import { runSeed } from './scripts/seed.js';

const app = express();

// --- Configuration ---
const defaultOrigin = 'http://localhost:5173';
const allowedOrigin = (process.env.CORS_ORIGIN || defaultOrigin).trim();

// 1. GLOBAL CORS (Including Static Handler)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === allowedOrigin) {
        callback(null, true);
      } else {
        console.warn(`CORS: origin ${origin} not in whitelist (${allowedOrigin})`);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// 2. Specialized static file serving (Bypass Direct PDF Access)
app.use('/uploads', (req, res, next) => {
  // If someone tries to access a PDF directly via the static route, we block it
  // to prevent IDM and other download managers from hijacking it.
  if (req.path.toLowerCase().endsWith('.pdf')) {
    return res.status(403).json({ 
      success: false, 
      message: 'Accès direct interdit. Utilisez la route sécurisée /api/demandes/document/:filename' 
    });
  }
  
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
}, express.static(path.join(__dirname, '../uploads')));

// --- Routes ---

// Health Check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    project: 'IdentiGuinée API',
    time: new Date().toISOString(),
    database: 'prisma/postgresql',
  });
});

// Auth
app.use('/api/auth', authRoutes);

// API Modules
app.use('/api/citoyens', citoyenRoutes);
app.use('/api/demandes', demandeRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/verifications', verificationRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/cartes', carteRoutes);

// --- Error Handling ---
app.use(errorHandler);

// --- Bootstrap ---
const port = Number(process.env.PORT || 4000);

async function boot() {
  // Test DB Connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('❌ Impossible de démarrer le serveur sans connexion à la base de données.');
    process.exit(1);
  }

  // Auto-seed Data
  await runSeed();

  // Auto-create/Update Admin User
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    
    await prisma.user.upsert({
      where: { email: process.env.ADMIN_EMAIL },
      update: {
        telephone: '+224627377818',
        passwordHash,
        role: 'ADMIN',
      },
      create: {
        email: process.env.ADMIN_EMAIL,
        telephone: '+224627377818',
        passwordHash,
        role: 'ADMIN',
        isVerified: true,
      },
    });
    console.log('✅ Synchronisation de l\'admin terminée:', process.env.ADMIN_EMAIL);
  }

  app.listen(port, () => {
    console.log(`\n🇬🇳 ═══════════════════════════════════════════`);
    console.log(`   IdentiGuinée API démarrée`);
    console.log(`   Port: ${port}`);
    console.log(`   URL:  http://localhost:${port}`);
    console.log(`   CORS: ${allowedOrigin}`);
    console.log(`═══════════════════════════════════════════════\n`);
  });
}

boot().catch((err) => {
  console.error('💥 Erreur fatale au démarrage:', err);
  process.exit(1);
});
