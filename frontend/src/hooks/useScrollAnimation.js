import { useEffect, useRef, useState, useCallback } from 'react';

const useScrollAnimation = (threshold = 0.15, rootMargin = '0px') => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleIntersection = useCallback(([entry]) => {
    if (entry.isIntersecting) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin, handleIntersection]);

  return [ref, isVisible];
};

export default useScrollAnimation;

/** @type {Record<string, string>} */
const REVEAL_CLASS = {
  up: 'scroll-reveal',
  down: 'scroll-reveal-down',
  left: 'scroll-reveal-left',
  right: 'scroll-reveal-right',
  scale: 'scroll-reveal-scale',
};

/**
 * Scroll-triggered reveal: returns [ref, className] with `scroll-reveal-*` + `visible` when in view.
 * @param {'up'|'down'|'left'|'right'|'scale'} [direction='up']
 * @param {number} [threshold=0.12]
 * @param {string} [rootMargin='0px 0px -8% 0px'] — trigger slightly before fully in view
 */
export function useScrollReveal(direction = 'up', threshold = 0.12, rootMargin = '0px 0px -8% 0px') {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const baseClass = REVEAL_CLASS[direction] || REVEAL_CLASS.up;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [threshold, rootMargin]);

  const className = `${baseClass}${isVisible ? ' visible' : ''}`;
  return [ref, className];
}

// Legacy helper (optional use with manual className)
export const useScrollRevealLegacy = (direction = 'up', threshold = 0.1) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  const getClassName = () => {
    const base =
      direction === 'left'
        ? 'scroll-reveal-left'
        : direction === 'right'
          ? 'scroll-reveal-right'
          : direction === 'scale'
            ? 'scroll-reveal-scale'
            : 'scroll-reveal';
    return `${base} ${isVisible ? 'visible' : ''}`;
  };

  return [ref, isVisible, getClassName];
};
