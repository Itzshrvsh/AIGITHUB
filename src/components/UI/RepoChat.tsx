"use client";

import React, { useState } from "react";
import { Send, Terminal, Loader2, AlertTriangle, MessageSquareCode } from "lucide-react";

export default function RepoChat({ repoId }: { repoId: number }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ answer: string; isSarcastic: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId, question }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error("Chat failed:", error);
      setResponse({ answer: "System failure. Could not reach Neural Core.", isSarcastic: false });
    } finally {
      setLoading(false);
      setQuestion("");
    }
  };

  return (
    <section className="mt-12 glass-panel p-8 rounded-sm relative overflow-hidden group border-cyan-500/10">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
        <Terminal className="w-24 h-24 text-cyan-400" />
      </div>

      <div className="flex items-center gap-3 border-b border-cyan-500/10 pb-4 mb-6">
        <MessageSquareCode className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-bold uppercase tracking-widest text-white">Direct Neural Interface</h2>
      </div>

      <p className="text-sm text-slate-400 font-light mb-6">
        Query the intelligence core directly regarding this repository architecture. Off-topic inquiries will be dealt with harshly.
      </p>

      {response && (
        <div className={`mb-6 p-4 rounded-sm border ${response.isSarcastic ? 'bg-red-950/20 border-red-500/30' : 'bg-cyan-950/20 border-cyan-500/30'} animate-in fade-in slide-in-from-bottom-2`}>
          <div className="flex items-start gap-3">
            {response.isSarcastic ? (
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <Terminal className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className={`text-[10px] font-bold tracking-widest uppercase mb-2 ${response.isSarcastic ? 'text-red-400' : 'text-cyan-400'}`}>
                {response.isSarcastic ? "UNAUTHORIZED INQUIRY DETECTED" : "INTELLIGENCE RESPONSE"}
              </div>
              <p className={`text-sm leading-relaxed whitespace-pre-wrap ${response.isSarcastic ? 'text-red-200/80 italic font-medium' : 'text-slate-300 font-light'}`}>
                {response.answer}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-4 relative z-10">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a technical question about this repository..."
          disabled={loading}
          className="flex-1 bg-black/40 border border-white/10 rounded-sm px-4 py-3 text-sm text-cyan-100 placeholder:text-cyan-900 focus:outline-none focus:border-cyan-500/50 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-6 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-sm text-cyan-400 font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="flex items-center gap-2">Execute <Send className="w-4 h-4" /></span>}
        </button>
      </form>
    </section>
  );
}
