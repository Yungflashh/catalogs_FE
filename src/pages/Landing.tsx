import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { productApi } from '../api/services';
import ProductCard from '../components/ProductCard';
import { Loader } from '../components/Shared';
import {
  ArrowRight, ChevronRight, ChevronDown,
  CheckCircle, Star, TrendingUp, Clock,
  BadgeCheck, Shield, Zap, Globe,
  CreditCard, Wallet, RefreshCw, Database,
  Activity, Lock, UserPlus, ShoppingBag,
} from 'lucide-react';
import './Landing.css';

/* ─── Static data ─── */
const STATS = [
  { value: '1,000+',            label: 'Logs in stock',    sub: 'Fresh & verified' },
  { value: 'US · UK · CA · AU', label: 'Countries covered', sub: 'Global bank selection' },
  { value: '4.8★',              label: 'Avg rating',        sub: 'From verified buyers' },
  { value: 'BTC · ETH · USDT',  label: 'Crypto accepted',  sub: 'Fully anonymous' },
];

const BANKS = [
  { name: 'Chase',           color: '#117ACA', logo: 'https://www.google.com/s2/favicons?sz=64&domain=chase.com' },
  { name: 'Bank of America', color: '#C0272D', logo: 'https://www.google.com/s2/favicons?sz=64&domain=bankofamerica.com' },
  { name: 'Wells Fargo',     color: '#CF4520', logo: 'https://www.google.com/s2/favicons?sz=64&domain=wellsfargo.com' },
  { name: 'Citibank',        color: '#056DAE', logo: 'https://www.google.com/s2/favicons?sz=64&domain=citi.com' },
  { name: 'Capital One',     color: '#D03027', logo: 'https://www.google.com/s2/favicons?sz=64&domain=capitalone.com' },
  { name: 'TD Bank',         color: '#2C7A3E', logo: 'https://www.google.com/s2/favicons?sz=64&domain=td.com' },
  { name: 'PNC Bank',        color: '#F05A28', logo: 'https://www.google.com/s2/favicons?sz=64&domain=pnc.com' },
  { name: 'US Bank',         color: '#A6192E', logo: 'https://www.google.com/s2/favicons?sz=64&domain=usbank.com' },
  { name: 'Goldman Sachs',   color: '#6DAEDB', logo: 'https://www.google.com/s2/favicons?sz=64&domain=goldmansachs.com' },
  { name: 'HSBC',            color: '#DB0011', logo: 'https://www.google.com/s2/favicons?sz=64&domain=hsbc.com' },
  { name: 'Barclays',        color: '#00AEEF', logo: 'https://www.google.com/s2/favicons?sz=64&domain=barclays.com' },
  { name: 'Amex',            color: '#016FD0', logo: 'https://www.google.com/s2/favicons?sz=64&domain=americanexpress.com' },
  { name: 'Santander',       color: '#EC0000', logo: 'https://www.google.com/s2/favicons?sz=64&domain=santander.com' },
  { name: 'Deutsche Bank',   color: '#0018A8', logo: 'https://www.google.com/s2/favicons?sz=64&domain=db.com' },
  { name: 'Ally Bank',       color: '#7D1979', logo: 'https://www.google.com/s2/favicons?sz=64&domain=ally.com' },
  { name: 'Regions Bank',    color: '#006937', logo: 'https://www.google.com/s2/favicons?sz=64&domain=regions.com' },
];

