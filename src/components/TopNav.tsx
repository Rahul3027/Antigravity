"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";

export function TopNav({ user }: { user: any }) {
  return (
    <nav className="glass-panel" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem', borderRadius: '12px' }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}><Link href="/dashboard">Case Study AI</Link></div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-muted)' }}>{user?.name}</span>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-primary" style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
          Logout
        </button>
      </div>
    </nav>
  );
}
