import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import Link from "next/link";

export default async function Report({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const report = await prisma.report.findUnique({
    where: { sessionId: id },
    include: { session: true }
  });

  if (!report) {
    return <div className="main-container" style={{ padding: '2rem', textAlign: 'center' }}>Report not found or still generating...</div>;
  }

  return (
    <div className="main-container">
      <TopNav user={session.user} />
      <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>Interview Feedback</h1>
        
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>Overall Score</h2>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: report.score > 70 ? '#10b981' : '#f59e0b' }}>
              {report.score}/100
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{report.feedback}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', textAlign: 'center', animationDelay: '0.1s' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{report.structuring}/10</div>
            <div style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Structuring</div>
          </div>
          <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', textAlign: 'center', animationDelay: '0.2s' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{report.communication}/10</div>
            <div style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Communication</div>
          </div>
          <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', textAlign: 'center', animationDelay: '0.3s' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{report.businessAcumen}/10</div>
            <div style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Business Acumen</div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link href="/dashboard" className="btn-primary" style={{ padding: '12px 24px' }}>
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
