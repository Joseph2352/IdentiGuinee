export const NAISSANCE_CHAIN_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "numeroCarte",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "nin",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "date",
        "type": "uint256"
      }
    ],
    "name": "CarteCertifiee",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "numeroCarte",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "date",
        "type": "uint256"
      }
    ],
    "name": "CarteRevoquee",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "autorite",
        "type": "address"
      }
    ],
    "name": "ajouterAutorite",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "autoritesAutorisees",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_numeroCarte",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_nin",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_hashDonnees",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_lieuDelivrance",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_dateExpiration",
        "type": "uint256"
      }
    ],
    "name": "certifierCarte",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proprietaire",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_numeroCarte",
        "type": "string"
      }
    ],
    "name": "revoquerCarte",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_numeroCarte",
        "type": "string"
      }
    ],
    "name": "verifierCarte",
    "outputs": [
      {
        "internalType": "bool",
        "name": "valide",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "nin",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "hashDonnees",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "revoquee",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "dateAncrage",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
