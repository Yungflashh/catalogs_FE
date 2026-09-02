type Props = {
  size?: number;
  className?: string;
};

export default function Logo({ size, className }: Props) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      width={size ?? '100%'}
      height={size ?? '100%'}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="catalog-logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34D97A" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#catalog-logo-bg)" />
      <path
        d="M22.5 10.2a8 8 0 1 0 0 11.6"
        stroke="#07100D"
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="22.5" cy="16" r="1.9" fill="#07100D" />
    </svg>
  );
}
