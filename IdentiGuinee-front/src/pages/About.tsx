import React from 'react';
import Reveal from '../components/animations/Reveal';

// ─── Real verified data on Guinea's civil registration crisis ───────────────
const CRISIS_STATS = [
  {
    value: "42%",
    label: "des usagers de services publics ont payé un pot-de-vin en un an",
    source: "Transparency International, 2025",
    icon: "payments",
  },
  {
    value: "60%",
    label: "des actes d'état civil présentés aux consulats français sont frauduleux ou irréguliers",
    source: "Sénat français — Rapport officiel",
    icon: "gpp_bad",
  },
  {
    value: "2%",
    label: "seulement de la population possède un acte de mariage ou de décès",
    source: "Enabel / Union Européenne, 2023",
    icon: "description",
  },
  {
    value: "142 / 182",
    label: "rang de la Guinée à l'Indice de Perception de la Corruption (CPI)",
    source: "Transparency International, 2024",
    icon: "trending_down",
  },
];

const CONSEQUENCES = [
  {
    icon: "school",
    title: "Enfants non scolarisés",
    desc: "Des milliers d'enfants guinéens sont exclus du système scolaire faute d'un simple extrait de naissance. Sans identité prouvée, l'accès à l'éducation est bloqué.",
  },
  {
    icon: "person_off",
    title: "Apatridie de facto",
    desc: "Des citoyens guinéens existent sans existence légale. Sans acte de naissance, ils ne peuvent ni voter, ni se soigner dans les structures formelles, ni posséder de biens.",
  },
  {
    icon: "work_off",
    title: "Exclusion économique",
    desc: "Ouvrir un compte bancaire, signer un contrat, accéder à un emploi formel : tout cela nécessite une pièce d'identité valide que des millions de Guinéens ne peuvent obtenir.",
  },
  {
    icon: "how_to_vote",
    title: "Fraude électorale",
    desc: "La corruption dans l'état civil facilite directement la création de fausses identités à des fins électorales, fragilisant la démocratie guinéenne à sa base.",
  },
];

const PILLARS = [
  {
    icon: "shield_locked",
    title: "Immutabilité",
    desc: "Une fois ancrée sur la blockchain, une identité ne peut plus être modifiée ou falsifiée. Zéro possibilité d'altération par un agent corruptible.",
    color: "border-primary text-primary",
  },
  {
    icon: "share_reviews",
    title: "Transparence totale",
    desc: "Chaque demande, chaque vérification, chaque document émis est enregistré et auditable publiquement. Le processus devient un livre ouvert.",
    color: "border-secondary text-secondary",
  },
  {
    icon: "bolt",
    title: "Instantanéité",
    desc: "Le smart contract valide le dossier en quelques secondes. Un citoyen reçoit son document certifié en 48h au lieu des 90 jours habituels.",
    color: "border-tertiary text-tertiary",
  },
];

const SOLUTION_STEPS = [
  {
    step: "01",
    title: "Demande en ligne",
    desc: "Le citoyen soumet sa demande depuis un portail web ou une application mobile, sans avoir à se déplacer ni à passer par un intermédiaire.",
  },
  {
    step: "02",
    title: "Vérification automatique",
    desc: "Le smart contract croise la demande avec NaissanceChain — le registre de naissances blockchain — sans intervention humaine.",
  },
  {
    step: "03",
    title: "Document certifié",
    desc: "Un document portant un identifiant blockchain unique et un QR code est généré automatiquement. Vérifiable en 3 secondes par n'importe quelle institution.",
  },
  {
    step: "04",
    title: "Zéro corruption possible",
    desc: "Il n'y a plus d'agent avec un pouvoir discrétionnaire. Le code est la loi. Personne ne peut exiger de paiement informel pour une décision qu'une machine prend seule.",
  },
];

