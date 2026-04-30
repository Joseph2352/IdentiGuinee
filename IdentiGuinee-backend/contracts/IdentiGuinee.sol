// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IdentiGuineeChain
 * @dev Smart contract pour la certification décentralisée des Cartes Nationales d'Identité de la Guinée.
 */
contract IdentiGuineeChain {

    struct Carte {
        string numeroCarte;     // Identifiant unique de la carte
        string nin;             // Numéro d'Identification National
        string hashDonnees;     // Empreinte SHA256 des données de la carte + photo
        string lieuDelivrance;  // Ville/Préfecture de délivrance
        uint256 dateExpiration; // Timestamp Unix d'expiration
        uint256 dateAncrage;    // Date d'enregistrement dans la blockchain
        bool existe;            // Pour vérification de présence
        bool revoquee;          // Pour gestion des pertes/vols
    }

    mapping(string => Carte) private cartes;
    mapping(address => bool) public autoritesAutorisees;
    address public proprietaire;

    event CarteCertifiee(string indexed numeroCarte, string nin, uint256 date);
    event CarteRevoquee(string indexed numeroCarte, uint256 date);

    modifier seulementAutorite() {
        require(autoritesAutorisees[msg.sender], "Acces refuse : Autorite non autorisee");
        _;
    }

    modifier seulementProprietaire() {
        require(msg.sender == proprietaire, "Acces refuse : Proprietaire uniquement");
        _;
    }

    constructor() {
        proprietaire = msg.sender;
        autoritesAutorisees[msg.sender] = true;
    }

    /**
     * @dev Ajoute une nouvelle autorité capable de certifier des cartes (ex: Police Nationale)
     */
    function ajouterAutorite(address autorite) public seulementProprietaire {
        autoritesAutorisees[autorite] = true;
    }

    /**
     * @dev Certifie une nouvelle carte d'identité sur la blockchain
     */
    function certifierCarte(
        string memory _numeroCarte,
        string memory _nin,
        string memory _hashDonnees,
        string memory _lieuDelivrance,
        uint256 _dateExpiration
    ) public seulementAutorite {
        require(!cartes[_numeroCarte].existe, "Cette carte est deja certifiee");

        cartes[_numeroCarte] = Carte({
            numeroCarte: _numeroCarte,
            nin: _nin,
            hashDonnees: _hashDonnees,
            lieuDelivrance: _lieuDelivrance,
            dateExpiration: _dateExpiration,
            dateAncrage: block.timestamp,
            existe: true,
            revoquee: false
        });

        emit CarteCertifiee(_numeroCarte, _nin, block.timestamp);
    }

    /**
     * @dev Révise le statut d'une carte (perte, vol, expiration)
     */
    function revoquerCarte(string memory _numeroCarte) public seulementAutorite {
        require(cartes[_numeroCarte].existe, "Carte non trouvee");
        cartes[_numeroCarte].revoquee = true;
        emit CarteRevoquee(_numeroCarte, block.timestamp);
    }

    /**
     * @dev Vérifie l'authenticité d'une carte
     */
    function verifierCarte(string memory _numeroCarte)
        public view returns (
            bool valide,
            string memory nin,
            string memory hashDonnees,
            bool revoquee,
            uint256 dateAncrage
        )
    {
        Carte memory c = cartes[_numeroCarte];

        if (!c.existe) {
            return (false, "", "", false, 0);
        }

        bool estValide = !c.revoquee && (c.dateExpiration > block.timestamp);

        return (estValide, c.nin, c.hashDonnees, c.revoquee, c.dateAncrage);
    }
}
