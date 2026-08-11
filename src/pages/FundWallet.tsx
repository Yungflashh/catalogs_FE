import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cryptoWalletApi, walletFundingApi, uploadApi } from '../api/services';
import { CryptoWallet, WalletFunding } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loader } from '../components/Shared';
import { CopyIcon, UploadIcon, ClockIcon, CheckCircleIcon, ArrowRight } from '../components/Icons';
import './FundWallet.css';

type Step = 'select' | 'pay' | 'done';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function FundWallet() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { notify } = useToast();

  const [step, setStep] = useState<Step>('select');
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(true);

  // Step 1
  const [amount, setAmount] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [creating, setCreating] = useState(false);

  // Step 2
  const [funding, setFunding] = useState<WalletFunding | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [proofUrl, setProofUrl] = useState('');
  const [proofPreview, setProofPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    cryptoWalletApi.active()
      .then(setWallets)
      .catch(() => notify('Could not load payment wallets', 'error'))
      .finally(() => setLoadingWallets(false));
  }, []);

  // Countdown
  useEffect(() => {
    if (!funding || step !== 'pay') return;
    const tick = () => {
      const remaining = Math.max(0, Math.floor((new Date(funding.expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [funding, step]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) < 1) { notify('Enter an amount of at least $1', 'error'); return; }
    if (!selectedWallet) { notify('Select a payment wallet', 'error'); return; }
    setCreating(true);
    try {
      const f = await walletFundingApi.create(Number(amount), selectedWallet);
      setFunding(f);
      setStep('pay');
    } catch (err) {
      notify((err as Error).message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = () => {
    if (!funding) return;
    navigator.clipboard.writeText((funding.cryptoWallet as CryptoWallet).address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadApi.image(file);
      setProofUrl(url);
      setProofPreview(url);
    } catch {
      notify('Image upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofUrl.trim()) { notify('Please upload or paste a proof image', 'error'); return; }
    if (!funding) return;
    if (timeLeft === 0) { notify('This request has expired. Please start a new one.', 'error'); return; }
    setSubmitting(true);
    try {
      await walletFundingApi.submitProof(funding._id, proofUrl.trim());
      setStep('done');
    } catch (err) {
      notify((err as Error).message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const wallet = funding ? (funding.cryptoWallet as CryptoWallet) : null;
  const expired = timeLeft === 0 && step === 'pay';
  const urgency = timeLeft < 120 ? 'danger' : timeLeft < 300 ? 'warn' : 'ok';

  return (
    <div className="container">
      <div className="fw-wrap">
        <div className="fw-header">
          <button className="btn btn-ghost btn-sm fw-back" onClick={() => step === 'select' ? navigate('/wallet') : setStep('select')}>
            ← Back
          </button>
          <div className="fw-steps">
            {(['select', 'pay', 'done'] as Step[]).map((s, i) => (
              <div key={s} className={`fw-step ${step === s ? 'active' : ''} ${(['pay', 'done'].indexOf(step) > ['select', 'pay', 'done'].indexOf(s) - 1) ? 'done-step' : ''}`}>
                <span className="fw-step-dot">{i + 1}</span>
                <span className="fw-step-label">{['Select amount', 'Make payment', 'Done'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Step 1: Select amount + wallet ── */}
        {step === 'select' && (
          <div className="fw-card glass fade-up">
            <h2 className="fw-title">Fund your wallet</h2>
            <p className="fw-sub">Choose an amount and a crypto payment method.</p>

            {loadingWallets ? <Loader /> : wallets.length === 0 ? (
              <div className="fw-empty">No payment wallets are currently available. Check back later.</div>
            ) : (
              <form onSubmit={handleCreateRequest} className="fw-form">
                <div className="fw-field">
                  <label className="fw-label">Amount (USD)</label>
                  <div className="fw-amount-row">
                    <span className="fw-dollar">$</span>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      className="fw-input fw-amount-input"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="fw-field">
                  <label className="fw-label">Select payment wallet</label>
                  <div className="fw-wallet-list">
                    {wallets.map((w) => (
                      <label key={w._id} className={`fw-wallet-option ${selectedWallet === w._id ? 'on' : ''}`}>
                        <input
                          type="radio"
                          name="wallet"
                          value={w._id}
                          checked={selectedWallet === w._id}
                          onChange={() => setSelectedWallet(w._id)}
                        />
                        <div className="fw-wallet-symbol">{w.symbol}</div>
                        <div className="fw-wallet-info">
                          <span className="fw-wallet-name">{w.name}</span>
                          {w.network && <span className="fw-wallet-network">{w.network}</span>}
                          <span className="fw-wallet-addr">{w.address.slice(0, 16)}…</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="fw-notice glass">
                  <ClockIcon size={16} /> You will have <strong>10 minutes</strong> to complete the payment and upload proof after proceeding.
                </div>

                <button className="btn btn-primary btn-block" disabled={creating}>
                  {creating ? 'Generating address…' : 'Proceed to payment'} <ArrowRight size={17} />
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── Step 2: Pay + upload proof ── */}
        {step === 'pay' && funding && wallet && (
          <div className="fw-card glass fade-up">
            <div className="fw-pay-header">
              <div>
                <h2 className="fw-title">Complete payment</h2>
                <p className="fw-sub">Send exactly <strong>${Number(funding.amount).toFixed(2)}</strong> worth of <strong>{wallet.symbol}</strong> to the address below.</p>
              </div>
              <div className={`fw-timer fw-timer-${urgency}`}>
                <ClockIcon size={15} />
                {expired ? <span>Expired</span> : <span>{formatTime(timeLeft)}</span>}
              </div>
            </div>

            {expired ? (
              <div className="fw-expired">
                <p>This payment window has expired.</p>
                <button className="btn btn-primary" onClick={() => { setFunding(null); setProofUrl(''); setProofPreview(''); setStep('select'); }}>
                  Start a new request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitProof} className="fw-form">
                <div className="fw-address-card glass">
                  <div className="fw-address-top">
                    <span className="fw-address-label">{wallet.name} {wallet.network && `(${wallet.network})`} address</span>
                    <button type="button" className="btn btn-ghost btn-sm fw-copy-btn" onClick={handleCopy}>
                      <CopyIcon size={14} /> {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="fw-address-value">{wallet.address}</div>
                </div>

                <div className="fw-amount-badge">
                  Send: <strong>${Number(funding.amount).toFixed(2)}</strong> in {wallet.symbol}
                </div>

                <div className="fw-field">
                  <label className="fw-label">Upload payment proof</label>
                  <p className="fw-field-hint">Screenshot of your transaction confirmation.</p>

                  <div className="fw-proof-area">
                    {proofPreview ? (
                      <div className="fw-proof-preview">
                        <img src={proofPreview} alt="Payment proof" />
                        <button type="button" className="fw-proof-remove" onClick={() => { setProofUrl(''); setProofPreview(''); }}>✕ Remove</button>
                      </div>
                    ) : (
                      <button type="button" className="fw-upload-btn" onClick={() => fileRef.current?.click()} disabled={uploading}>
                        <UploadIcon size={22} />
                        <span>{uploading ? 'Uploading…' : 'Click to upload screenshot'}</span>
                      </button>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                  </div>

                  <div className="fw-or"><span>or paste image URL</span></div>
                  <input
                    type="url"
                    className="fw-input"
                    placeholder="https://example.com/proof.png"
                    value={proofUrl}
                    onChange={(e) => { setProofUrl(e.target.value); setProofPreview(e.target.value); }}
                  />
                </div>

                <button className="btn btn-primary btn-block" disabled={submitting || !proofUrl.trim()}>
                  {submitting ? 'Submitting…' : "I've made payment — submit proof"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── Step 3: Done ── */}
        {step === 'done' && (
          <div className="fw-card fw-done glass fade-up">
            <div className="fw-done-icon">
              <CheckCircleIcon size={48} />
            </div>
            <h2 className="fw-title">Proof submitted!</h2>
            <p className="fw-sub">
              Your payment proof has been received. Our team will verify it and credit{' '}
              <strong>${Number(funding?.amount ?? 0).toFixed(2)}</strong> to your wallet shortly.
            </p>
            <p className="fw-sub" style={{ marginTop: 8 }}>
              You'll see the funds appear in your wallet once approved.
            </p>
            <div className="fw-done-actions">
              <button className="btn btn-primary" onClick={() => navigate('/wallet')}>Back to wallet</button>
              <button className="btn btn-ghost" onClick={() => { setStep('select'); setFunding(null); setProofUrl(''); setProofPreview(''); setAmount(''); setSelectedWallet(''); }}>
                Fund again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
