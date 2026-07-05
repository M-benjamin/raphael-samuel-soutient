export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafcfc', flexDirection: 'column', gap: 16, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #0d7377, #14a8b5)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a2e35', margin: 0 }}>Site Not Found</h1>
      <p style={{ fontSize: 15, color: 'rgba(26,46,53,0.5)', margin: 0, textAlign: 'center', maxWidth: 360 }}>
        This practice website doesn't exist or hasn't been published yet.
      </p>
      <a href="/" style={{ marginTop: 8, padding: '10px 24px', borderRadius: 40, background: '#0d7377', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
        Go Home
      </a>
    </div>
  );
}
