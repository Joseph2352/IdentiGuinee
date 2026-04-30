import React, { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useTransform, animate } from 'framer-motion';

interface CounterProps {
  value: number;
  direction?: 'up' | 'down';
  duration?: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

const Counter: React.FC<CounterProps> = ({ 
  value, 
  duration = 2, 
  delay = 0, 
  suffix = "", 
  prefix = "",
  decimals = 0
}) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
     return prefix + latest.toFixed(decimals) + suffix;
  });
  
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    // Subscribe to the transformed value and update the DOM directly for performance
    const unsubscribe = rounded.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = latest;
      }
    });

    if (inView) {
      const timeout = setTimeout(() => {
        animate(count, value, {
          duration: duration,
          ease: [0.25, 1, 0.5, 1], // Smooth cubic-bezier
        });
      }, delay * 1000);
      
      return () => {
        unsubscribe();
        clearTimeout(timeout);
      };
    }

    return unsubscribe;
  }, [inView, value, count, rounded, duration, delay]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
};

export default Counter;
