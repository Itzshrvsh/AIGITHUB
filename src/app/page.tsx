import GalaxyGraph from "@/components/Graph/GalaxyGraphWrapper";
import IngestButton from "@/components/UI/IngestButton";
import LLMMonitor from "@/components/UI/LLMMonitor";
import SpaceBackground from "@/components/Environment/SpaceBackground";
import RepoListItem from "@/components/UI/RepoListItem";
import { db } from "@/lib/db";
import { repositories } from "@/lib/db/schema";
import { Search, Database, Cpu, Activity, Shield, Zap, Network } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ObservatoryPage() {
  const allRepos = await db.select().from(repositories);

  return (
    <main className="h-screen w-screen flex flex-col relative bg-[#02040a] text-slate-200 selection:bg-cyan-500/30 overflow-hidden">
      <SpaceBackground />
      <div className="depth-vignette" />

      {/* Top Navigation HUD */}
      <header className="z-50 h-16 flex items-center justify-between px-8 bg-black/40 border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/30 rounded-sm shadow-[0_0_15px_rgba(0,242,255,0.1)]">
            <Activity className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-[0.2em] text-white uppercase neon-text">Argus Observatory</h1>
            <p className="text-[10px] font-mono text-cyan-500/50 tracking-widest uppercase">System Operational // v4.0.2</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-cyan-500/5 border border-cyan-500/10 px-3 py-1.5 rounded-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[8px] text-cyan-500/60 font-bold uppercase tracking-tighter">Neural Core Model</span>
              <span className="text-[10px] text-cyan-100 font-mono font-bold tracking-widest uppercase">Qwen2.5-Coder:3B</span>
            </div>
          </div>
          <div className="h-8 w-px bg-white/5" />
          <IngestButton />
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6 relative z-20">
        
        {/* Tactical Intelligence Sidebar */}
        <aside className="w-96 flex flex-col gap-6">
          <div className="hud-panel flex-1 flex flex-col rounded-sm overflow-hidden border-cyan-500/10">
            <div className="scanline" />
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.02] to-transparent pointer-events-none" />
            
            <div className="p-5 border-b border-white/5 bg-white/5 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-500" />
                  <span className="text-xs font-bold tracking-widest uppercase text-white">Neural Repository Matrix</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-mono text-cyan-400">
                    {allRepos.length.toString().padStart(4, '0')}
                  </span>
                  <span className="text-[7px] text-cyan-500/40 font-bold uppercase tracking-widest">Active_Entities</span>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/40" />
                <input 
                  type="text" 
                  placeholder="INITIATE SEMANTIC SCAN..." 
                  className="w-full bg-black/40 border border-white/10 rounded-sm py-2 pl-10 pr-4 text-[10px] font-mono tracking-widest text-cyan-100 placeholder:text-cyan-900 focus:outline-none focus:border-cyan-500/30 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar relative">
              {allRepos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-20 text-center">
                  <Network className="w-12 h-12 mb-4 animate-pulse" />
                  <p className="text-[10px] font-mono tracking-widest uppercase">Waiting for Uplink...</p>
                </div>
              ) : (
                allRepos.map((repo) => (
                  <RepoListItem key={repo.id} repo={repo} />
                ))
              )}
            </div>
          </div>

          {/* Neural Subsystems HUD */}
          <div className="hud-panel p-5 rounded-sm border-cyan-500/10">
            <h3 className="text-[9px] font-black text-cyan-500/30 tracking-[0.2em] mb-4 uppercase">Subsystem Telemetry</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Ollama_Core", icon: Cpu, status: "Connected", color: "text-cyan-400" },
                { label: "Embedding_Matrix", icon: Zap, status: "Active", color: "text-cyan-400" },
                { label: "AST_Intelligence", icon: Network, status: "Ready", color: "text-amber-400" },
                { label: "Vector_Storage", icon: Shield, status: "Stable", color: "text-cyan-400" }
              ].map((sub, i) => (
                <div key={i} className="flex items-center gap-3 bg-black/40 border border-white/5 p-2.5 rounded-sm group hover:border-cyan-500/20 transition-all">
                  <sub.icon className={`w-4 h-4 ${sub.color}`} />
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-500 font-bold tracking-tighter uppercase">{sub.label}</span>
                    <span className={`text-[9px] font-black ${sub.color} tracking-widest uppercase`}>{sub.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Immersive Observatory Environment */}
        <div className="flex-1 hud-panel rounded-sm overflow-hidden border-white/5 relative z-10">
          <div className="absolute inset-0">
            <GalaxyGraph repos={allRepos} />
          </div>
          
          {/* Spatial Grid Overlays */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="h-full w-full" style={{ backgroundImage: "linear-gradient(to right, rgba(0,242,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,242,255,0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          </div>

          <div className="absolute bottom-6 right-8 text-right pointer-events-none">
            <div className="text-[9px] font-mono text-cyan-500/30 tracking-[0.4em] mb-1 uppercase">Coordinate System_Active</div>
            <div className="text-xs text-cyan-400/40 font-mono tracking-widest uppercase">Ecosystem Map Visualization</div>
          </div>
        </div>
      </div>

      <LLMMonitor />
      
    </main>
  );
}
