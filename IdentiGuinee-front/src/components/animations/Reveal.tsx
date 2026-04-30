import React, { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  className?: string; // Added to fix About.tsx error
  distance?: number;  // Added to fix Verification.tsx error
  overflowVisible?: boolean; // New prop to prevent clipping shadows/rings
  fullHeight?: boolean;
}

const Reveal = ({ 
  children, 
  width = "fit-content", 
  direction = "up", 
  delay = 0.2, 
  className = "", 
  distance = 75,
  overflowVisible = false,
  fullHeight = false
}: Props) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

  const variants = {
    hidden: { 
      opacity: 0, 
      y: direction === "up" ? distance : direction === "down" ? -distance : 0,
      x: direction === "left" ? distance : direction === "right" ? -distance : 0,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      x: 0,
    },
  };

  return (
    <div 
      ref={ref} 
      className={cn(className, fullHeight && "h-full")}
      style={{ position: "relative", width, overflow: overflowVisible ? "visible" : "hidden" }}
    >
      <motion.div
        variants={variants}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
        className={fullHeight ? "h-full" : ""}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default Reveal;
