import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Hero from '../components/home/Hero';
import { HomeCarousel } from '../components/home/HomeCarousel';
import StatsBar from '../components/home/StatsBar';
import Reveal from '../components/animations/Reveal';

// ─── Data ────────────────────────────────────────────────────────────────────

const PROBLEMS = [
  {
    icon: "payments",
    color: "bg-tertiary/10 text-tertiary",
    title: "L'extorsion systémique",
    stat: "42%",
    statLabel: "ont payé un pot-de-vin en un an",
    desc: "Pour un extrait de naissance, un passeport ou une carte d'électeur, près de la moitié des usagers font face à des demandes de pots-de-vin. Le Global Corruption Barometer confirme l'ampleur du racket administratif.",
    source: "Transparency International, 2025",
  },
  {
    icon: "file_copy_off",
    color: "bg-error/10 text-error",
    title: "La fraude documentaire généralisée",
    stat: "60%",
    statLabel: "des actes présentés aux consulats sont frauduleux",
    desc: "La fraude est si massive que la France a émis une note officielle recommandant de rejeter systématiquement tout acte de naissance guinéen. Des réseaux organisés vendent de faux documents à Conakry depuis des décennies.",
    source: "Sénat français — Rapport officiel",
  },
  {
    icon: "folder_delete",
    color: "bg-secondary/10 text-secondary",
    title: "Des archives vulnérables",
    stat: "2%",
    statLabel: "seulement possèdent un acte de mariage ou de décès",
    desc: "Les registres papier sont détruits par des incendies et des actes de vandalisme. Des actes entiers disparaissent des archives locales, laissant des citoyens sans preuves de leur identité légale.",
    source: "Enabel / Union Européenne, 2023",
  },
  {
    icon: "school",
    color: "bg-primary/10 text-primary",
    title: "L'exclusion en cascade",
    stat: "14M",
    statLabel: "de Guinéens privés d'accès garanti à leurs droits",
    desc: "Sans extrait de naissance, pas de scolarisation. Sans identité, pas de compte bancaire. Sans papiers, pas d'emploi formel. L'échec de l'état civil produit une exclusion totale qui touche les plus vulnérables en premier.",
    source: "Enabel / UE — Objectif national",
  },
];

const SOLUTION_CARDS = [
  {
    icon: "smartphone",
    title: "Portail citoyen universel",
    desc: "Soumettez votre demande depuis n'importe quel smartphone ou point numérique communautaire — sans vous déplacer à la préfecture, sans intermédiaire.",
    tag: "Accessibilité",
  },
  {
    icon: "auto_awesome",
    title: "Vérification assistée",
    desc: "Le smart contract aide l'administration à croiser votre demande avec NaissanceChain. Une validation sécurisée qui réduit drastiquement les risques de corruption.",
    tag: "Sécurité",
  },
  {
    icon: "qr_code_2",
    title: "Document certifié QR",
    desc: "Un titre d'identité avec identifiant blockchain unique et QR code. Vérifiable par n'importe quelle institution en 3 secondes — falsification impossible.",
    tag: "Blockchain",
  },
];

const STEPS = [
  { n: "01", t: "Créer un compte", d: "Inscription sécurisée par OTP via numéro guinéen. Aucun déplacement requis.", icon: "person_add" },
  { n: "02", t: "Remplir le formulaire", d: "Vos données d'état civil — nom, date et lieu de naissance, filiation.", icon: "edit_document" },
  { n: "03", t: "Uploader vos pièces", d: "Photo d'identité et justificatifs numériques depuis votre téléphone.", icon: "upload_file" },
  { n: "04", t: "Validation Admin", d: "L'administration vérifie vos pièces et valide l'ancrage de votre identité sur la blockchain.", icon: "admin_panel_settings" },
  { n: "05", t: "Document reçu", d: "CNI numérique avec signature cryptographique en 48h — sans aucun pot-de-vin.", icon: "task_alt" },
];