const LOG_TYPES = [
  {
    icon: CreditCard,
    title: 'Premium Bank Logs',
    desc: 'High-balance bank accounts from Chase, Wells Fargo, Bank of America, Barclays, and more — sorted by country and balance.',
    tag: 'High Demand',
    tagColor: '#22C55E',
    count: '8,400+ in stock',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=480&h=200&fit=crop',
  },
  {
    icon: Wallet,
    title: 'PayPal & Cash App',
    desc: 'Verified PayPal logs, Cash App accounts, and Venmo — all sourced fresh and ready the moment you complete checkout.',
    tag: 'Trending',
    tagColor: '#F59E0B',
    count: '3,200+ in stock',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=480&h=200&fit=crop',
  },
  {
    icon: Globe,
    title: 'Worldwide Coverage',
    desc: 'US, UK, CA, AU and more. Filter by country, bank, and balance — all in one place.',
    tag: 'Popular',
    tagColor: '#3B82F6',
    count: '5,100+ in stock',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=480&h=200&fit=crop',
  },
  {
    icon: BadgeCheck,
    title: 'Verified & Fresh',
    desc: 'Every log is checked before it goes live. No dead logs — only active, working accounts. Instant replace if anything fails.',
    tag: 'Guaranteed',
    tagColor: '#8B5CF6',
    count: 'All listings',
    image: 'https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=480&h=200&fit=crop',
  },
  {
    icon: Database,
    title: 'High-Balance Accounts',
    desc: 'Premium checking and credit accounts filtered by available balance, tier, and region for maximum value.',
    tag: 'Premium',
    tagColor: '#EC4899',
    count: '1,600+ in stock',
    image: 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=480&h=200&fit=crop',
  },
  {
    icon: Activity,
    title: 'Business Account Logs',
    desc: 'Corporate and SMB banking logs — payroll accounts, merchant accounts, and multi-user business portals.',
    tag: 'High Value',
    tagColor: '#14B8A6',
    count: '920+ in stock',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=480&h=200&fit=crop',
  },
];

const STEPS = [
  {
    icon: UserPlus,
    num: '01',
    title: 'Create your account',
    desc: 'Sign up in under a minute. No credit card required — just an email and password. Your account is live immediately.',
    img: 'https://images.unsplash.com/photo-1586839049022-52b1ad52cfc6?w=480&h=220&fit=crop',
  },
  {
    icon: Wallet,
    num: '02',
    title: 'Fund your wallet',
    desc: 'Top up with USDT (TRC20 / ERC20), Bitcoin, or Ethereum. Your balance is ready to spend the moment it confirms.',
    img: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=480&h=220&fit=crop',
  },
  {
    icon: ShoppingBag,
    num: '03',
    title: 'Pick your log & checkout',
    desc: 'Browse by country, bank, balance, and type. Add to cart and checkout instantly — log delivered the second you pay.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=480&h=220&fit=crop',
  },
];

const FEATURES = [
  { icon: BadgeCheck, title: 'Verified & Fresh',       desc: 'Every log is screened before it goes live. No dead links, no recycled accounts — only active, working logs.' },
  { icon: Zap,        title: 'Instant Delivery',       desc: 'Order confirmed, log delivered immediately. No waiting, no back-and-forth — straight to your account.' },
  { icon: Lock,       title: 'Crypto-Only Payments',   desc: 'Pay with USDT, BTC, or ETH. Fully anonymous — no credit cards, no chargebacks, no exposure.' },
  { icon: CreditCard, title: 'Premium Bank Logs',      desc: 'Chase, Wells Fargo, BoA, Barclays & more — high-balance accounts from major institutions worldwide.' },
  { icon: Globe,      title: 'US · UK · CA · AU',      desc: 'Bank logs from North America, the UK, Canada, Australia, and more. Filter by country in one click.' },
  { icon: RefreshCw,  title: 'Instant Replace Policy', desc: 'If a log fails after purchase, we replace it immediately or issue a full refund — no delays, no questions.' },
  { icon: Shield,     title: 'Wallet Protection',      desc: 'Your wallet balance is secure. Funds only leave when you place an order — no hidden fees, ever.' },
  { icon: Database,   title: 'Fresh Stock Daily',      desc: 'New logs added every day. Inventory is constantly updated — so you always have fresh options to browse.' },
  { icon: Wallet,     title: 'PayPal & Crypto Accs',   desc: 'PayPal logs, Cash App, Venmo, and crypto accounts — all in one store alongside bank logs.' },
];

