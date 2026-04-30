import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-[#0a4f15] via-[#0d631b] to-[#0a4f15] text-white">

      {/* Diagonal texture overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 40px)',
        }}
      />

      {/* Top gold accent bar */}
      <div
        className="h-[3px] w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent, #fcab28 30%, #f8c96a 50%, #fcab28 70%, transparent)',
        }}
      />

      {/* Main content */}
      <div className="relative mx-auto max-w-6xl px-12 pb-10 pt-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_auto_auto] md:gap-16">

          {/* Brand column */}
          <div className="max-w-xs">
            <img
              src="/logo.png"
              alt="Logo"
              className="mb-6 h-16 w-auto"
            />

            {/* Gold separator */}
            <div className="mb-4 h-0.5 w-10 rounded-full bg-[#fcab28]" />

            <p className="text-sm font-light leading-relaxed tracking-wide text-white/70">
              Plateforme officielle du Ministère de la Sécurité et de la Protection Civile.
              Propulsé par la technologie Blockchain souveraine.
            </p>

            {/* Blockchain badge */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-sm border border-[#fcab28]/40 px-4 py-2">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#fcab28]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#fcab28]">
                Blockchain Certifiée
              </span>
            </div>
          </div>

          {/* Législation */}
          <div>
            <h5 className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[#fcab28]">
              Législation
            </h5>
            <ul className="flex flex-col gap-4">
              {[
                { label: 'Mentions Légales', to: '/mentions-legales' },
                { label: 'Confidentialité', to: '/confidentialite' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="block text-[15px] text-white/75 transition-all duration-200 hover:pl-2 hover:text-[#fcab28]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Assistance */}
          <div>
            <h5 className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[#fcab28]">
              Assistance
            </h5>
            <ul className="flex flex-col gap-4">
              {[
                { label: 'Contact', to: '/contact' },
                { label: 'Support Technique', to: '/support' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="block text-[15px] text-white/75 transition-all duration-200 hover:pl-2 hover:text-[#fcab28]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
          <p className="text-xs tracking-wide text-white/50">
            © 2026 République de Guinée — Plateforme Nationale d'Identité Numérique
          </p>

          {/* Guinea flag colors */}
          <div className="flex items-center gap-1 opacity-70">
            <div className="h-3 w-3 rounded-sm bg-[#CE1126]" />
            <div className="h-3 w-3 rounded-sm bg-[#FCD116]" />
            <div className="h-3 w-3 rounded-sm bg-[#009A44]" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;