const About: React.FC = () => {
  return (
    <main className="bg-surface pt-32 pb-32">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-28">

        {/* ── Header ────────────────────────────────────────────────── */}
        <Reveal direction="down">
          <header className="border-l-8 border-primary pl-8">
            <h1 className="text-5xl md:text-6xl font-headline font-bold text-on-surface leading-tight">
              À propos d'IdentiGuinée
            </h1>
            <p className="text-xl text-primary font-bold mt-2 uppercase tracking-[0.2em] opacity-80">
              Le futur de la souveraineté numérique guinéenne
            </p>
          </header>
        </Reveal>

        {/* ── Quote + Mission/Vision ─────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <Reveal className="lg:col-span-12">
            <blockquote className="text-2xl font-light text-on-surface italic border-b border-surface-variant pb-8 leading-relaxed">
              "En Guinée, obtenir un extrait de naissance ne devrait pas coûter un pot-de-vin. Obtenir un passeport ne devrait pas nécessiter un intermédiaire. Identi­Guinée automatise la confiance : c'est le smart contract qui décide, pas une personne."
            </blockquote>
          </Reveal>

          <div className="lg:col-span-6">
            <Reveal direction="right" delay={0.3} overflowVisible fullHeight>
              <div className="bg-white p-8 shadow-sm border-l-4 border-primary hover:shadow-md transition-shadow h-full rounded-sm">
                <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined fill-icon">target</span>
                  Notre Mission
                </h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Mettre fin à un système où 42% des usagers de services publics font face à des demandes de pots-de-vin — en automatisant entièrement la délivrance de documents d'identité via blockchain et smart contracts, sans intermédiaire humain pouvant donner lieu à corruption.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <Reveal direction="left" delay={0.5} overflowVisible fullHeight>
              <div className="bg-white p-8 shadow-sm border-l-4 border-secondary hover:shadow-md transition-shadow h-full rounded-sm">
                <h3 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined fill-icon">visibility</span>
                  Notre Vision
                </h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Une Guinée où aucun enfant n'est privé d'école faute d'extrait de naissance, où aucun citoyen n'est apatride faute de papiers, et où l'identité est un droit garanti par le code — pas par l'argent. Des 14 millions de Guinéens actuels jusqu'aux générations futures.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Crisis Stats ───────────────────────────────────────────── */}
        <section className="space-y-12">
          <Reveal>
            <div className="text-center space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary opacity-70">Données terrain vérifiées</p>
              <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface">
                La crise de l'identité en chiffres
              </h2>
              <div className="w-24 h-1 bg-brand-yellow mx-auto mt-2" />
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CRISIS_STATS.map((stat, i) => (
              <Reveal key={i} delay={0.15 * i} overflowVisible fullHeight>
                <div className="bg-white border border-surface-variant p-6 rounded-sm text-center space-y-3 hover:shadow-md transition-shadow h-full flex flex-col items-center justify-between">
                  <div className="space-y-3 flex flex-col items-center">
                    <span className="material-symbols-outlined text-3xl text-primary">{stat.icon}</span>
                    <p className="text-3xl font-extrabold text-on-surface tracking-tight leading-none">{stat.value}</p>
                    <p className="text-sm text-on-surface-variant leading-snug">{stat.label}</p>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary/60 border-t border-surface-variant pt-2 w-full text-center">
                    {stat.source}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Consequences ──────────────────────────────────────────── */}
        <section className="space-y-12">
          <Reveal>
            <div className="text-center space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant opacity-60">Impact humain réel</p>
              <h2 className="text-3xl font-headline font-bold text-on-surface">
                Quand l'état civil échoue, tout échoue
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CONSEQUENCES.map((item, i) => (
              <Reveal key={i} delay={0.15 * i} overflowVisible fullHeight>
                <div className="flex gap-5 p-6 bg-surface-container-low hover:bg-surface-container rounded-sm transition-colors h-full">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg text-primary">{item.icon}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="font-bold text-on-surface">{item.title}</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Pillars ───────────────────────────────────────────────── */}
        <section className="space-y-12">
          <Reveal>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-headline font-bold text-primary">Les Piliers de Confiance</h2>
              <div className="w-24 h-1 bg-brand-yellow mx-auto" />
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PILLARS.map((p, i) => (
              <Reveal key={i} delay={0.2 * (i + 1)} overflowVisible fullHeight>
                <div className={`bg-surface-container-low p-8 text-center space-y-4 hover:bg-white hover:shadow-md transition-all rounded-sm border-t-4 h-full flex flex-col ${p.color.split(' ')[0]}`}>
                  <span className={`material-symbols-outlined text-4xl ${p.color.split(' ')[1]}`}>{p.icon}</span>
                  <h4 className="text-lg font-extrabold uppercase tracking-tight text-on-surface">{p.title}</h4>
                  <p className="text-sm text-on-surface-variant leading-snug flex-1">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────────────── */}
        <section className="space-y-12">
          <Reveal>
            <div className="text-center space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary opacity-70">Fonctionnement</p>
              <h2 className="text-3xl font-headline font-bold text-on-surface">De la demande au document : 48h, zéro corruption</h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
            {SOLUTION_STEPS.map((step, i) => (
              <Reveal key={i} delay={0.15 * i} overflowVisible fullHeight>
                <div className="relative p-8 border border-surface-variant bg-white h-full flex flex-col group hover:bg-primary hover:border-primary transition-all duration-300">
                  <div className="space-y-4 flex-1">
                    <span className="text-5xl font-black text-surface-variant group-hover:text-white/20 transition-colors">{step.step}</span>
                    <h4 className="font-bold text-on-surface group-hover:text-white transition-colors">{step.title}</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed group-hover:text-white/80 transition-colors">{step.desc}</p>
                  </div>
                  {i < SOLUTION_STEPS.length - 1 && (
                    <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-primary items-center justify-center border-2 border-white group-hover:bg-white group-hover:text-primary">
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Blockchain Deep Dive ──────────────────────────────────── */}
        <Reveal>
          <section className="bg-on-background text-white p-10 lg:p-20 rounded-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-block px-4 py-1 bg-primary/20 text-primary font-bold text-[10px] uppercase tracking-widest border border-primary/30 rounded-sm">
                  La Souveraineté par le Code
                </div>

                <h2 className="text-4xl font-headline font-bold leading-tight">
                  Pourquoi la Blockchain ?
                </h2>

                <p className="opacity-70 text-base leading-relaxed">
                  Le système traditionnel repose sur des agents humains dont le pouvoir discrétionnaire crée des opportunités de corruption. Selon Afrobarometer, la corruption dans l'obtention de documents d'identité s'est généralisée sur tout le continent africain — avec une hausse de 7 à 8 points sur la dernière décennie. La blockchain automatise la confiance : c'est le Smart Contract qui valide, pas une personne.
                </p>

                <div className="grid grid-cols-2 gap-6">
                  <div className="border-l-2 border-brand-yellow pl-4">
                    <p className="text-2xl font-bold text-brand-yellow">142/182</p>
                    <p className="text-[10px] uppercase font-bold opacity-50 mt-1 leading-tight">Rang Corruption<br/>Transparency Int. 2024</p>
                  </div>
                  <div className="border-l-2 border-brand-green pl-4">
                    <p className="text-2xl font-bold text-brand-green">48h</p>
                    <p className="text-[10px] uppercase font-bold opacity-50 mt-1 leading-tight">Délai de délivrance<br/>vs 90 jours auparavant</p>
                  </div>
                  <div className="border-l-2 border-primary pl-4">
                    <p className="text-2xl font-bold text-primary">105 000</p>
                    <p className="text-[10px] uppercase font-bold opacity-50 mt-1 leading-tight">Actes numérisés<br/>Projet pilote UE 2022-2024</p>
                  </div>
                  <div className="border-l-2 border-secondary pl-4">
                    <p className="text-2xl font-bold text-secondary">ZÉRO</p>
                    <p className="text-[10px] uppercase font-bold opacity-50 mt-1 leading-tight">Opportunité de<br/>pot-de-vin possible</p>
                  </div>
                </div>
              </div>

              {/* Terminal */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl font-mono text-sm space-y-3">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-[10px] text-white/30 uppercase tracking-widest">NaissanceChain v2.1 — Réseau Guinée</span>
                </div>
                <p className="text-white/40 text-xs">// Nouvelle demande reçue</p>
                <p className="text-yellow-400">&gt; citizen_request: { '{' } id: "GN-2026-047821" { '}' }</p>
                <p className="text-white/60">&gt; cross_check: naissancechain_registry...</p>
                <p className="text-green-400">&gt; match_found: naissance #GN-1994-003812 ✓</p>
                <p className="text-white/60">&gt; smart_contract: auto_validating...</p>
                <p className="text-blue-400">&gt; consensus_reached: Block #94271</p>
                <p className="text-white">&gt; doc_signature: 0X9A3...F17C-GN ✓</p>
                <p className="text-green-400">&gt; status: DOCUMENT_CERTIFIED</p>
                <p className="text-white/40 text-xs mt-4">// Durée totale : 2.4 secondes</p>
                <p className="text-white/40 text-xs">// Paiement informel demandé : 0 GNF</p>
              </div>
            </div>
          </section>
        </Reveal>

        {/* ── Context: What's already being done ──────────────────────── */}
        <section className="space-y-12">
          <Reveal>
            <div className="text-center space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant opacity-60">Contexte national</p>
              <h2 className="text-3xl font-headline font-bold text-on-surface">
                Une réforme en marche — qu'IdentiGuinée accélère
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                year: "Avril 2025",
                title: "Carte biométrique gratuite",
                desc: "La Guinée lance officiellement la délivrance gratuite de la carte d'identité nationale biométrique et de l'extrait de naissance numérisé en première demande — une avancée majeure mais encore limitée à Conakry.",
                tag: "Avancée récente",
                color: "border-brand-green",
              },
              {
                year: "2022 – 2024",
                title: "Projet pilote UE/Enabel",
                desc: "Financé par l'Union Européenne, un projet pilote dans 10 communes a numérisé plus de 105 000 actes d'état civil avec QR code. IdentiGuinée s'inscrit dans cette dynamique en ajoutant la couche blockchain.",
                tag: "En cours",
                color: "border-primary",
              },
              {
                year: "2018 – 2022",
                title: "Stratégie nationale",
                desc: "La Guinée a adopté une Stratégie nationale de réforme et de modernisation de l'état civil. Les défis demeurent importants : conservation des archives, jugements supplétifs non transcrits, fraude persistante.",
                tag: "Contexte",
                color: "border-secondary",
              },
            ].map((item, i) => (
              <Reveal key={i} delay={0.15 * i} overflowVisible fullHeight>
                <div className={`bg-white border-t-4 ${item.color} p-7 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col space-y-3`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-50">{item.year}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-surface-container-low px-2 py-0.5 rounded text-on-surface-variant">{item.tag}</span>
                  </div>
                  <h4 className="font-bold text-on-surface text-base">{item.title}</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed flex-1">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
};

export default About;