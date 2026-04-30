import React from 'react';
import Counter from '../animations/Counter';
import Reveal from '../animations/Reveal';

const stats = [
  {
    value: 42,
    suffix: "%",
    label: "des utilisateurs de services publics ont payé un pot-de-vin",
    source: "Transparency International, 2025",
    icon: "payments",
    highlight: false,
  },
  {
    value: 142,
    suffix: "/182",
    label: "Rang mondial à l'Indice de Perception de la Corruption (CPI)",
    source: "Transparency International, 2024",
    icon: "gpp_bad",
    highlight: true,
  },
  {
    value: 48,
    suffix: "h",
    label: "délai de délivrance avec IdentiGuinée contre 90 jours auparavant",
    source: "Objectif Miabe Hackathon 2026",
    icon: "timer",
    highlight: false,
  },
  {
    value: 14,
    suffix: "M",
    label: "Guinéens qui méritent un accès garanti à leur identité légale",
    source: "Enabel / Union Européenne, 2023",
    icon: "groups",
    highlight: false,
  },
];

const StatsBar: React.FC = () => {
  return (
    <section className="bg-secondary-container py-12 border-y border-secondary/20">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 lg:grid-cols-4 gap-8 text-on-secondary-container">
        {stats.map((stat, i) => (
          <Reveal key={i} delay={0.1 * i} overflowVisible>
            <div className={`px-4 py-2 flex flex-col items-center text-center space-y-2 ${i < stats.length - 1 ? 'lg:border-r border-on-secondary-container/10' : ''}`}>
              <p className="text-3xl md:text-4xl font-headline font-bold text-on-secondary-container mb-1">
                <Counter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] leading-tight max-w-[180px]">
                {stat.label}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-on-secondary-container/50 pt-2 w-full">
                {stat.source}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default StatsBar;