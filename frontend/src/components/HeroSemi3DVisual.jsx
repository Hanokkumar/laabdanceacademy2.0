import React from 'react';
import { cn } from '../lib/utils';

const THEMES = {
  dance: {
    frame:
      'from-[#fbcfe8]/95 via-[#fed7aa]/90 to-[#fde68a]/85',
    frameRing: 'ring-pink-200/40',
    labelClass:
      '[text-shadow:0_0_1px_rgba(255,255,255,0.8)] text-white/25',
  },
  yoga: {
    frame:
      'from-emerald-100/95 via-teal-50/90 to-cyan-100/85',
    frameRing: 'ring-emerald-200/40',
    labelClass: 'text-emerald-950/20',
  },
  classical: {
    frame:
      'from-amber-100/95 via-rose-50/90 to-orange-200/85',
    frameRing: 'ring-amber-200/40',
    labelClass: 'text-amber-950/22',
  },
};

/**
 * "Semi 3D" hero art: soft rounded panel + vertical headline + subject image overlapping the frame.
 */
export function HeroSemi3DVisual({ slide }) {
  const theme = THEMES[slide.heroTheme] || THEMES.dance;
  const label = slide.verticalLabel || 'DANCE';
  const labelSize =
    label.length > 8
      ? 'text-[clamp(1.5rem,5.5vw,3.25rem)]'
      : 'text-[clamp(2.75rem,9vw,5.5rem)]';

  return (
    <div className="relative w-full flex justify-center items-center py-4 sm:py-8">
      <div className="relative w-full max-w-[min(100%,520px)] lg:max-w-none lg:w-full aspect-[4/5] sm:aspect-[3/4] lg:aspect-auto lg:min-h-[min(72vh,640px)] flex items-center justify-center">
        {/* Soft panel — sits behind the figure */}
        <div
          className={cn(
            'absolute left-[8%] right-[8%] top-[18%] bottom-[12%] sm:top-[14%] sm:bottom-[10%] rounded-[2rem] sm:rounded-[2.5rem]',
            'bg-gradient-to-br shadow-[0_28px_60px_-12px_rgba(0,0,0,0.45)]',
            'ring-1 backdrop-blur-[2px]',
            theme.frame,
            theme.frameRing
          )}
        />

        {/* Vertical outlined word */}
        <span
          className={cn(
            'pointer-events-none absolute z-[5] right-[10%] sm:right-[12%] top-1/2 -translate-y-1/2',
            'select-none font-black uppercase tracking-tight leading-none',
            labelSize,
            theme.labelClass,
            'opacity-90'
          )}
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            WebkitTextStroke: '1.5px rgba(255,255,255,0.35)',
            color: 'transparent',
          }}
        >
          {label}
        </span>

        {/* Subject — pops past the panel (semi 3D) */}
        <div className="relative z-10 w-full h-full flex items-center justify-center px-2 sm:px-4">
          <img
            src={slide.image}
            alt={`${slide.title} ${slide.titleAccent}`.trim()}
            className={cn(
              'max-h-[min(58vh,520px)] sm:max-h-[min(62vh,580px)] lg:max-h-[min(70vh,640px)] w-auto max-w-[108%] object-contain object-bottom',
              '-translate-y-3 sm:-translate-y-5 scale-[1.02] sm:scale-105',
              'drop-shadow-[0_28px_50px_rgba(0,0,0,0.45)]'
            )}
            loading={slide.id === 1 ? 'eager' : 'lazy'}
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}

export default HeroSemi3DVisual;
