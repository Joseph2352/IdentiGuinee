import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';

interface RegisterFormProps {
}

const RegisterForm: React.FC<RegisterFormProps> = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    sexe: 'M' as 'M' | 'F',
    dateNaissance: '',
    lieuNaissance: '',
    password: '',
    confirmPassword: '',
    agree: false
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Les mots de passe ne correspondent pas');
    }
    if (!formData.agree) {
      return toast.error('Veuillez accepter les conditions');
    }

    setLoading(true);
    try {
      const response = await authService.register({
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email,
        telephone: formData.telephone,
        sexe: formData.sexe,
        dateNaissance: formData.dateNaissance,
        lieuNaissance: formData.lieuNaissance,
        password: formData.password
      });
      
      // Connexion automatique avec le token reçu
      login(response.data.token, response.data.user);
      
      toast.success('Compte créé avec succès !');
      
      // Redirection directe vers le dashboard citoyen
      navigate('/citizen/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Compte', icon: 'person' },
    { id: 2, title: 'Identité', icon: 'badge' },
    { id: 3, title: 'Sécurité', icon: 'security' }
  ];

  return (
    <div className="space-y-6">
      {/* Stepper Header */}
      <div className="flex justify-between items-center mb-4 px-4 child:transition-all">
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s.id ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                <span className="material-symbols-outlined text-sm">{step > s.id ? 'check' : s.icon}</span>
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider ${step >= s.id ? 'text-primary' : 'text-gray-400'}`}>{s.title}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-[2px] mb-3 transition-all ${step > s.id ? 'bg-primary' : 'bg-gray-200'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Prénom(s)</label>
                  <input 
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    required
                    className="w-full p-2.5 bg-[#F9FAFB] border border-gray-200 rounded text-sm outline-none focus:border-primary" 
                    type="text"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Nom</label>
                  <input 
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    className="w-full p-2.5 bg-[#F9FAFB] border border-gray-200 rounded text-sm outline-none focus:border-primary" 
                    type="text"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">E-mail</label>
                <input 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-[#F9FAFB] border border-gray-200 rounded text-sm outline-none focus:border-primary" 
                  type="email"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Téléphone (Obligatoire)</label>
                <input 
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  required
                  placeholder="+224 ..."
                  className="w-full p-2.5 bg-[#F9FAFB] border border-gray-200 rounded text-sm outline-none focus:border-primary" 
                  type="tel"
                />
              </div>
              <button 
                type="button" 
                onClick={nextStep}
                className="w-full bg-primary text-white font-bold py-4 rounded-lg shadow-lg hover:bg-green-800 transition-all mt-4 flex items-center justify-center gap-2"
              >
                SUIVANT <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1.5">Sexe</label>
                <div className="flex gap-3">
                  <label className={`flex-1 flex items-center justify-center gap-2 p-2.5 border rounded-lg cursor-pointer transition-all ${formData.sexe === 'M' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500'}`}>
                    <input type="radio" name="sexe" value="M" checked={formData.sexe === 'M'} onChange={handleChange} className="hidden" />
                    <span className="material-symbols-outlined text-sm">male</span> Masculin
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 p-2.5 border rounded-lg cursor-pointer transition-all ${formData.sexe === 'F' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500'}`}>
                    <input type="radio" name="sexe" value="F" checked={formData.sexe === 'F'} onChange={handleChange} className="hidden" />
                    <span className="material-symbols-outlined text-sm">female</span> Féminin
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Date de naissance</label>
                  <input 
                    name="dateNaissance"
                    value={formData.dateNaissance}
                    onChange={handleChange}
                    required
                    className="w-full p-2.5 bg-[#F9FAFB] border border-gray-200 rounded text-sm outline-none focus:border-primary" 
                    type="date"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Lieu de naissance</label>
                  <input 
                    name="lieuNaissance"
                    value={formData.lieuNaissance}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Conakry"
                    className="w-full p-2.5 bg-[#F9FAFB] border border-gray-200 rounded text-sm outline-none focus:border-primary" 
                    type="text"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button 
                  type="button" 
                  onClick={prevStep}
                  className="flex-1 border border-gray-200 text-gray-500 font-bold py-4 rounded-lg hover:bg-gray-50 transition-all"
                >
                  RETOUR
                </button>
                <button 
                  type="button" 
                  onClick={nextStep}
                  className="flex-[2] bg-primary text-white font-bold py-4 rounded-lg shadow-lg hover:bg-green-800 transition-all"
                >
                  CONTINUER
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Mot de passe</label>
                <input 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 bg-[#F9FAFB] border border-gray-200 rounded text-sm outline-none focus:border-primary" 
                  type="password"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Confirmer le mot de passe</label>
                <input 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 bg-[#F9FAFB] border border-gray-200 rounded text-sm outline-none focus:border-primary" 
                  type="password"
                />
              </div>
              <div className="flex items-start gap-2 pt-2">
                <input 
                  type="checkbox" 
                  name="agree"
                  checked={formData.agree}
                  onChange={handleChange}
                  required
                  className="mt-1 rounded text-primary focus:ring-primary" 
                />
                <p className="text-[10px] text-gray-500">J'accepte que mes données soient traitées par le MATD pour la création de mon identité sécurisée.</p>
              </div>
              <div className="flex gap-4 mt-6">
                <button 
                  type="button" 
                  onClick={prevStep}
                  className="flex-1 border border-gray-200 text-gray-500 font-bold py-4 rounded-lg hover:bg-gray-50 transition-all"
                >
                  RETOUR
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-[2] bg-primary text-white font-bold py-4 rounded-lg shadow-lg hover:bg-green-800 transition-all"
                >
                  {loading ? 'CRÉATION EN COURS...' : 'CRÉER MON COMPTE'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};

export default RegisterForm;
