import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  leadingIcon?: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-background shadow-[0_16px_35px_rgba(0,0,0,0.35)] hover:bg-primary-strong',
  secondary: 'bg-surface text-text border border-border hover:bg-surface-raised',
  ghost: 'bg-transparent text-muted hover:bg-white/5 hover:text-text',
};

export function Button({ variant = 'primary', leadingIcon, className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}>
      {leadingIcon}
      <span>{children}</span>
    </button>
  );
}