const WHY_BULLETS = [
  'Bank logs: Chase, Wells Fargo, BoA, Barclays & more',
  'PayPal logs, Cash App, Venmo, and crypto accounts',
  'High-balance accounts filtered by country & amount',
  'Crypto-only payments — USDT, BTC, ETH — fully anonymous',
];

const TESTIMONIALS = [
  {
    rating: 5,
    text: 'Ordered a Chase log, got it the second I checked out. Balance was exactly as listed — fresh and working. Will definitely be back.',
    name: 'Marcus T.',
    role: 'Verified Buyer · United States',
    initials: 'MT',
    avatarImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    cat: 'Bank Logs',
  },
  {
    rating: 5,
    text: 'Best shop I\'ve used. Everything is verified before it goes live. No dead logs, no wasted money. The crypto checkout makes it super clean.',
    name: 'Jamie K.',
    role: 'Verified Buyer · United Kingdom',
    initials: 'JK',
    avatarImg: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    cat: 'PayPal Logs',
  },
  {
    rating: 5,
    text: 'Found a Barclays log with a solid balance, paid with USDT and got it instantly. Smooth process, zero issues. 10/10.',
    name: 'D. Okonkwo',
    role: 'Verified Buyer · Canada',
    initials: 'DO',
    avatarImg: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    cat: 'Bank Logs',
  },
  {
    rating: 5,
    text: 'The wallet system is smart — top up once and shop multiple times without re-entering anything. Really clean UX.',
    name: 'Reece M.',
    role: 'Verified Buyer · Australia',
    initials: 'RM',
    avatarImg: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    cat: 'Wallet',
  },
  {
    rating: 5,
    text: 'Had a question about an order and support sorted it out fast. Great selection of US bank logs and always fresh stock.',
    name: 'T. Williams',
    role: 'Verified Buyer · United States',
    initials: 'TW',
    avatarImg: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face',
    cat: 'Bank Logs',
  },
  {
    rating: 5,
    text: 'Legit and reliable. Ordered three times now — every log has been live and ready to go. Consistent quality every time.',
    name: 'Kwame A.',
    role: 'Verified Buyer · United Kingdom',
    initials: 'KA',
    avatarImg: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=80&h=80&fit=crop&crop=face',
    cat: 'PayPal Logs',
  },
];

const FAQS = [
  {
    q: 'What types of logs are available?',
    a: 'CATALOG stocks verified bank logs from Chase, Wells Fargo, Bank of America, Barclays and 100+ other institutions — plus PayPal logs, Cash App, Venmo, and crypto accounts. All inventory is screened before going live.',
  },
  {
    q: 'How do I fund my wallet?',
    a: 'Go to your Wallet page, choose an amount, and select your payment method — USDT (TRC20 or ERC20), Bitcoin, or Ethereum. You\'ll get a wallet address and a 10-minute window to send the exact amount. Once confirmed, your balance is ready to spend.',
  },
  {
    q: 'How fast is delivery after I checkout?',
    a: 'Instant. The log is delivered to your account the second your order is placed — no waiting, no back-and-forth. As long as your wallet has enough balance, checkout and delivery happen in seconds.',
  },
  {
    q: 'What if the log doesn\'t work?',
    a: 'We replace it immediately. If any log fails within 15 minutes of delivery, CATALOG issues a replacement of equal or greater value — or a full refund to your wallet. No questions asked.',
  },
  {
    q: 'Which countries are covered?',
    a: 'We carry bank logs from the US, UK, Canada, Australia, and more. You can filter the store by country, bank name, and balance range to find exactly what you need.',
  },
  {
    q: 'Is checkout anonymous?',
    a: 'Yes. All payments are crypto-only — USDT, BTC, or ETH — so your checkout is fully anonymous. No credit cards, no bank transfers, no paper trail.',
  },
  {
    q: 'How is the stock kept fresh?',
    a: 'New logs are added to the catalog daily. Every listing is checked for activity before going live — no dead logs, no recycled accounts. Stock is updated continuously.',
  },
  {
    q: 'How do I contact support?',
    a: 'Our support team is available 24/7. Reach out through the support channel in your account dashboard and we\'ll resolve any issue with your order fast.',
  },
];