const COMPARISON = [
  {
    critere: "Coût pour le citoyen",
    ancien: "Variable + extorsions informelles (jusqu'à +500%)",
    nouveau: "Tarif fixe et transparent, publié sur le portail",
    win: true,
  },
  {
    critere: "Délai de délivrance",
    ancien: "30 à 90 jours (avec pots-de-vin)",
    nouveau: "48 à 72 heures — validation administrative certifiée par blockchain",
    win: true,
  },
  {
    critere: "Lieu de demande",
    ancien: "Préfecture physique — déplacement obligatoire",
    nouveau: "Partout — smartphone, web, point numérique communautaire",
    win: true,
  },
  {
    critere: "Risque de fraude",
    ancien: "Critique — 60% des actes frauduleux (Sénat français)",
    nouveau: "Nul — signature cryptographique vérifiable en 3 secondes",
    win: true,
  },
  {
    critere: "Conservation des archives",
    ancien: "Registres papier — vulnérables au feu, aux pertes",
    nouveau: "Blockchain immuable — aucune perte possible",
    win: true,
  },
];

const PERSONAS = [
  {
    icon: "person",
    role: "Le Citoyen ordinaire",
    quote: "Je n'ai plus besoin de payer un intermédiaire ni de faire des kilomètres pour obtenir ma carte d'identité. Je l'ai demandée depuis mon téléphone à Labé et reçue en 48h.",
    impact: "Économise jusqu'à 500 000 GNF en frais informels",
  },
  {
    icon: "account_balance",
    role: "L'Administration publique",
    quote: "Mon travail est simplifié par la pré-vérification des dossiers. Je peux valider les demandes en un clic — le système garantit l'intégrité des données.",
    impact: "Réduction de 75% du temps de traitement",
  },
  {
    icon: "account_balance_wallet",
    role: "Les Banques & Fintech",
    quote: "Le KYC est désormais instantané et sûr. La vérification blockchain d'une identité guinéenne ouvre le crédit à des millions de citoyens non bancarisés.",
    impact: "Accès au crédit pour les non-bancarisés",
  },
  {
    icon: "volunteer_activism",
    role: "Les ONG & Humanitaire",
    quote: "Nous pouvons distribuer l'aide humanitaire sans risque de doublons ni de fraudes. Chaque bénéficiaire est une identité vérifiée et unique dans la blockchain.",
    impact: "Distribution d'aide ciblée et sans doublons",
  },
];

