import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container" style={{ minHeight: 'calc(100vh - 68px)', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <div className="fade-up">
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '6rem', lineHeight: 1 }} className="text-grad">404</div>
        <h2 style={{ fontSize: '1.6rem', margin: '10px 0 8px' }}>Page not found</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: 24 }}>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">Back home</Link>
      </div>
    </div>
  );
}
