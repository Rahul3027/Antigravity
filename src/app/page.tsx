import Link from "next/link";

export default function Home() {
  return (
    <main className="main-container" style={{ alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '4rem', maxWidth: '800px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', fontWeight: 800, background: 'linear-gradient(to right, #fff, var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Master Your Case Interviews with AI
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3rem', lineHeight: 1.6 }}>
          Practice consulting case studies with a highly realistic AI interviewer.
          Receive granular feedback on structuring, communication, and business acumen to land your dream offer.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/signup" className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
            Start Practicing Now
          </Link>
          <Link href="/login" className="btn-primary" style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
            Log In
          </Link>
        </div>
      </div>
    </main>
  );
}
