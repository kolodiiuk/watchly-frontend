import type { HTMLAttributes } from 'react';

type BadgeTone = 'default' | 'accent' | 'success' | 'warning' | 'danger';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const badgeToneClasses: Record<BadgeTone, string> = {
  default: 'bg-surface text-text border-border',
  accent: 'bg-accent/15 text-accent border-accent/30',
  success: 'bg-success/15 text-success border-success/30',
  warning: 'bg-warning/15 text-warning border-warning/30',
  danger: 'bg-danger/15 text-danger border-danger/30',
};

export function Badge({ tone = 'default', className = '', ...props }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-[0.18em] uppercase',
        badgeToneClasses[tone],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}
