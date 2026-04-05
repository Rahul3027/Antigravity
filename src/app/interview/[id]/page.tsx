"use client";
import { useState, useRef, useEffect, use } from "react";
import { TopNav } from "@/components/TopNav";
import { useSession } from "next-auth/react";

export default function Interview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [messages, setMessages] = useState<{ role: string, text: string }[]>([
    { role: "interviewer", text: "Hello! I will be your interviewer today. Are you ready to begin the case?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const newMsgs = [...messages, { role: "user", text: input }];
    setMessages(newMsgs);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id, messages: newMsgs })
      });
      const data = await res.json();
      setMessages([...newMsgs, { role: "interviewer", text: data.response }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="main-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopNav user={session?.user} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        {messages.map((m, i) => (
          <div key={i} className="animate-fade-in" style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            background: m.role === "user" ? "var(--primary)" : "rgba(255, 255, 255, 0.05)",
            border: m.role === "user" ? "none" : "1px solid var(--panel-border)",
            padding: '1rem 1.5rem',
            borderRadius: '16px',
            maxWidth: '80%',
            lineHeight: 1.5
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '0.8rem', opacity: 0.7 }}>
              {m.role === "user" ? "You" : "Interviewer"}
            </div>
            <div>{m.text}</div>
          </div>
        ))}
        {isLoading && <div style={{ alignSelf: "flex-start", opacity: 0.5 }}>Interviewer is evaluating...</div>}
        <div ref={endRef} />
      </div>
      <div style={{ padding: '2rem', borderTop: '1px solid var(--panel-border)', background: 'var(--bg-color)' }}>
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
          <input className="input-field" value={input} onChange={e => setInput(e.target.value)} placeholder="Type your response..." disabled={isLoading} />
          <button type="submit" className="btn-primary" disabled={isLoading}>Send</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <form action={`/api/sessions/end`} method="POST">
             <input type="hidden" name="sessionId" value={id} />
             <input type="hidden" name="transcript" value={JSON.stringify(messages)} />
             <button type="submit" className="btn-primary" style={{ background: '#ef4444' }}>End Interview</button>
          </form>
        </div>
      </div>
    </div>
  );
}
