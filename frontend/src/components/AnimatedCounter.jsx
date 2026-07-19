import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function AnimatedCounter({ value, duration = 1.5, delay = 0, prefix = '', suffix = '', decimals = 0 }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);
  const animated = useRef(false);

  useEffect(() => {
    if (value === undefined || value === null) return;
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return;

    const timer = setTimeout(() => {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: numValue,
        duration,
        ease: 'power2.out',
        onUpdate: () => setDisplay(obj.val),
      });
      animated.current = true;
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [value, duration, delay]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString();

  return (
    <span ref={ref} className="inline-block tabular-nums">
      {prefix}{formatted}{suffix}
    </span>
  );
}
