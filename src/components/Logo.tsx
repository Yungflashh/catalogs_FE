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
        <linearGradient id="cat-hex" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="55%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
        <linearGradient id="cat-hex-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86EFAC" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#166534" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      <path
        d="M20 2.5 L35.6 11.25 L35.6 28.75 L20 37.5 L4.4 28.75 L4.4 11.25 Z"
        fill="url(#cat-hex)"
        stroke="url(#cat-hex-edge)"
        strokeWidth="0.8"
      />

      <path
        d="M23.38 14.8 A6.2 6.2 0 1 0 23.38 25.2"
        stroke="#061410"
        strokeWidth="3.8"
        strokeLinecap="round"
        fill="none"
      />

      <circle cx="24.6" cy="20" r="1.55" fill="#061410" />
      <circle cx="24.6" cy="20" r="0.55" fill="#4ADE80" />
    </svg>
  );
}
