import { ethers } from 'ethers';
import { NAISSANCE_CHAIN_ABI } from '../constants/abi.js';
import dotenv from 'dotenv';

dotenv.config();

class BlockchainService {
  private provider!: ethers.JsonRpcProvider;
  private wallet!: ethers.Wallet;
  private contract!: ethers.Contract;

  constructor() {
    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!rpcUrl || !privateKey || !contractAddress) {
      console.warn('Configuration blockchain incomplète dans le fichier .env');
      // On initialise à null pour éviter de crash au démarrage si les clés manquent
      this.provider = null as any;
      this.wallet = null as any;
      this.contract = null as any;
      return;
    }

    try {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      this.contract = new ethers.Contract(contractAddress, NAISSANCE_CHAIN_ABI, this.wallet);
      console.log('Blockchain Service initialisé avec succès sur l\'adresse:', contractAddress);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du Blockchain Service:', error);
    }
  }

  /**
   * Certifie une carte d'identité sur la blockchain
   */
  async certifierCarte(numeroCarte: string, nin: string, hashDonnees: string, lieuDelivrance: string, dateExpiration: number) {
    if (!this.contract) throw new Error('Blockchain Service non initialisé');

    try {
      console.log(`Certification de la carte ${numeroCarte} sur la blockchain...`);
      const tx = await this.contract.certifierCarte(numeroCarte, nin, hashDonnees, lieuDelivrance, dateExpiration);
      
      console.log('Transaction envoyée:', tx.hash);
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error: any) {
      console.error('Erreur lors de la certification blockchain:', error);
      throw new Error(`Échec de la certification blockchain: ${error.message}`);
    }
  }

  /**
   * Vérifie une carte sur la blockchain
   */
  async verifierCarte(numeroCarte: string) {
    if (!this.contract) throw new Error('Blockchain Service non initialisé');

    try {
      const result = await this.contract.verifierCarte(numeroCarte);
      return {
        valide: result.valide,
        nin: result.nin,
        hashDonnees: result.hashDonnees,
        revoquee: result.revoquee,
        dateAncrage: Number(result.dateAncrage)
      };
    } catch (error: any) {
      console.error('Erreur lors de la vérification blockchain:', error);
      throw new Error(`Échec de la vérification blockchain: ${error.message}`);
    }
  }

  /**
   * Génère un hash déterministe à partir des données de la carte
   */
  generateDataHash(data: {
    numeroCarte: string;
    nin: string;
    nom: string;
    prenom: string;
    dateNaissance: Date | string;
    lieuNaissance: string;
    dateExpiration: Date | string;
  }) {
    const format = (d: Date | string) => {
      if (typeof d === 'string') return d.split('T')[0];
      return d.toISOString().split('T')[0];
    };

    const normalized = [
      data.numeroCarte.toUpperCase(),
      data.nin,
      data.nom.toUpperCase(),
      data.prenom.toUpperCase(),
      format(data.dateNaissance),
      data.lieuNaissance.toUpperCase(),
      format(data.dateExpiration)
    ].join('|');

    return ethers.keccak256(ethers.toUtf8Bytes(normalized));
  }

  /**
   * Obtient le nombre total d'actes ancrés
   */
  async getTotalActes() {
    if (!this.contract) return 0;
    try {
       const total = await this.contract.totalActes();
       return Number(total);
    } catch (error) {
      return 0;
    }
  }
}

export default new BlockchainService();
