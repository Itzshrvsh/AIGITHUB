"use client";

import React, { useEffect, useState } from "react";
import { Terminal, Cpu, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface Job {
  repoName: string;
  status: string;
  message: string;
}

export default function LLMMonitor() {
  const [data, setData] = useState<{ jobs: Job[]; logs: string[] }>({ jobs: [], logs: [] });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/status");
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Monitor poll failed", e);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (data.jobs.length === 0 && !isExpanded) return null;

  return (
    <div className="fixed bottom-6 right-6 w-80 argus-panel border border-cyan-500/20 z-50 overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all duration-300">
      <div 
        className="flex items-center justify-between p-3 bg-cyan-950/20 cursor-pointer border-b border-cyan-500/10"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Cpu className={`w-4 h-4 ${data.jobs.length > 0 ? "text-cyan-400 neural-pulse" : "text-gray-500"}`} />
            {data.jobs.length > 0 && <div className="absolute inset-0 bg-cyan-400 blur-md animate-pulse opacity-50" />}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/80">
            Neural Matrix Status
          </span>
        </div>
        {isExpanded ? <ChevronDown className="w-3 h-3 text-cyan-400/60" /> : <ChevronUp className="w-3 h-3 text-cyan-400/60" />}
      </div>

      {data.jobs.length > 0 && (
        <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
          {data.jobs.map((job) => (
            <div key={job.repoName} className="space-y-2 border-l border-cyan-500/10 pl-3">
              <div className="flex justify-between items-end">
                <span className="text-[9px] text-slate-500 font-mono tracking-tighter uppercase">{job.repoName}</span>
                <span className={`text-[10px] font-bold uppercase ${job.status === 'error' ? 'text-red-400' : 'text-cyan-400'}`}>
                  {job.status.replace("_", " ")}
                </span>
              </div>
              <div className="h-[2px] w-full bg-slate-800/50 overflow-hidden">
                <div 
                  className={`h-full ${job.status === 'error' ? 'bg-red-500' : 'bg-cyan-500'} animate-pulse`} 
                  style={{ width: job.status === "completed" ? "100%" : "60%" }} 
                />
              </div>
              <p className="text-[10px] text-slate-300 font-light leading-relaxed">{job.message}</p>
              {job.status === "error" && (
                <div className="mt-2 text-[8px] bg-red-500/10 border border-red-500/20 p-2 rounded-sm text-red-400/80 font-mono leading-tight">
                  CORE_ERR: Ensure &apos;deepseek-r1:7b&apos; is pulled in Ollama.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isExpanded && (
        <div className="max-h-60 overflow-y-auto bg-black/40 p-4 font-mono text-[9px] leading-relaxed border-t border-cyan-500/10">
          <div className="flex items-center gap-2 mb-3 text-cyan-400/40">
            <Terminal className="w-3 h-3" />
            <span className="tracking-[0.3em] font-bold">SYSTEM_LOG_DAEMON</span>
          </div>
          {data.logs.length === 0 ? (
            <p className="text-gray-700 italic">No neural activity detected.</p>
          ) : (
            data.logs.map((log, i) => (
              <div key={i} className="text-gray-500 border-l border-cyan-500/20 pl-3 py-1 mb-1 hover:text-cyan-200 transition-colors">
                <span className="text-cyan-500/30 mr-2">[{i.toString().padStart(2, '0')}]</span>
                {log}
              </div>
            ))
          )}
        </div>
      )}
      
      <style jsx>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
