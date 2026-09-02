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
        <linearGradient id="cat-lg-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0F2E1F" />
          <stop offset="100%" stopColor="#061410" />
        </linearGradient>
        <linearGradient id="cat-lg-c" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
        <radialGradient id="cat-lg-glow" cx="0.3" cy="0.25" r="0.7">
          <stop offset="0%" stopColor="#22C55E" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="40" height="40" rx="11" fill="url(#cat-lg-bg)" />
      <rect width="40" height="40" rx="11" fill="url(#cat-lg-glow)" />
      <rect
        x="0.6"
        y="0.6"
        width="38.8"
        height="38.8"
        rx="10.4"
        fill="none"
        stroke="#22C55E"
        strokeOpacity="0.28"
        strokeWidth="1"
      />

      <path
        d="M28.5 11.5 A9.5 9.5 0 1 0 28.5 28.5"
        stroke="#22C55E"
        strokeOpacity="0.32"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />

      <path
        d="M26.2 14.5 A5.8 5.8 0 1 0 26.2 25.5"
        stroke="url(#cat-lg-c)"
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />

      <circle cx="27.4" cy="20" r="1.55" fill="#86EFAC" />
      <circle cx="27.4" cy="20" r="0.6" fill="#F0FDF4" />
    </svg>
  );
}
