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

// Enhanced hook that supports different animation directions
export const useScrollReveal = (direction = 'up', threshold = 0.1) => {
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
    const base = direction === 'left' ? 'scroll-reveal-left'
      : direction === 'right' ? 'scroll-reveal-right'
      : direction === 'scale' ? 'scroll-reveal-scale'
      : 'scroll-reveal';
    return `${base} ${isVisible ? 'visible' : ''}`;
  };

  return [ref, isVisible, getClassName];
};
