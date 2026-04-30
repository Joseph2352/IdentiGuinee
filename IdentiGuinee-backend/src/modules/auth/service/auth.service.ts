import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authRepository from '../repository/auth.repository.js';

class AuthService {
  async register(data: { 
    telephone: string; 
    email?: string; 
    password: string; 
    nom: string; 
    prenom: string;
    sexe: 'M' | 'F';
    dateNaissance: Date | string;
    lieuNaissance: string;
    nin?: string;
  }) {
    const existing = await authRepository.findByTelephone(data.telephone);
    if (existing) throw new Error('Ce numéro de téléphone est déjà utilisé');

    if (data.email) {
      const emailExists = await authRepository.findByEmail(data.email);
      if (emailExists) throw new Error('Cet email est déjà utilisé');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await authRepository.create({
      telephone: data.telephone,
      email: data.email,
      passwordHash,
      nom: data.nom,
      prenom: data.prenom,
      sexe: data.sexe,
      dateNaissance: new Date(data.dateNaissance),
      lieuNaissance: data.lieuNaissance,
      nin: data.nin
    });

    const token = this.generateToken(user.id, user.role);
    return { token, user: { id: user.id, telephone: user.telephone, role: user.role } };
  }

  async login(identifier: string, password: string) {
    // Try by telephone first, then by email
    let user = await authRepository.findByTelephone(identifier);
    if (!user) user = await authRepository.findByEmail(identifier);
    if (!user) throw new Error('Identifiant ou mot de passe incorrect');

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new Error('Identifiant ou mot de passe incorrect');

    const token = this.generateToken(user.id, user.role);
    return {
      token,
      user: { id: user.id, email: user.email, telephone: user.telephone, role: user.role },
    };
  }

  async validateToken(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) throw new Error('Utilisateur non trouvé');
    return user;
  }

  private generateToken(userId: string, role: string): string {
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
  }
}

export default new AuthService();
