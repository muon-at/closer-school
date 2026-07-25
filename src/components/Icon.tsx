// Inline SVG-ikoner i «Salgsgulvet»-stilen: stroke 1.75, currentColor,
// kantete og enkle. Erstatter ALLE emojis i UI-et.
export type IconName =
  | 'phone'
  | 'door'
  | 'target'
  | 'trophy'
  | 'chart'
  | 'chat'
  | 'briefcase'
  | 'user'
  | 'check'
  | 'x'
  | 'arrow-right'
  | 'play'
  | 'camera'
  | 'mic'
  | 'flame'
  | 'lock'
  | 'calendar'
  | 'clipboard'
  | 'star'
  | 'logout'
  | 'shield'
  | 'menu';

const paths: Record<IconName, JSX.Element> = {
  phone: (
    <path d="M4 4h5l2 5-3 2c1.2 2.6 3.4 4.8 6 6l2-3 5 2v5c-9.4 0-17-7.6-17-17z" />
  ),
  door: (
    <>
      <path d="M4 21h16M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17" />
      <path d="M14.5 12.5v.01" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0V4z" />
      <path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8 16v-5M12 16V8M16 16v-8M20 16V6" />
    </>
  ),
  chat: (
    <path d="M4 5h16v11H9l-5 4V5z" />
  ),
  briefcase: (
    <>
      <rect x="3" y="8" width="18" height="12" />
      <path d="M9 8V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3M3 13h18" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
    </>
  ),
  check: <path d="M4 12.5 10 18 20 6" />,
  x: <path d="M5 5l14 14M19 5 5 19" />,
  'arrow-right': <path d="M4 12h16m-6-6 6 6-6 6" />,
  play: <path d="M7 4.5 19 12 7 19.5v-15z" />,
  camera: (
    <>
      <path d="M3 7h4l2-2.5h6L17 7h4v13H3V7z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" />
    </>
  ),
  flame: (
    <path d="M12 3c1 3-1 4.5-2.5 6.5C8 11.5 7 13 7 15a5 5 0 0 0 10 0c0-2.5-1.5-4-2-6 2 .8 3 2.2 3.5 3.5C19.5 9 17 5 12 3z" />
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="16" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" />
      <path d="M9 4V2.5h6V4M9 9h6M9 13h6M9 17h4" />
    </>
  ),
  star: (
    <path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.3l6.1-.7L12 3z" />
  ),
  logout: (
    <>
      <path d="M14 4H5v16h9" />
      <path d="M10 12h10m-4-4 4 4-4 4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 4.5 6v6c0 4.5 3 7.8 7.5 9 4.5-1.2 7.5-4.5 7.5-9V6L12 3z" />
      <path d="M9 12l2 2 4-4.5" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
};

export default function Icon({
  name,
  size = 18,
  className = '',
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}
