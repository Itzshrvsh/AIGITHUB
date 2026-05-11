"use client";

import React, { useState, useEffect } from "react";
import { Loader2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface Repo {
  id: number;
  fullName: string;
  summary: string | null;
  language: string | null;
  stars: number | null;
  overallScore: number | null;
}

export default function RepoListItem({ repo }: { repo: Repo }) {
  const [showOptions, setShowOptions] = useState(false);
  const [isReranking, setIsReranking] = useState(false);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isReranking) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/status");
        const data = await res.json();
        const job = data.jobs.find((j: any) => j.repoName === repo.fullName);
        
        if (!job || job.status === "completed" || job.status === "error") {
          setIsReranking(false);
          router.refresh();
          clearInterval(interval);
        }
      } catch (e) {
        setIsReranking(false);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isReranking, repo.fullName, router]);

  const handleRerank = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptions(false);
    setIsReranking(true);
    try {
      await fetch("/api/rerank", {
        method: "POST",
        body: JSON.stringify({ id: repo.id }),
      });
    } catch (e) {
      console.error("Rerank failed", e);
      setIsReranking(false);
    }
  };

  return (
    <div 
      className={`group p-4 bg-white/[0.02] border ${showOptions ? "border-cyan-500/40 bg-cyan-500/5" : "border-white/5"} hover:border-cyan-500/30 transition-all cursor-pointer relative overflow-hidden rounded-sm`}
      onClick={() => setShowOptions(!showOptions)}
    >
      <div className="flex justify-between items-start mb-2 relative z-10">
        <span className="text-[10px] font-bold text-slate-100 tracking-wider truncate mr-2">{repo.fullName}</span>
        <div className="flex items-center gap-1 shrink-0">
          {isReranking ? (
            <Loader2 className="w-2 h-2 animate-spin text-cyan-400" />
          ) : (
            <div className={`w-1 h-1 rounded-full ${repo.summary ? "bg-cyan-400" : "bg-red-500 animate-pulse"}`} />
          )}
          <span className={`text-[8px] font-mono font-bold ${repo.summary ? "text-cyan-400" : "text-red-400"}`}>
            {isReranking ? "RERANKING" : repo.summary ? "ANALYZED" : "FAILED"}
          </span>
        </div>
      </div>
      
      {showOptions ? (
        <div className="relative z-20 flex items-center gap-2 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <button 
            onClick={handleRerank}
            className="flex-1 py-1 px-2 bg-cyan-500/20 border border-cyan-500/30 rounded-sm text-[8px] text-cyan-400 font-bold tracking-widest uppercase hover:bg-cyan-500/30 transition-colors"
          >
            Execute Rerank
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowOptions(false); }}
            className="py-1 px-2 border border-white/10 rounded-sm text-[8px] text-slate-500 font-bold uppercase hover:bg-white/5"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <p className="text-[10px] text-slate-500 line-clamp-1 mb-3 font-light leading-relaxed">
            {repo.summary || "Strategizing software architecture..."}
          </p>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex gap-2">
              <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-sm text-[8px] text-slate-400 font-mono uppercase">
                {repo.language || "Unknown"}
              </span>
              <span className="text-[8px] text-slate-500 font-mono mt-0.5 tracking-tighter">★ {repo.stars}</span>
            </div>
            <span className="text-[10px] text-cyan-400 font-bold font-mono">{(repo.overallScore || 0).toFixed(1)}%</span>
          </div>
          {mounted && repo.lastAnalyzedAt && (
            <div className="mt-2 flex items-center justify-between">
              <div className="text-[7px] text-slate-600 font-mono uppercase tracking-tighter">
                Last Scan: {new Date(repo.lastAnalyzedAt).toLocaleTimeString()}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); window.location.href = `/report/${repo.id}`; }}
                className="flex items-center gap-1 text-[8px] text-cyan-500/60 hover:text-cyan-400 font-bold uppercase tracking-widest transition-colors"
              >
                Brief <ExternalLink className="w-2 h-2" />
              </button>
            </div>
          )}
        </>
      )}

      <div className="absolute inset-0 bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}
