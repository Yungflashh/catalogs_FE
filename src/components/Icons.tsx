interface P { size?: number; className?: string; }
const base = (size: number) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const CartIcon = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
);
export const HeartIcon = ({ size = 20, className, filled }: P & { filled?: boolean }) => (
  <svg {...base(size)} className={className} fill={filled ? 'currentColor' : 'none'}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
);
export const UserIcon = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
export const SearchIcon = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
);
export const StarIcon = ({ size = 16, className, filled }: P & { filled?: boolean }) => (
  <svg {...base(size)} className={className} fill={filled ? 'currentColor' : 'none'}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
);
export const TrashIcon = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
);
export const PlusIcon = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}><path d="M12 5v14M5 12h14" /></svg>
);
export const MinusIcon = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}><path d="M5 12h14" /></svg>
);
export const BoxIcon = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" /></svg>
);
export const GridIcon = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
);
export const UsersIcon = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
export const ChartIcon = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><path d="M3 3v18h18" /><path d="M18 17V9M13 17V5M8 17v-3" /></svg>
);
export const LogoutIcon = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
);
export const MenuIcon = ({ size = 22, className }: P) => (
  <svg {...base(size)} className={className}><path d="M3 12h18M3 6h18M3 18h18" /></svg>
);
export const CloseIcon = ({ size = 22, className }: P) => (
  <svg {...base(size)} className={className}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
export const CheckIcon = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}><path d="M20 6 9 17l-5-5" /></svg>
);
export const ArrowRight = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
);
export const EditIcon = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
);
export const PackageCheck = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><path d="m16 16 2 2 4-4" /><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" /><path d="M3.29 7 12 12l8.71-5M12 22V12" /></svg>
);
export const WalletIcon = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3H5a2 2 0 0 0-2 2v2" /><circle cx="16" cy="14" r="1" fill="currentColor" strokeWidth={0} /></svg>
);
export const CoinIcon = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="12" r="10" /><path d="M12 6v12M9 8.5C9 7.12 10.34 6 12 6s3 1.12 3 2.5-1.34 2.5-3 2.5-3 1.12-3 2.5S10.34 18 12 18s3-1.12 3-2.5" /></svg>
);
export const ClockIcon = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
);
export const CopyIcon = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
);
export const UploadIcon = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
);
export const CheckCircleIcon = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4 12 14.01l-3-3" /></svg>
);
