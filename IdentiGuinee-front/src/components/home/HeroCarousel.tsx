import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const images = [
  {
    url: '/assets/carousel/biometrics.png',
    title: 'Sécurité Biométrique',
    desc: 'Ancrage des données par IA décentralisée.'
  },
  {
    url: '/assets/carousel/blockchain.png',
    title: 'Registre Blockchain',
    desc: 'Immuabilité et transparence totale.'
  },
  {
    url: '/assets/carousel/mobile_id.png',
    title: 'Identité Mobile',
    desc: 'Accessible partout, tout le temps.'
  }
];

const HeroCarousel: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-lg aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/10 group bg-surface-container-lowest">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img 
            src={images[index].url} 
            alt={images[index].title}
            className="w-full h-full object-cover"
          />
          
          {/* Legend Overlay */}
          <div className="absolute bottom-0 inset-x-0 p-6 pt-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
            <motion.h3 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white text-xl font-bold font-headline mb-1"
            >
              {images[index].title}
            </motion.h3>
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/70 text-[13px] font-medium leading-tight"
            >
              {images[index].desc}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Indicators */}
      <div className="absolute bottom-6 right-8 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-primary shadow-lg shadow-primary/20' : 'w-2 bg-white/30 hover:bg-white/50'}`}
          />
        ))}
      </div>

      {/* Glassy Frame Overlay */}
      <div className="absolute inset-0 border-[8px] border-white/5 pointer-events-none rounded-2xl"></div>
    </div>
  );
};

export default HeroCarousel;