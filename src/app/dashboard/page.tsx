import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { TopNav } from "@/components/TopNav";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const pastSessions = await prisma.session.findMany({
    where: { userId: (session.user as any).id },
    include: { report: true },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="main-container">
      <TopNav user={session.user} />
      <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem' }}>Your Dashboard</h1>
          <form action="/api/sessions/create" method="POST">
             <button type="submit" className="btn-primary">Start New Interview</button>
          </form>
        </div>

        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Past Sessions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pastSessions.length === 0 ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              You haven't started any case studies yet.
            </div>
          ) : (
            pastSessions.map(s => (
              <div key={s.id} className="glass-panel animate-fade-in" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Session on {new Date(s.startDate).toLocaleDateString()}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Status: {s.status}</div>
                </div>
                <Link href={s.status === 'COMPLETED' ? `/report/${s.id}` : `/interview/${s.id}`} className="btn-primary" style={{ padding: '8px 16px' }}>
                  {s.status === 'COMPLETED' ? 'View Report' : 'Resume'}
                </Link>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
