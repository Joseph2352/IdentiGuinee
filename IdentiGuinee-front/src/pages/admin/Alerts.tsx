import React from 'react';

const Alerts: React.FC = () => {
  const alertsList = [
    { id: 1, type: 'critical', title: 'Intrusion détectée (Node 03)', desc: 'Tentative d\'altération du registre refusée par le consensus.', time: '10:42' },
    { id: 2, type: 'warning', title: 'Incohérence AFIS - Empreinte Fausse', desc: 'Le citoyen #GN-042 a fourni une empreinte correspondant à une autre identité.', time: '11:05' },
    { id: 3, type: 'info', title: 'Mise à jour du protocole réussie', desc: 'La version v2.4.0_STABLE est maintenant active sur tous les nœuds.', time: 'Hier' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-body max-w-4xl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-headline font-bold text-primary">Centre d'Alertes</h2>
          <p className="text-xs text-outline mt-1">Notifications système sécurisées de l'infrastructure IdentiGuinée</p>
        </div>
        <button className="text-xs font-bold text-outline hover:text-primary transition-colors">Tout marquer comme lu</button>
      </div>

      <div className="space-y-4">
        {alertsList.map((alert) => (
          <div key={alert.id} className={`bg-surface-container-lowest rounded-xl p-6 shadow-sm border-l-4 border flex items-start gap-4 ${
            alert.type === 'critical' ? 'border-l-error border-error/10 bg-error/5' : 
            alert.type === 'warning' ? 'border-l-secondary border-secondary/10' : 
            'border-l-primary border-primary/10'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              alert.type === 'critical' ? 'bg-error text-white' : 
              alert.type === 'warning' ? 'bg-secondary/20 text-secondary' : 
              'bg-primary/10 text-primary'
            }`}>
              <span className="material-symbols-outlined">
                {alert.type === 'critical' ? 'gpp_bad' : alert.type === 'warning' ? 'warning' : 'info'}
              </span>
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-bold ${alert.type === 'critical' ? 'text-error' : 'text-on-surface'}`}>{alert.title}</h4>
              <p className="text-xs text-on-surface-variant mt-1">{alert.desc}</p>
            </div>
            <span className="text-[10px] text-outline font-medium">{alert.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alerts;
