# 🇬🇳 IdentiGuinée - Portail National des Cartes d'Identité

**IdentiGuinée** est une plateforme administrative de pointe dédiée à la modernisation du cycle de vie des **Cartes Nationales d'Identité (CNI)** en République de Guinée. Le système sécurise chaque titre d'identité par un ancrage sur la **Blockchain**, garantissant une authenticité infalsifiable et une vérification instantanée.

## 🚀 Fonctionnalités Clés

### 👤 Espace Citoyen
- **Demande de CNI** : Formulaire de demande complet avec upload de l'extrait de naissance (justificatif requis).
- **Signature & Photo** : Capture et gestion sécurisée de la photo d'identité et de la signature du citoyen.
- **Vérification d'Extrait** : Champ dédié pour le numéro d'extrait de naissance afin de faciliter l'examen administratif.
- **Portefeuille Numérique** : Accès à la version numérique certifiée de la CNI avec QR Code d'authentification.

### 🛡️ Espace Administration (Super-utilisateur)
- **Tableau de Bord KPI** : Statistiques en temps réel sur les demandes reçues, traitées et le taux de délivrance.
- **Validation Multi-Étapes** : Système de gestion des demandes (Soumise, Vérification, Production, Délivrée).
- **Détails du Dossier** : Visualisation des pièces justificatives et simulation de vérification d'extrait.
- **Registre National** : Consultation de l'annuaire des citoyens identifiés sur la plateforme.

### ⛓️ Intégration Blockchain (IdentiGuineeChain)
- **Ancrage Cryptographique** : Pour chaque carte émise, une empreinte unique (Hash Keccak-256) des données d'identité est stockée sur la blockchain Ethereum (Sepolia).
- **Preuve d'Intégrité** : Le contrat intelligent `IdentiGuineeChain.sol` stocke le NIN, le numéro de carte et le hash des données, rendant toute altération physique du document détectable.
- **Gestion du Cycle de Vie** : Support natif pour la **révocation** de cartes (perte/vol) et la gestion des dates d'expiration directement sur le ledger.

## 🛠️ Stack Technique

- **Frontend** : React 19, Vite, Tailwind CSS, Framer Motion, Chart.js.
- **Backend** : Node.js (Express), Prisma ORM, PostgreSQL.
- **Smart Contracts** : Solidity (^0.8.20), déployé sur Sepolia Testnet.
- **Services** : Ethers.js (interaction blockchain), PDFKit (génération CNI), Sharp (traitement d'image).

## 📦 Installation et Démarrage

### 1. Configuration du Backend
```bash
cd IdentiGuinee-backend
npm install
```
Configurez votre `.env` :
```env
DATABASE_URL="postgresql://user:password@localhost:5432/identiguinee"
PORT=4000
JWT_SECRET=votre_secret
RPC_URL=votre_noeud_sepolia
PRIVATE_KEY=votre_cle_privee_autorite
CONTRACT_ADDRESS=0x...
```
Initialisez la base :
```bash
npx prisma generate
npx prisma db push
npm run dev
```

### 2. Configuration du Frontend
```bash
cd IdentiGuinee-front
npm install
npm run dev
```

---
© 2026 IdentiGuinée - Ministère de l'Administration du Territoire et de la Décentralisation.
