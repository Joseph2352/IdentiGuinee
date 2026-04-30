import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
// @ts-ignore
import solc from 'solc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

/**
 * Script de déploiement automatique du contrat IdentiGuineeChain
 */
async function main() {
  console.log('--- Début du déploiement IdentiGuineeChain ---');

  // 1. Charger le code source Solidity
  const contractPath = path.resolve(__dirname, '../../contracts/IdentiGuinee.sol');
  const source = fs.readFileSync(contractPath, 'utf8');

  // 2. Préparer l'entrée pour le compilateur solc
  const input = {
    language: 'Solidity',
    sources: {
      'IdentiGuinee.sol': {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode'],
        },
      },
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  };

  console.log('Compilation du contrat...');
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  // Vérifier les erreurs de compilation
  if (output.errors) {
    output.errors.forEach((err: any) => {
      console.error(err.formattedMessage);
    });
    if (output.errors.some((err: any) => err.severity === 'error')) {
      throw new Error('Erreur de compilation Solidity');
    }
  }

  const contractName = 'IdentiGuineeChain';
  const contractData = output.contracts['IdentiGuinee.sol'][contractName];
  const abi = contractData.abi;
  const bytecode = contractData.evm.bytecode.object;

  console.log('Compilation réussie !');

  // 3. Configuration Ethers
  const rpcUrl = process.env.RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    throw new Error('RPC_URL ou PRIVATE_KEY manquants dans le .env');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log(`Déploiement depuis l'adresse: ${wallet.address}`);
  const balance = await provider.getBalance(wallet.address);
  console.log(`Solde du compte: ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    throw new Error('Solde insuffisant pour le déploiement sur Sepolia');
  }

  // 4. Déploiement
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  console.log('Envoi de la transaction de déploiement...');
  
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('✅ Contrat déployé à l\'adresse:', address);

  // 5. Sauvegarder l'adresse dans le .env
  const envPath = path.resolve(__dirname, '../../.env');
  let envContent = fs.readFileSync(envPath, 'utf8');

  if (envContent.includes('CONTRACT_ADDRESS=')) {
    envContent = envContent.replace(/CONTRACT_ADDRESS=.*/, `CONTRACT_ADDRESS=${address}`);
  } else {
    envContent += `\nCONTRACT_ADDRESS=${address}`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log('Mise à jour du fichier .env effectuée.');

  // 6. Sauvegarder l'ABI pour le frontend/backend
  const abiPath = path.resolve(__dirname, '../modules/blockchain/constants/abi.ts');
  const abiContent = `export const NAISSANCE_CHAIN_ABI = ${JSON.stringify(abi, null, 2)};\n`;
  fs.writeFileSync(abiPath, abiContent);
  console.log('ABI mise à jour dans src/modules/blockchain/constants/abi.ts');

  console.log('--- Fin du déploiement ---');
}

main().catch((error) => {
  console.error('Erreur fatale lors du déploiement:', error);
  process.exit(1);
});