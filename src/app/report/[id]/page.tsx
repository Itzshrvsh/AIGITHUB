import React from "react";
import { db } from "@/lib/db";
import { repositories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { fetchReadme } from "@/lib/github/service";
import { generateDetailedReport } from "@/lib/llm/ollama";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, AlertTriangle, Lightbulb, Zap, Rocket } from "lucide-react";
import Link from "next/link";

import RepoChat from "@/components/UI/RepoChat";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const repoId = parseInt(resolvedParams.id);

  const repo = await db.query.repositories.findFirst({
    where: eq(repositories.id, repoId),
  });

  if (!repo) notFound();

  let report;
  
  if (repo.detailedReport) {
    try {
      report = JSON.parse(repo.detailedReport);
    } catch (e) {
      console.error("Failed to parse cached report:", e);
    }
  }

  if (!report) {
    const match = repo.url?.match(/github\.com\/([^/]+)\/([^/]+)/);
    let readme = "";
    if (match) {
      readme = await fetchReadme(match[1], match[2].replace(".git", "")) || "";
    }
    report = await generateDetailedReport(repo.fullName, readme);
    
    // Cache the report in the database
    await db.update(repositories)
      .set({ detailedReport: JSON.stringify(report) })
      .where(eq(repositories.id, repoId));
  }

  const ensureString = (val: any) => {
    if (typeof val === "string") return val;
    if (val && typeof val === "object") {
      return val.description || val.value || JSON.stringify(val);
    }
    return String(val);
  };

  return (
    <main className="h-screen bg-[#020617] text-slate-100 p-8 md:p-16 relative overflow-x-hidden overflow-y-auto custom-scrollbar">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-cyan-500 hover:text-cyan-400 transition-colors text-xs font-bold uppercase tracking-widest group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Return to Observatory
            </Link>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">
              Neural Audit: <span className="text-cyan-500">{repo.fullName}</span>
            </h1>
            <div className="flex gap-4">
              <div className="px-3 py-1 glass-panel border-cyan-500/20 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                Score: {repo.overallScore?.toFixed(1)}%
              </div>
              <div className="px-3 py-1 glass-panel border-white/5 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                ID: {repo.id.toString().padStart(4, '0')}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
             <div className="text-[10px] font-mono text-slate-500 text-right uppercase tracking-[0.2em] leading-relaxed">
               Strategic Software Intelligence Report<br />
               System Status: Operational<br />
               Generated: {new Date().toLocaleDateString()}
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Advantages */}
          <section className="glass-panel p-8 rounded-sm space-y-6 relative group overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Zap className="w-16 h-16 text-cyan-400" />
             </div>
             <div className="flex items-center gap-3 border-b border-cyan-500/10 pb-4">
               <CheckCircle2 className="w-6 h-6 text-cyan-400" />
               <h2 className="text-xl font-bold uppercase tracking-widest text-white">Strategic Advantages</h2>
             </div>
             <ul className="space-y-4">
               {report.advantages.map((adv, i) => (
                 <li key={i} className="flex gap-4 text-sm text-slate-400 leading-relaxed hover:text-cyan-200 transition-colors">
                   <span className="text-cyan-500/40 font-mono text-xs mt-1">[{i+1}]</span>
                   {ensureString(adv)}
                 </li>
               ))}
             </ul>
          </section>

          {/* Disadvantages */}
          <section className="glass-panel p-8 rounded-sm space-y-6 relative group overflow-hidden border-red-500/10">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <AlertTriangle className="w-16 h-16 text-red-400" />
             </div>
             <div className="flex items-center gap-3 border-b border-red-500/10 pb-4">
               <AlertTriangle className="w-6 h-6 text-red-400" />
               <h2 className="text-xl font-bold uppercase tracking-widest text-white">Critical Deficiencies</h2>
             </div>
             <ul className="space-y-4">
               {report.disadvantages.map((dis, i) => (
                 <li key={i} className="flex gap-4 text-sm text-slate-400 leading-relaxed hover:text-red-200 transition-colors">
                   <span className="text-red-500/40 font-mono text-xs mt-1">[{i+1}]</span>
                   {ensureString(dis)}
                 </li>
               ))}
             </ul>
          </section>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Suggestions */}
           <section className="glass-panel p-8 rounded-sm space-y-6 relative group overflow-hidden border-yellow-500/10">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Lightbulb className="w-16 h-16 text-yellow-400" />
             </div>
             <div className="flex items-center gap-3 border-b border-yellow-500/10 pb-4">
               <Rocket className="w-6 h-6 text-yellow-400" />
               <h2 className="text-xl font-bold uppercase tracking-widest text-white">Strategic Roadmap</h2>
             </div>
             <div className="grid gap-4">
               {report.suggestions.map((sug, i) => (
                 <div key={i} className="bg-white/[0.03] border border-white/5 p-4 rounded-sm text-sm text-slate-400 hover:border-yellow-500/20 transition-all">
                   {ensureString(sug)}
                 </div>
               ))}
             </div>
          </section>

          {/* Tips */}
          <section className="glass-panel p-8 rounded-sm space-y-6 relative group overflow-hidden border-blue-500/10">
             <div className="flex items-center gap-3 border-b border-blue-500/10 pb-4">
               <Zap className="w-6 h-6 text-blue-400" />
               <h2 className="text-xl font-bold uppercase tracking-widest text-white">Neural Optimizer Tips</h2>
             </div>
             <div className="space-y-4">
               {report.tips.map((tip, i) => (
                 <div key={i} className="flex items-start gap-4 p-4 bg-blue-500/5 rounded-sm border border-blue-500/10 text-sm text-blue-200/80 italic font-light">
                   &ldquo;{ensureString(tip)}&rdquo;
                 </div>
               ))}
             </div>
          </section>
        </div>

        <RepoChat repoId={repoId} />

        <footer className="mt-16 text-center">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.4em]">
            Argus Observatory // Intelligence Output // Neural Core Qwen2.5
          </p>
        </footer>
      </div>
    </main>
  );
}
