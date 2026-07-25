import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'ghost' | 'green';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-none font-mono font-semibold uppercase tracking-[0.08em] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal disabled:opacity-40 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  primary:
    'bg-signal text-ink hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#F4F1EA] active:translate-y-0 active:shadow-none',
  secondary:
    'border border-bone/60 bg-transparent text-bone hover:border-bone hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#FF4D00] active:translate-y-0 active:shadow-none',
  ghost: 'text-bone/70 hover:text-bone hover:bg-bone/5',
  green:
    'bg-win text-ink hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#F4F1EA] active:translate-y-0 active:shadow-none',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-[12px]',
  md: 'px-6 py-3 text-[13px]',
  lg: 'px-8 py-4 text-[13px]',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  to?: string;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  to,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  if (to) {
    // Respekter disabled også for lenke-varianten
    if (disabled) {
      return (
        <span aria-disabled="true" className={`${cls} pointer-events-none cursor-not-allowed opacity-40`}>
          {children}
        </span>
      );
    }
    // Anker-lenker (#seksjon) skal scrolle på samme side — ikke rutes via React Router
    if (to.startsWith('#')) {
      return (
        <a
          href={to}
          className={cls}
          onClick={(e) => {
            const target = document.getElementById(to.slice(1));
            if (target) {
              e.preventDefault();
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
        >
          {children}
        </a>
      );
    }
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}
