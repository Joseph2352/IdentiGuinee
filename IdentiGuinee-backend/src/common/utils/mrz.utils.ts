/**
 * Utilitaire pour générer les codes MRZ (Machine Readable Zone) au standard OACI 9303 (TD1 - 3 lignes de 30 caractères)
 */

export class MRZUtils {
  private static WEIGHTS = [7, 3, 1];

  /**
   * Calcule le chiffre de contrôle OACI pour une chaîne donnée
   */
  static calculateCheckDigit(str: string): number {
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      let value = 0;

      if (char >= '0' && char <= '9') {
        value = parseInt(char);
      } else if (char >= 'A' && char <= 'Z') {
        value = char.charCodeAt(0) - 55;
      } else if (char === '<') {
        value = 0;
      }

      sum += value * this.WEIGHTS[i % 3];
    }
    return sum % 10;
  }

  /**
   * Formate une date au format YYMMDD
   */
  static formatDate(date: Date): string {
    const y = date.getFullYear().toString().slice(-2);
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}${m}${d}`;
  }

  /**
   * Nettoie et formate une chaîne de caractères (majuscules, remplace espaces par <)
   */
  static cleanString(str: string, length: number): string {
    return str
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^A-Z0-9]/g, '<')
      .padEnd(length, '<')
      .slice(0, length);
  }

  /**
   * Génère les 3 lignes MRZ pour une Carte d'Identité TD1
   */
  static generateTD1(data: {
    numeroCarte: string;
    nin: string;
    dateNaissance: Date;
    sexe: 'M' | 'F';
    dateExpiration: Date;
    nom: string;
    prenom: string;
    nationalite?: string;
  }): string[] {
    const country = 'GIN';
    // Sur les cartes guinéennes, la nationalité est GIN pour les citoyens
    const nationality = 'GIN';

    // Nettoyer le numéro de carte pour ne garder que les chiffres si c'est le cas
    const cleanNum = data.numeroCarte.replace(/[^0-9]/g, '');
    
    // Structure Guinéenne pour la Ligne 1 : I<GIN + Part1(9) + < + Part2(7) + CheckDigitFull(1) + Padding(7)
    // On prend les 9 premiers caractères
    const docNumPart1 = this.cleanString(cleanNum.slice(0, 9), 9);
    // On prend les 7 suivants (jusqu'au 16ème)
    const docNumPart2 = this.cleanString(cleanNum.slice(9, 16), 7);
    // Le checksum est calculé sur l'intégralité du numéro (souvent 16 chiffres)
    const docNumCheck = this.calculateCheckDigit(cleanNum.slice(0, 16));
    
    const line1 = `I<${country}${docNumPart1}<${docNumPart2}${docNumCheck}<<<<<<<`;

    // Ligne 2 : Birth(6)+Check(1)+Sex(1)+Expiry(6)+Check(1)+Nationality(3)+Optional(11)+CompositeCheck(1)
    const birth = this.formatDate(data.dateNaissance);
    const birthCheck = this.calculateCheckDigit(birth);
    const sex = data.sexe === 'M' ? 'M' : 'F';
    const expiry = this.formatDate(data.dateExpiration);
    const expiryCheck = this.calculateCheckDigit(expiry);
    
    const optionalLine2 = this.cleanString('', 11);

    // Calcul du Composite Check Digit (Position 30 de la ligne 2)
    // Standard OACI 9303 : inclut docNum + check + opt1 + birth + check + expiry + check + opt2
    // Dans le cas guinéen, on simplifie pour correspondre au modèle :
    const compositeStr = docNumPart1 + '1' + docNumPart2 + docNumCheck + '<<<<<<< ' + birth + birthCheck + expiry + expiryCheck + optionalLine2;
    // Note: Le '1' est le placeholder pour le check digit absent à la pos 15 de L1.
    const compositeCheck = this.calculateCheckDigit(compositeStr.replace(/ /g, ''));
    
    const line2 = `${birth}${birthCheck}${sex}${expiry}${expiryCheck}${nationality}${optionalLine2}${compositeCheck}`;

    // Ligne 3 : Nom<<Prénom (rempli par < jusqu'à 30)
    const formattedName = (data.nom.toUpperCase() + '<<' + data.prenom.toUpperCase()).replace(/ /g, '<');
    const line3 = this.cleanString(formattedName, 30);

    return [line1, line2, line3];
  }
}
