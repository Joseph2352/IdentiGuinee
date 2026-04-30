import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-body max-w-4xl">
      <div>
        <h2 className="text-2xl font-headline font-bold text-primary">Paramètres Système</h2>
        <p className="text-xs text-outline mt-1">Configuration générale et sécurité de l'infrastructure IdentiGuinée</p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="border-b border-outline-variant/10 px-6 py-4">
          <h3 className="text-sm font-bold text-on-surface">Configuration du Réseau Blockchain</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-on-surface">Synchronisation des nœuds</p>
              <p className="text-xs text-outline">Gérer la fréquence des requêtes (ping) vers les nœuds décentralisés.</p>
            </div>
            <select className="bg-surface-container-low border-none rounded-lg text-sm px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20">
              <option>Temps réel (1s)</option>
              <option>Standard (5s)</option>
              <option>Économie d'énergie</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-on-surface">Déploiement Automatique (Smart Contracts)</p>
              <p className="text-xs text-outline">Autoriser le système à auto-valider les identités biométriques sans supervision.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-outline-variant/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden text-error">
        <div className="border-b border-error/10 px-6 py-4 bg-error/5">
          <h3 className="text-sm font-bold">Zone de danger</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">Arrêt d'urgence du Mainnet</p>
              <p className="text-xs text-error/70">Suspend tous les ancrages blockchain et repasse en mode hors-ligne.</p>
            </div>
            <button className="bg-error text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-error/90 transition-colors">
              Purger le cache & Suspendre
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
