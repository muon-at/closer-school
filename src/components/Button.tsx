import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'ghost' | 'green';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-40 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  primary: 'bg-amber-500 text-zinc-950 hover:bg-amber-400',
  secondary: 'border border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10',
  ghost: 'text-zinc-300 hover:text-white hover:bg-white/5',
  green: 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
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
