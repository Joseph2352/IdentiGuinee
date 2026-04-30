import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    eyebrow: "La crise de l'identité en Guinée",
    title: "4 Guinéens sur 10",
    subtitle: "paient un pot-de-vin pour un document d'identité",
    body: "Un extrait de naissance, un passeport, une carte d'électeur : autant de droits fondamentaux devenus sources d'extorsion dans un système opaque et manuel. La corruption dans l'état civil facilite directement la fraude électorale et le trafic d'identité.",
    source: "Afrobarometer, 2020",
    image: "/assets/carousel/sovereignty.png",
    accentColor: "border-guinea-red",
    accentBg: "bg-guinea-red",
    cta: "Comprendre le problème",
    ctaRoute: '/about',
  },
  {
    eyebrow: "Fracture documentaire",
    title: "60% des actes",
    subtitle: "présentés aux consulats français sont frauduleux ou irréguliers",
    body: "La fraude documentaire est si généralisée en Guinée que la France a émis une note officielle recommandant de rejeter tout acte de naissance guinéen. Des enfants se retrouvent sans identité légale, exclus du système scolaire et sans accès aux soins.",
    source: "Sénat français — Rapport officiel",
    image: "/assets/carousel/security.png",
    accentColor: "border-primary",
    accentBg: "bg-primary",
    cta: "Notre solution blockchain",
    ctaRoute: '/about',
  },
  {
    eyebrow: "NaissanceChain — Registre national",
    title: "48h chrono,",
    subtitle: "zéro intermédiaire, zéro corruption",
    body: "IdentiGuinée remplace l'agent corruptible par un smart contract. La demande est soumise en ligne, croisée automatiquement avec NaissanceChain, et un document certifié avec signature cryptographique et QR code est émis sans aucune intervention humaine.",
    source: "Projet Miabe Hackathon 2026 — GN-02",
    image: "/assets/carousel/blockchain.png",
    accentColor: "border-guinea-yellow",
    accentBg: "bg-guinea-yellow",
    cta: "Commencer ma demande",
    ctaRoute: '/register',
  },
];

export function HomeCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 8000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => { if (emblaApi) emblaApi.scrollPrev(); }, [emblaApi]);
  const scrollNext = useCallback(() => { if (emblaApi) emblaApi.scrollNext(); }, [emblaApi]);

  return (
    <div className="relative group">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 relative h-[480px] md:h-[600px] flex items-center overflow-hidden"
            >
              {/* Background */}
              <div className="absolute inset-0 z-0">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[12s] ease-linear"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/10 z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
              </div>

              {/* Content */}
              <div className="relative z-20 text-left px-8 md:px-20 lg:px-28 w-full max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-7 max-w-3xl"
                >
                  {/* Eyebrow */}
                  <div className="flex items-center gap-4">
                    <span className={cn("w-10 h-0.5 rounded-full", slide.accentBg)} />
                    <span className="text-white/75 text-[11px] font-black uppercase tracking-[0.3em]">
                      {slide.eyebrow}
                    </span>
                  </div>

                  {/* Main text */}
                  <div className="space-y-1">
                    <h2 className="text-5xl md:text-7xl lg:text-8xl font-headline font-black text-white tracking-tight leading-[0.92] drop-shadow-2xl">
                      {slide.title}
                    </h2>
                    <p className="text-xl md:text-3xl text-white/70 font-medium leading-tight">
                      {slide.subtitle}
                    </p>
                  </div>

                  {/* Body */}
                  <p className="text-base md:text-lg text-white/65 leading-relaxed max-w-2xl">
                    {slide.body}
                  </p>

                  {/* Source chip */}
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-lg px-4 py-2">
                    <span className="material-symbols-outlined text-white/60 text-base">library_books</span>
                    <span className="text-[11px] text-white/60 font-bold uppercase tracking-wider">{slide.source}</span>
                  </div>

                  {/* CTA */}
                  <div className="pt-2">
                    <button className={cn(
                      "px-8 py-4 rounded-md font-bold text-base border-l-4 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-primary transition-all active:scale-95 shadow-xl",
                      slide.accentColor
                    )}>
                      {slide.cta}
                      <span className="ml-2 material-symbols-outlined text-[18px] align-middle">arrow_forward</span>
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Slide index */}
              <div className="absolute bottom-10 left-8 md:left-28 z-30 font-mono text-white/25 text-xs select-none">
                <span className="text-white/80 text-2xl font-bold">0{index + 1}</span>
                <span className="ml-1">/ 0{slides.length}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-primary active:scale-90"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-primary active:scale-90"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots bottom right */}
      <div className="absolute bottom-10 right-8 z-30 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              selectedIndex === i ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}