const ROADMAP = [
  {
    phase: "PHASE 01",
    title: "Lancement Pilote",
    desc: "Déploiement sur Conakry, Kindia et Labé. Intégration avec NaissanceChain et les registres civils locaux. Test avec 12 000 citoyens bêta.",
    date: "Q3 2024",
    done: true,
  },
  {
    phase: "PHASE 02",
    title: "Expansion Nationale",
    desc: "Ouverture du portail à toutes les préfectures de Guinée. Connexion avec les systèmes bancaires nationaux pour le KYC automatique.",
    date: "Q1 2025",
    done: false,
  },
  {
    phase: "PHASE 03",
    title: "Souveraineté CEDEAO",
    desc: "Interopérabilité avec les systèmes d'identité des pays membres de la CEDEAO. Vote électronique sécurisé par blockchain pour les élections 2026.",
    date: "Q4 2025",
    done: false,
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleFinalCta = () => {
    if (isAuthenticated) {
      navigate(user?.role === 'ADMIN' ? '/admin/dashboard' : '/citizen/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="flex flex-col pt-[88px]">

      {/* ── Hero Carousel ──────────────────────────────────────────── */}
      <HomeCarousel />

      {/* ── Hero Split ─────────────────────────────────────────────── */}
      <Hero />

      {/* ── Stats Bar ──────────────────────────────────────────────── */}
      <StatsBar />

      {/* ── Le Problème ────────────────────────────────────────────── */}
      <section className="py-28 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8">
          <Reveal width="100%">
            <div className="text-center mb-20 space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary opacity-70">Réalité terrain vérifiée</p>
              <h2 className="text-4xl md:text-5xl font-headline text-on-surface font-bold">
                Le fardeau de l'ancien système
              </h2>
              <p className="text-on-surface-variant max-w-xl mx-auto">
                Pourquoi la réforme de l'état civil guinéen est une urgence nationale — en chiffres réels.
              </p>
              <div className="w-16 h-1 bg-brand-yellow mx-auto mt-4" />
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROBLEMS.map((p, i) => (
              <Reveal key={i} delay={0.12 * i} overflowVisible fullHeight>
                <div className="bg-white p-8 border border-surface-variant hover:shadow-lg transition-shadow h-full flex flex-col space-y-5 group">
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-full ${p.color} flex items-center justify-center flex-shrink-0`}>
                      <span className="material-symbols-outlined text-xl">{p.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60 mb-0.5">{p.title}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-on-surface tracking-tight">{p.stat}</span>
                        <span className="text-sm text-on-surface-variant">{p.statLabel}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed flex-1">{p.desc}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary/50 border-t border-surface-variant pt-3">
                    Source : {p.source}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Notre Solution ─────────────────────────────────────────── */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <Reveal width="100%">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary opacity-70 mb-3">IdentiGuinée</p>
              <h2 className="text-4xl md:text-5xl font-headline text-primary font-bold mb-4">L'Institution Digitale</h2>
            </Reveal>
            <Reveal width="100%" delay={0.1}>
              <p className="text-lg text-on-surface-variant max-w-xl mx-auto">
                Une infrastructure de confiance fondée sur la transparence — des processus validés par l'administration et certifiés par blockchain.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SOLUTION_CARDS.map((card, i) => (
              <Reveal key={i} delay={0.15 * (i + 1)} overflowVisible fullHeight>
                <div className="bg-surface-container-lowest p-8 border-t-4 border-primary hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col group">
                  <div className="flex items-start justify-between mb-6">
                    <span className="material-symbols-outlined text-4xl text-primary fill-icon">{card.icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-primary/8 text-primary px-2 py-1 rounded">
                      {card.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-on-surface">{card.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed flex-1">{card.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Parcours Citoyen ───────────────────────────────────────── */}
      <section className="py-28 bg-surface-container">
        <div className="max-w-7xl mx-auto px-8">
          <Reveal width="100%">
            <div className="text-center mb-20 space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary opacity-70">Fonctionnement</p>
              <h2 className="text-4xl font-headline text-on-surface font-bold">Votre parcours citoyen</h2>
              <p className="text-on-surface-variant">De la demande au document certifié — 5 étapes, 48 heures, zéro guichet.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
            {STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.1} fullHeight width="100%">
                <div className="relative flex flex-col items-center text-center px-4 py-8 group hover:bg-white hover:shadow-md transition-all h-full w-full">
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-[52px] left-[calc(50%+32px)] right-0 h-px bg-outline-variant/30" />
                  )}
                  {/* Circle */}
                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 group-hover:shadow-primary/30 transition-all z-10 relative">
                    <span className="material-symbols-outlined text-2xl fill-icon">{step.icon}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/50 mb-1">{step.n}</span>
                  <p className="font-bold text-on-surface mb-2">{step.t}</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed flex-1">{step.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blockchain Deep Dive ───────────────────────────────────── */}
      <section className="py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Terminal */}
          <Reveal direction="right" overflowVisible>
            <div className="order-2 lg:order-1">
              <div className="bg-on-background p-8 rounded-xl shadow-2xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[60px]" />
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-stone-400 font-mono text-xs ml-2">NaissanceChain — node_GN_01</span>
                </div>
                <div className="font-mono text-sm space-y-3 relative z-10">
                  <p className="text-white/40">// Nouvelle demande reçue — 14 avril 2025</p>
                  <p className="text-yellow-400">&gt; citizen_request: id="GN-2025-047821"</p>
                  <p className="text-white/60">&gt; cross_check: naissancechain_registry...</p>
                  <p className="text-green-400">&gt; match: naissance #GN-1997-003812 ✓</p>
                  <p className="text-white/60">&gt; smart_contract: auto_validating...</p>
                  <p className="text-white/40 text-xs">// Aucun agent humain dans la boucle</p>
                  <p className="text-blue-400">&gt; consensus_reached: Block #94271</p>
                  <p className="text-white">&gt; doc_signature: 0X9A3...F17C-GN ✓</p>
                  <p className="text-green-400 font-bold">&gt; STATUS: DOCUMENT_CERTIFIED ✓</p>
                  <div className="border-t border-white/10 mt-4 pt-4 flex justify-between text-[10px] text-white/30">
                    <span>Durée totale : 2.4 secondes</span>
                    <span>Pot-de-vin : 0 GNF</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Text */}
          <div className="order-1 lg:order-2 space-y-8">
            <Reveal>
              <div className="inline-block px-4 py-1 bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-widest border border-primary/20 rounded-sm">
                Pourquoi la Blockchain ?
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="text-4xl font-headline font-bold text-on-surface leading-tight">
                Le code valide.<br />
                <span className="text-primary italic">Pas une personne.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-on-surface-variant leading-relaxed">
                Le système traditionnel repose sur des agents humains dont le pouvoir discrétionnaire crée des opportunités de corruption. En Guinée, classée <strong className="text-on-surface">142e/182</strong> à l'Indice de Perception de la Corruption, ce pouvoir est systématiquement monnayé. La blockchain élimine ce point de défaillance humain.
              </p>
            </Reveal>

            <div className="space-y-5">
              {[
                { icon: "lock", t: "Immuabilité", d: "Une identité inscrite dans la blockchain ne peut plus jamais être modifiée ou supprimée sans consensus du réseau." },
                { icon: "visibility", t: "Auditabilité publique", d: "Chaque transaction est vérifiable par n'importe quelle institution — hôpital, école, banque, administration." },
                { icon: "bolt", t: "Automatisation totale", d: "Le smart contract NaissanceChain valide, signe et émet le document sans intervention humaine possible." },
              ].map((pill, i) => (
                <Reveal key={i} delay={0.3 + i * 0.1} overflowVisible>
                  <div className="flex gap-4 p-4 bg-surface-container-low rounded-sm hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-secondary mt-0.5">{pill.icon}</span>
                    <div>
                      <h4 className="font-bold text-on-surface mb-1">{pill.t}</h4>
                      <p className="text-sm text-on-surface-variant">{pill.d}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tableau Comparatif ─────────────────────────────────────── */}
      <section className="py-28 bg-surface-container-low">
        <div className="max-w-5xl mx-auto px-8">
          <Reveal width="100%">
            <div className="text-center mb-16 space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary opacity-70">Avant / Après</p>
              <h2 className="text-4xl font-headline text-on-surface font-bold">La Transformation</h2>
            </div>
          </Reveal>

          <Reveal delay={0.2} width="100%" overflowVisible>
            <div className="bg-white rounded-sm overflow-hidden shadow-sm border border-surface-variant">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant">
                    <th className="p-5 font-bold text-on-surface-variant text-sm uppercase tracking-wider w-1/3">Critère</th>
                    <th className="p-5 font-bold text-tertiary text-sm uppercase tracking-wider w-1/3">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">close</span>
                        Ancien système
                      </span>
                    </th>
                    <th className="p-5 font-bold text-primary text-sm uppercase tracking-wider w-1/3">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base fill-icon">verified</span>
                        IdentiGuinée
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {COMPARISON.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-container-low transition-colors group">
                      <td className="p-5 font-bold text-sm text-on-surface">{row.critere}</td>
                      <td className="p-5 text-sm text-on-surface-variant">
                        <span className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-error text-base mt-0.5 flex-shrink-0">cancel</span>
                          {row.ancien}
                        </span>
                      </td>
                      <td className="p-5 text-sm text-on-surface-variant">
                        <span className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-brand-green text-base mt-0.5 flex-shrink-0 fill-icon">check_circle</span>
                          {row.nouveau}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Personas / Impact ──────────────────────────────────────── */}
      <section className="py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-8">
          <Reveal width="100%">
            <div className="text-center mb-20 space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary opacity-70">Impact multi-acteurs</p>
              <h2 className="text-4xl font-headline text-on-surface font-bold">Un bénéfice pour chaque acteur</h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PERSONAS.map((persona, i) => (
              <Reveal key={i} delay={0.1 * i} overflowVisible fullHeight>
                <div className="bg-white border border-surface-variant p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-full bg-primary/8 flex items-center justify-center mb-5">
                    <span className="material-symbols-outlined text-primary text-2xl">{persona.icon}</span>
                  </div>
                  <h4 className="text-base font-bold text-on-surface mb-3">{persona.role}</h4>
                  <p className="text-sm text-on-surface-variant italic leading-relaxed flex-1">"{persona.quote}"</p>
                  <div className="mt-5 pt-4 border-t border-surface-variant">
                    <p className="text-[11px] font-bold text-primary uppercase tracking-wider">{persona.impact}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roadmap ────────────────────────────────────────────────── */}
      <section className="py-28 bg-on-background text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/8 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-6">
            <Reveal>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary opacity-70 mb-3">Déploiement</p>
                <h2 className="text-4xl font-headline text-white font-bold">Vers l'Horizon 2026</h2>
                <p className="text-white/60 mt-2">Le calendrier du déploiement national.</p>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/15 rounded-lg backdrop-blur-sm">
                <span className="material-symbols-outlined text-secondary text-base">emoji_events</span>
                <span className="text-secondary font-bold text-sm uppercase tracking-wider">Projet Hackathon</span>
              </div>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {ROADMAP.map((phase, i) => (
              <Reveal key={phase.phase} delay={0.2 + i * 0.1}>
                <div className={`space-y-5 border-t-2 pt-8 h-full flex flex-col ${phase.done ? 'border-brand-green' : 'border-white/20'}`}>
                  <div className="flex items-center justify-between">
                    <div className="text-4xl font-headline font-bold opacity-20">{phase.phase}</div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${phase.done ? 'bg-brand-green/20 text-brand-green' : 'bg-white/10 text-white/50'}`}>
                      <span className="material-symbols-outlined text-[14px]">{phase.done ? 'check_circle' : 'schedule'}</span>
                      {phase.done ? 'En cours' : phase.date}
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-white">{phase.title}</h4>
                  <p className="text-white/60 text-sm leading-relaxed flex-1">{phase.desc}</p>
                  <div className="font-mono text-xs bg-white/5 border border-white/10 px-3 py-2 rounded inline-block text-white/40 self-start">
                    {phase.date}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────── */}
      <section className="py-28 bg-surface-bright relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-primary/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-8 text-center">
          <Reveal width="100%">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/8 border border-primary/20 rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-primary">
                Bêta ouverte — Conakry · Kindia · Labé
              </span>
            </div>
          </Reveal>

          <Reveal width="100%" delay={0.05}>
            <h2 className="text-5xl md:text-6xl font-headline text-on-surface font-bold mb-6 leading-tight">
              Reprenez le contrôle<br />
              <span className="text-primary italic">de votre identité.</span>
            </h2>
          </Reveal>

          <Reveal width="100%" delay={0.1}>
            <p className="text-xl text-on-surface-variant mb-4 leading-relaxed">
              Rejoignez les <strong className="text-on-surface">+12 000 citoyens guinéens</strong> qui testent déjà le portail. Zéro intermédiaire, zéro pot-de-vin, 48 heures.
            </p>
            <p className="text-sm text-on-surface-variant/70 mb-12">
              Sources : Afrobarometer 2020 · Sénat français · Enabel / Union Européenne 2023 · Transparency International 2023
            </p>
          </Reveal>

          <Reveal width="100%" delay={0.15}>
            <div className="flex flex-col sm:flex-row justify-center gap-5">
              <button
                onClick={handleFinalCta}
                className="bg-primary text-white px-10 py-5 rounded-md font-bold text-lg shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isAuthenticated ? "Accéder à mon tableau de bord" : "S'inscrire sur la liste d'attente"}
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
              <button
                onClick={() => navigate('/about')}
                className="bg-surface-container text-primary px-10 py-5 rounded-md font-bold text-lg border border-outline-variant/30 hover:bg-surface-container-high transition-colors"
              >
                En savoir plus sur le projet
              </button>
            </div>
          </Reveal>

          {/* Trust indicators */}
          <Reveal width="100%" delay={0.2}>
            <div className="mt-14 flex flex-wrap justify-center items-center gap-6 opacity-40">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface">
                <span className="material-symbols-outlined text-base">verified_user</span>
                NaissanceChain v2.1
              </div>
              <div className="w-px h-4 bg-on-surface/20" />
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface">
                <span className="material-symbols-outlined text-base">emoji_events</span>
                Miabe Hackathon 2026
              </div>
              <div className="w-px h-4 bg-on-surface/20" />
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface">
                <span className="material-symbols-outlined text-base">account_balance</span>
                République de Guinée
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
};

export default Home;