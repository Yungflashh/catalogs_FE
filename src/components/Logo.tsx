type Props = {
  size?: number;
  className?: string;
};

export default function Logo({ size, className }: Props) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      width={size ?? '100%'}
      height={size ?? '100%'}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="cat-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0F2E1F" />
          <stop offset="100%" stopColor="#061410" />
        </linearGradient>
        <linearGradient id="cat-bar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>
        <radialGradient id="cat-shine" cx="0.25" cy="0.2" r="0.85">
          <stop offset="0%" stopColor="#22C55E" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="40" height="40" rx="10" fill="url(#cat-tile)" />
      <rect width="40" height="40" rx="10" fill="url(#cat-shine)" />
      <rect
        x="0.6"
        y="0.6"
        width="38.8"
        height="38.8"
        rx="9.4"
        fill="none"
        stroke="#22C55E"
        strokeOpacity="0.3"
        strokeWidth="1"
      />

      <rect x="10" y="10.5" width="20" height="3.6" rx="1.8" fill="url(#cat-bar)" />
      <rect x="10" y="18.2" width="11" height="3.6" rx="1.8" fill="#22C55E" />
      <rect x="10" y="25.9" width="20" height="3.6" rx="1.8" fill="url(#cat-bar)" />

      <circle cx="24.5" cy="20" r="1.35" fill="#86EFAC" />
    </svg>
  );
}
