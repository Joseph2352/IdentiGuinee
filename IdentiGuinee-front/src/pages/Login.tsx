import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import AuthLayout from '../components/auth/AuthLayout';

const Login: React.FC = () => {
  const [authMethod, setAuthMethod] = useState<'nin' | 'email'>('email');
  const [showSuccess, setShowSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedUser, setLoggedUser] = useState<any>(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.login({ identifier: email, password });
      setLoggedUser(response.data.user);
      login(response.data.token, response.data.user);
      
      setShowSuccess(true);
      setTimeout(() => setProgress(100), 100);
      setTimeout(() => {
        if (response.data.user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/citizen/dashboard');
        }
      }, 2500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const togglePass = (id: string) => {
    const el = document.getElementById(id) as HTMLInputElement;
    if (el) el.type = el.type === 'password' ? 'text' : 'password';
  };

  return (
    <AuthLayout 
      activeTab="login" 
      onTabChange={(tab) => {
        if (tab === 'signup') navigate('/register');
      }}
    >
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h2 className="text-xl font-title font-bold text-gray-800">Bienvenue</h2>
          <p className="text-xs text-gray-500">Choisissez votre méthode de connexion</p>
        </div>

        {/* Auth Method Tabs */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-4">
          {['nin', 'email'].map((method) => (
            <button 
              key={method}
              onClick={() => setAuthMethod(method as any)}
              className={`flex-1 py-2 text-xs font-bold rounded transition-all ${authMethod === method ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              {method === 'nin' ? 'NIN + Date' : 'Email'}
            </button>
          ))}
        </div>

        {/* Method: NIN */}
        {authMethod === 'nin' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">NIN (15 chiffres) / National ID Number</label>
              <input className="w-full px-4 py-4 bg-[#F9FAFB] border border-gray-200 rounded-lg text-lg font-mono outline-none focus:border-primary" placeholder="X XXXX XXXXXXX X" type="text"/>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Date de Naissance / Date of Birth</label>
              <div className="grid grid-cols-3 gap-2">
                <select className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-3 text-sm outline-none h-12 text-gray-700 shadow-sm"><option>Jour</option></select>
                <select className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-3 text-sm outline-none h-12 text-gray-700 shadow-sm"><option>Mois</option></select>
                <select className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-3 text-sm outline-none h-12 text-gray-700 shadow-sm"><option>Année</option></select>
              </div>
            </div>
            <button disabled={loading} className="w-full bg-primary text-white font-bold py-4 rounded-lg shadow-lg hover:bg-green-800 transition-all">
              {loading ? 'CHARGEMENT...' : 'ACCÉDER À MON ESPACE'}
            </button>
          </form>
        )}

        {/* Method: Email */}
        {authMethod === 'email' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">E-mail</label>
              <input 
                className="w-full px-4 py-4 bg-[#F9FAFB] border border-gray-200 rounded-lg outline-none focus:border-primary" 
                placeholder="nom@exemple.gn" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Mot de passe / Password</label>
              <div className="relative">
                <input 
                  id="login-pass" 
                  className="w-full px-4 py-4 bg-[#F9FAFB] border border-gray-200 rounded-lg outline-none focus:border-primary" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  onClick={() => togglePass('login-pass')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 hover:text-primary" 
                  type="button"
                >
                  visibility
                </button>
              </div>
            </div>
            <button disabled={loading} className="w-full bg-primary text-white font-bold py-4 rounded-lg shadow-lg hover:bg-green-800 transition-all">
              {loading ? 'CHARGEMENT...' : 'CONNEXION'}
            </button>
            <div className="text-center">
              <a className="text-xs text-gray-400 hover:text-primary" href="#">Mot de passe oublié ?</a>
            </div>
          </form>
        )}
      </div>

      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 bg-primary/95 z-[500] flex flex-col items-center justify-center text-white p-8 animate-fadeIn">
          <div className="w-full max-w-md text-center space-y-8">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(255,255,255,0.2)]">
              <span className="material-symbols-outlined text-primary text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-title font-bold">
                Bienvenue, {loggedUser?.role === 'ADMIN' ? 'Administrateur' : 'Citoyen'}
              </h3>
              <p className="text-white/80">
                {loggedUser?.role === 'ADMIN' ? 'Authentification système réussie.' : 'Authentification souveraine réussie.'}
              </p>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-accent transition-all duration-[2000ms] ease-out" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60">
              Redirection vers votre espace {loggedUser?.role === 'ADMIN' ? 'administration' : 'citoyen'}...
            </p>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default Login;