/* ─── Helpers ─── */
function BankLogo({ bank }: { bank: typeof BANKS[0] }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className="bank-logo-icon"
      style={failed
        ? { background: bank.color + '22', color: bank.color, border: `1.5px solid ${bank.color}44` }
        : { background: 'var(--glass-bg)', border: '1.5px solid var(--glass-border)', overflow: 'hidden', padding: 0 }
      }
    >
      {failed
        ? <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.56rem' }}>{bank.name.split(' ')[0]}</span>
        : <img src={bank.logo} alt={bank.name} loading="lazy" decoding="async" onError={() => setFailed(true)} style={{ width: '62%', height: '62%', objectFit: 'contain' }} />
      }
    </div>
  );
}

function DashRow({ entry }: { entry: { name: string; abbr: string; color: string; logo: string } }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="dash-row">
      <div className="dash-row-left">
        <div className="dash-bank-logo" style={failed ? { background: entry.color + '22', color: entry.color, border: `1px solid ${entry.color}44` } : { background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', overflow: 'hidden', padding: 0 }}>
          {failed
            ? <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.52rem' }}>{entry.abbr}</span>
            : <img src={entry.logo} alt={entry.abbr} loading="lazy" decoding="async" onError={() => setFailed(true)} style={{ width: '65%', height: '65%', objectFit: 'contain' }} />
          }
        </div>
        <span className="dash-name">{entry.name}</span>
      </div>
      <span className="dash-status">✓ verified</span>
    </div>
  );
}

function AvatarImg({ src, initials, size = 42 }: { src: string; initials: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {!failed
        ? <img src={src} alt={initials} loading="lazy" decoding="async" onError={() => setFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.76rem', color: '#07100D' }}>{initials}</span>
      }
    </div>
  );
}

export default function Landing() {
  const [featured, setFeatured]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading]       = useState(true);
  const [openFaq, setOpenFaq]       = useState<number | null>(null);

  useEffect(() => {
    Promise.all([productApi.featured(), productApi.categories()])
      .then(([f, c]) => { setFeatured(f); setCategories(c); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
      }),
      { rootMargin: '-40px', threshold: 0.06 }
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [loading]);

  // Diagnostic: ?level=N renders only sections 1..N (out of 11).
  // Bisect the landing hang without redeploys.
  const level = (() => {
    if (typeof window === 'undefined') return 99;
    const raw = new URLSearchParams(window.location.search).get('level');
    const n = raw ? parseInt(raw, 10) : NaN;
    return isNaN(n) ? 99 : n;
  })();
  const show = (n: number) => level >= n;

  return (
    <div className="lp">

      {/* ══════════════════════════════
          1. HERO
      ══════════════════════════════ */}
      <section className="lp-hero">
        <div className="hero-bg-grid" />
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />
        <div className="hero-bg-img">
          <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=600&fit=crop" alt="" aria-hidden="true" fetchPriority="low" decoding="async" />
        </div>

        <div className="container">
          <div className="hero-inner">

            {/* LEFT */}
            <div className="hero-copy fade-up">
              <span className="hero-pill">
                <span className="pulse-dot" />
                Now live — CATALOG Marketplace
              </span>

              <h1 className="hero-h1">
                Shop Smart.<br />
                Pay Instantly.<br />
                <span className="green-text">Get logs.</span>
              </h1>

              <p className="hero-p">
                CATALOG is a curated store for premium bank logs, PayPal logs, and
                financial accounts — verified, fresh, and delivered the moment you checkout.
                Fund your wallet with crypto and start shopping in minutes.
              </p>

              <div className="hero-actions">
                <Link to="/shop" className="btn btn-primary btn-lg">
                  Browse the Store <ArrowRight size={17} />
                </Link>
                <Link to="/register" className="btn btn-outline btn-lg">
                  Create Free Account
                </Link>
              </div>

              <div className="hero-trust-avatars">
                <div className="hero-avatars">
                  {['A','B','C','D'].map((l, i) => (
                    <div key={i} className="hero-av" style={{ marginLeft: i > 0 ? -10 : 0 }}>{l}</div>
                  ))}
                </div>
                <span>Trusted by <strong>2,000+</strong> shoppers</span>
              </div>

              <div className="hero-banks-mini">
                <span className="hero-banks-label">Banks in stock:</span>
                <div className="hero-banks-row">
                  {BANKS.slice(0, 6).map((b) => (
                    <div key={b.name} className="hero-bank-img-wrap" title={b.name}>
                      <BankLogo bank={b} />
                    </div>
                  ))}
                  <span className="hero-bank-more">+100</span>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="hero-card-wrap fade-up" style={{ animationDelay: '0.12s' }}>
              <div className="hero-photo-card">
                <img src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=560&h=220&fit=crop" alt="Bank logs" className="hero-photo-img" fetchPriority="high" decoding="async" />
                <div className="hero-photo-overlay">
                  <div className="hero-photo-badge glass">
                    <BadgeCheck size={14} className="green-icon" />
                    <span>Verified &amp; fresh — every listing</span>
                  </div>
                </div>
              </div>

              <div className="hero-dashboard glass">
                <div className="dash-top">
                  <div>
                    <p className="dash-label">Your Wallet Balance</p>
                    <p className="dash-value">$2,500.<span>00</span></p>
                  </div>
                  <span className="dash-badge"><TrendingUp size={12} /> Ready to spend</span>
                </div>

                <div className="dash-entries">
                  {[
                    { name: 'Chase Business — $48,200',  abbr: 'JPM',  color: '#117ACA', logo: 'https://www.google.com/s2/favicons?sz=64&domain=chase.com' },
                    { name: 'Bank of America — $22,400', abbr: 'BOA',  color: '#C0272D', logo: 'https://www.google.com/s2/favicons?sz=64&domain=bankofamerica.com' },
                    { name: 'Barclays — $15,000',        abbr: 'BARC', color: '#00AEEF', logo: 'https://www.google.com/s2/favicons?sz=64&domain=barclays.com' },
                    { name: 'Wells Fargo — $9,850',      abbr: 'WF',   color: '#CF4520', logo: 'https://www.google.com/s2/favicons?sz=64&domain=wellsfargo.com' },
                  ].map((e, i) => <DashRow key={i} entry={e} />)}
                </div>

                <div className="dash-bar-wrap">
                  <div className="dash-bar-label">
                    <span>Store inventory</span>
                    <span className="green-text">1,000+ logs</span>
                  </div>
                  <div className="dash-bar-track">
                    <div className="dash-bar-fill" style={{ width: '78%' }} />
                  </div>
                </div>

                <div className="dash-footer-row">
                  <div className="dash-meta"><Clock size={12} /> Updated just now</div>
                  <div className="dash-mini-stats">
                    <span>US · UK · CA · AU</span>
                    <span className="sep">·</span>
                    <span className="green-text">Fresh</span>
                  </div>
                </div>
              </div>

              <div className="hero-float-badge glass">
                <Lock size={14} className="green-icon" />
                Crypto-only · Fully anonymous checkout
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          2. STATS
      ══════════════════════════════ */}
      {show(2) && (<section className="lp-stats" data-reveal>
        <div className="container">
          <div className="stats-grid glass">
            {STATS.map((s) => (
              <div key={s.label} className="stat-item">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
                <small>{s.sub}</small>
              </div>
            ))}
          </div>
        </div>
      </section>)}

      {/* ══════════════════════════════
          3. BANKS MARQUEE
      ══════════════════════════════ */}
      {show(3) && (<section className="lp-banks" data-reveal>
        <div className="container">
          <div className="section-head center" style={{ marginBottom: 40 }}>
            <p className="eyebrow">What is CATALOG</p>
            <h2>The go-to store for bank logs and financial accounts</h2>
            <p className="section-sub">
              CATALOG stocks verified bank logs, PayPal accounts, crypto wallets, and more —
              all sourced fresh and ready to use. Fund your wallet with crypto, pick what you
              need, and get it instantly.
            </p>
          </div>
        </div>

        <div className="banks-marquee-wrap">
          <div className="banks-fade-left" /><div className="banks-fade-right" />
          <div className="banks-marquee">
            <div className="banks-track">
              {[...BANKS, ...BANKS].map((b, i) => (
                <div key={i} className="bank-logo-card glass">
                  <div className="bank-logo-icon-wrap"><BankLogo bank={b} /></div>
                  <span className="bank-logo-name">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="banks-marquee-wrap" style={{ marginTop: 14 }}>
          <div className="banks-fade-left" /><div className="banks-fade-right" />
          <div className="banks-marquee">
            <div className="banks-track banks-track-reverse">
              {[...BANKS.slice(8), ...BANKS.slice(0,8), ...BANKS.slice(8), ...BANKS.slice(0,8)].map((b, i) => (
                <div key={i} className="bank-logo-card glass">
                  <div className="bank-logo-icon-wrap"><BankLogo bank={b} /></div>
                  <span className="bank-logo-name">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container" style={{ marginTop: 48 }}>
          <div className="banks-info-row">
            {[
              { img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=120&fit=crop', title: 'North America', desc: 'Chase, BOA, Wells Fargo, Citi, Capital One, PNC, US Bank, TD, Ally & more' },
              { img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=120&fit=crop', title: 'Europe & UK',   desc: 'Barclays, HSBC, Deutsche Bank, Santander, BNP Paribas, ING, Revolut & more' },
              { img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=120&fit=crop', title: 'Asia-Pacific',  desc: 'DBS, ANZ, NAB, Commonwealth Bank, ICBC, MUFG, Macquarie & more' },
            ].map((c, i) => (
              <div key={i} className="banks-info-card glass">
                <img src={c.img} alt={c.title} className="banks-info-img" loading="lazy" decoding="async" />
                <div className="banks-info-body"><strong>{c.title}</strong><span>{c.desc}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>)}

      {/* ══════════════════════════════
          4. LOG TYPES
      ══════════════════════════════ */}
      {show(4) && (<section className="lp-section lp-logtypes" data-reveal>
        <div className="container">
          <div className="section-head center">
            <p className="eyebrow">What we stock</p>
            <h2>Every type of financial log, in one store</h2>
            <p className="section-sub">
              Bank logs, PayPal logs, crypto accounts, and more — all verified, fresh,
              and instantly delivered after checkout.
            </p>
          </div>
          <div className="logtypes-grid">
            {LOG_TYPES.map((lt, i) => (
              <div key={i} className="logtype-card glass">
                <div className="logtype-img-wrap">
                  <img src={lt.image} alt={lt.title} className="logtype-img" loading="lazy" decoding="async" />
                  <span className="logtype-tag" style={{ background: lt.tagColor + '22', color: lt.tagColor, border: `1px solid ${lt.tagColor}44` }}>{lt.tag}</span>
                </div>
                <div className="logtype-body">
                  <div className="logtype-icon"><lt.icon size={18} /></div>
                  <h3>{lt.title}</h3>
                  <p>{lt.desc}</p>
                  <div className="logtype-footer">
                    <span className="logtype-count">{lt.count}</span>
                    <Link to="/shop" className="logtype-link">Browse <ChevronRight size={14} /></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>)}

      {/* ══════════════════════════════
          5. HOW IT WORKS
      ══════════════════════════════ */}
      {show(5) && (<section className="lp-section lp-how" data-reveal>
        <div className="container">
          <div className="section-head center">
            <p className="eyebrow">How it works</p>
            <h2>Get started in 3 simple steps</h2>
            <p className="section-sub">
              From sign-up to log delivered — the whole process takes under two minutes.
            </p>
          </div>
          <div className="how-grid">
            {STEPS.map((s, i) => (
              <div key={i} className="how-card glass">
                <div className="how-img-wrap">
                  <img src={s.img} alt={s.title} className="how-img" loading="lazy" decoding="async" />
                  <div className="how-num-badge">{s.num}</div>
                </div>
                <div className="how-body">
                  <div className="how-icon"><s.icon size={18} /></div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>)}

      {/* ══════════════════════════════
          6. FEATURES
      ══════════════════════════════ */}
      {show(6) && (<section className="lp-section lp-features" data-reveal>
        <div className="container">
          <div className="section-head center">
            <p className="eyebrow">Why CATALOG</p>
            <h2>Fresh logs. Verified accounts. Instant access.</h2>
            <p className="section-sub">
              Every log is screened before it goes live. No dead links, no recycled accounts.
              Pay with crypto, stay anonymous, get your order the second it's placed.
            </p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card glass">
                <div className="feature-icon"><f.icon size={20} /></div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>)}

      {/* ══════════════════════════════
          7. WHY / SECURITY
      ══════════════════════════════ */}
      {show(7) && (<section className="lp-section lp-why" data-reveal>
        <div className="container">
          <div className="why-inner">
            <div className="why-copy">
              <p className="eyebrow">Why CATALOG</p>
              <h2>Fresh logs. Verified accounts. Instant access.</h2>
              <p className="section-sub" style={{ marginLeft: 0 }}>
                Every log on CATALOG is screened before it goes live. No dead links, no recycled
                accounts. We carry bank logs from major US, UK, Canadian, and Australian banks —
                plus PayPal, Cash App, and crypto accounts. Pay with crypto, stay anonymous, and
                get your order the second it's placed.
              </p>
              <ul className="why-list">
                {WHY_BULLETS.map((b, i) => (
                  <li key={i}><CheckCircle size={16} className="green-icon" /><span>{b}</span></li>
                ))}
              </ul>
              <Link to="/register" className="btn btn-primary" style={{ marginTop: 32 }}>
                Create Free Account <ArrowRight size={15} />
              </Link>
            </div>

            <div className="why-right">
              <div className="why-img-wrap">
                <img src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=560&h=280&fit=crop" alt="Security" className="why-img" loading="lazy" decoding="async" />
                <div className="why-img-badge glass">
                  <Lock size={15} className="green-icon" />
                  <span>Crypto-only · 256-bit encrypted</span>
                </div>
              </div>

              {/* wallet mockup */}
              <div className="why-wallet-card glass">
                <div className="why-wallet-header">
                  <div className="why-wallet-brand">
                    <span className="pulse-dot" />&nbsp; CATALOG
                  </div>
                  <span className="why-wallet-live">● Live</span>
                </div>
                <p className="why-wallet-label">Wallet Balance</p>
                <p className="why-wallet-big">$2,500.00</p>
                <p className="why-wallet-sub">Ready to spend</p>
                <div className="why-wallet-divider" />
                <p className="why-wallet-label">Accepted payments</p>
                <div className="why-crypto-row">
                  {['USDT TRC20','USDT ERC20','Bitcoin','Ethereum'].map((c) => (
                    <span key={c} className="why-crypto-chip">{c}</span>
                  ))}
                </div>
                <div className="why-wallet-divider" />
                <p className="why-wallet-label">Coverage</p>
                <div className="why-flags">
                  {[{f:'🇺🇸',c:'US'},{f:'🇬🇧',c:'UK'},{f:'🇨🇦',c:'CA'},{f:'🇦🇺',c:'AU'}].map((x) => (
                    <div key={x.c} className="why-flag-chip"><span>{x.f}</span><span>{x.c}</span></div>
                  ))}
                </div>
                <Link to="/shop" className="btn btn-primary" style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}>
                  Browse the Store <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>)}

      {/* ══════════════════════════════
          8. TESTIMONIALS
      ══════════════════════════════ */}
      {show(8) && (<section className="lp-section lp-testi" data-reveal>
        <div className="container">
          <div className="section-head center">
            <p className="eyebrow">Customer Reviews</p>
            <h2>Trusted by buyers worldwide</h2>
            <p className="section-sub">Real buyers share their experience — unfiltered.</p>
          </div>
          <div className="testi-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testi-card glass">
                <div className="testi-stars">
                  {Array.from({ length: t.rating }, (_, k) => <Star key={k} size={13} fill="currentColor" />)}
                </div>
                <p className="testi-text">"{t.text}"</p>
                <span className="testi-cat">{t.cat}</span>
                <div className="testi-author">
                  <AvatarImg src={t.avatarImg} initials={t.initials} size={42} />
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>)}

      {/* ══════════════════════════════
          9. BROWSE
      ══════════════════════════════ */}
      {show(9) && (categories.length > 0 || featured.length > 0) && (
        <section className="lp-section lp-browse" data-reveal>
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow">Live inventory</p>
                <h2>Browse the store</h2>
              </div>
              <Link to="/shop" className="btn btn-ghost">View all <ChevronRight size={15} /></Link>
            </div>
            {categories.length > 0 && (
              <div className="cat-row" style={{ marginBottom: 32 }}>
                {categories.map((c) => (
                  <Link key={c} to={`/shop?category=${encodeURIComponent(c)}`} className="cat-chip">{c}</Link>
                ))}
              </div>
            )}
            {loading ? <Loader /> : (
              <div className="grid-products">
                {featured.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══════════════════════════════
          10. FAQ
      ══════════════════════════════ */}
      {show(10) && (<section className="lp-section lp-faq" data-reveal>
        <div className="container">
          <div className="faq-wrap">
            <div className="faq-head">
              <p className="eyebrow">Got questions?</p>
              <h2>Frequently asked questions</h2>
              <p className="section-sub" style={{ marginTop: 12, marginLeft: 0, maxWidth: 340 }}>
                Everything you need to know before your first order.
              </p>
              <div className="faq-head-img-wrap">
                <img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=360&h=180&fit=crop" alt="Support" className="faq-head-img" loading="lazy" decoding="async" />
              </div>
              <div className="faq-head-stats">
                <div className="faq-head-stat"><strong>8</strong><span>Questions</span></div>
                <div className="faq-head-stat"><strong>24/7</strong><span>Support</span></div>
              </div>
            </div>
            <div className="faq-list">
              {FAQS.map((f, i) => (
                <div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <div className="faq-q">
                    <span>{f.q}</span>
                    <ChevronDown size={18} className="faq-chevron" />
                  </div>
                  <div className="faq-a">{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>)}

      {/* ══════════════════════════════
          11. CTA
      ══════════════════════════════ */}
      {show(11) && (<section className="lp-cta" data-reveal>
        <div className="container">
          <div className="cta-inner glass">
            <div className="cta-bg-img">
              <img src="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1400&h=500&fit=crop" alt="" aria-hidden="true" loading="lazy" decoding="async" />
            </div>
            <div className="cta-glow" /><div className="cta-glow-2" />
            <div className="cta-copy">
              <p className="eyebrow" style={{ color: 'var(--green)' }}>Ready to browse the store?</p>
              <h2>Hundreds of fresh logs, ready now.</h2>
              <p>
                Hundreds of fresh bank logs, PayPal accounts, and more — all verified and ready.
                Top up with crypto and start shopping in minutes.
              </p>
              <div className="cta-trust-row">
                <span><CheckCircle size={14} className="green-icon" /> Verified &amp; fresh</span>
                <span><CheckCircle size={14} className="green-icon" /> Instant delivery</span>
                <span><CheckCircle size={14} className="green-icon" /> Crypto payments</span>
              </div>
            </div>
            <div className="cta-actions">
              <Link to="/shop" className="btn btn-primary btn-lg">Browse the Store <ArrowRight size={17} /></Link>
              <Link to="/register" className="btn btn-outline btn-lg">Create Free Account</Link>
            </div>
          </div>
        </div>
      </section>)}

    </div>
  );
}
