import { useCallback, useEffect, useRef, useState } from 'react';
import { chatApi, ChatMsg } from '../api/services';
import { useAuth } from '../context/AuthContext';
import './ChatWidget.css';

const SESSION_KEY = 'cat_chat_session';
const CONTACT_KEY = 'cat_chat_contact';
const POLL_MS = 4000;

function getSessionId(): string {
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const uuid = (crypto as { randomUUID?: () => string })?.randomUUID?.();
  const id: string = uuid ?? `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(SESSION_KEY, id);
  return id;
}

type Contact = { name?: string; email?: string };
function loadContact(): Contact {
  try { return JSON.parse(localStorage.getItem(CONTACT_KEY) || '{}'); } catch { return {}; }
}
function saveContact(c: Contact) {
  try { localStorage.setItem(CONTACT_KEY, JSON.stringify(c)); } catch { /* ignore */ }
}

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [contact, setContact] = useState<Contact>(loadContact);
  const listRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>('');
  const lastFetchedAt = useRef<string>('');

  // Init session id lazily on first open (avoids setting localStorage for users who never open).
  const ensureSession = useCallback(() => {
    if (!sessionIdRef.current) sessionIdRef.current = getSessionId();
    return sessionIdRef.current;
  }, []);

  // Poll for new messages while the panel is open.
  useEffect(() => {
    if (!open) return;
    const sid = ensureSession();

    let cancelled = false;
    const tick = async () => {
      try {
        const { messages: batch } = await chatApi.mine(sid, lastFetchedAt.current || undefined);
        if (cancelled) return;
        if (batch.length) {
          setMessages((prev) => {
            const seen = new Set(prev.map((m) => m._id));
            const merged = [...prev, ...batch.filter((m) => !seen.has(m._id))];
            const last = merged[merged.length - 1];
            if (last) lastFetchedAt.current = last.createdAt;
            return merged;
          });
        }
      } catch {
        // Silently ignore; try again next tick.
      }
    };
    tick();
    const id = setInterval(tick, POLL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, [open, ensureSession]);

  // Auto-scroll to bottom on new messages.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  const needsContact = !user && !contact.name && !contact.email;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    if (needsContact) return; // guarded by form below

    setSending(true);
    const sid = ensureSession();
    const optimistic: ChatMsg = {
      _id: `tmp-${Date.now()}`,
      from: 'user',
      text: body,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setText('');

    try {
      const { message } = await chatApi.send(sid, body, contact.name, contact.email);
      setMessages((prev) => prev.map((m) => (m._id === optimistic._id ? message : m)));
      lastFetchedAt.current = message.createdAt;
    } catch {
      setMessages((prev) => prev.map((m) => (m._id === optimistic._id ? { ...m, text: m.text + ' (failed)' } : m)));
    } finally {
      setSending(false);
    }
  };

  const submitContact = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const nameEl = form.elements.namedItem('name') as HTMLInputElement;
    const emailEl = form.elements.namedItem('email') as HTMLInputElement;
    const next: Contact = {
      name: nameEl.value.trim() || undefined,
      email: emailEl.value.trim() || undefined,
    };
    if (!next.name && !next.email) return;
    saveContact(next);
    setContact(next);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          className="cw-bubble"
          aria-label="Open chat"
          onClick={() => setOpen(true)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v9A2.5 2.5 0 0 1 17.5 17H9l-4 4v-4H6.5A2.5 2.5 0 0 1 4 14.5v-9Z"
                  stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {open && (
        <div className="cw-panel" role="dialog" aria-label="Support chat">
          <div className="cw-head">
            <div className="cw-head-title">
              <span className="cw-dot" /> Support
            </div>
            <button type="button" className="cw-close" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
          </div>

          <div ref={listRef} className="cw-list">
            {messages.length === 0 && (
              <div className="cw-empty">
                Hi — we typically reply in a few minutes. Send a message and we'll get back to you.
              </div>
            )}
            {messages.map((m) => (
              <div key={m._id} className={`cw-msg cw-msg-${m.from}`}>
                <div className="cw-bubble-text">{m.text}</div>
              </div>
            ))}
          </div>

          {needsContact ? (
            <form className="cw-contact" onSubmit={submitContact}>
              <div className="cw-contact-hint">Before we start — how should we reach you?</div>
              <input name="name" placeholder="Name (optional)" autoComplete="name" />
              <input name="email" type="email" placeholder="Email" autoComplete="email" required />
              <button type="submit">Start chat</button>
            </form>
          ) : (
            <form className="cw-input" onSubmit={send}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message…"
                disabled={sending}
                maxLength={2000}
                autoFocus
              />
              <button type="submit" disabled={sending || !text.trim()} aria-label="Send">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3.4 20.6 21 12 3.4 3.4 3 10l13 2-13 2 .4 6.6Z" fill="currentColor"/>
                </svg>
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
