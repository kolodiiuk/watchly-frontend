import type { HTMLAttributes } from 'react';

type CardTone = 'base' | 'raised' | 'glass';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: CardTone;
};

const cardToneClasses: Record<CardTone, string> = {
  base: 'bg-surface border-border',
  raised: 'bg-surface-raised border-border/80 shadow-[0_24px_80px_rgba(0,0,0,0.32)]',
  glass: 'bg-white/5 border-white/10 backdrop-blur-xl',
};

export function Card({ tone = 'base', className = '', ...props }: CardProps) {
  return (
    <div
      className={['rounded-3xl border p-6', cardToneClasses[tone], className].filter(Boolean).join(' ')}
      {...props}
    />
  );
}
