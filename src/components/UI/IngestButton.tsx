"use client";

import React, { useState } from "react";
import { Github, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function IngestButton() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const router = useRouter();

  const handleIngest = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.success) {
        setUrl("");
        setShowInput(false);
        router.refresh();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to ingest repository");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {showInput ? (
        <form onSubmit={handleIngest} className="flex gap-2">
          <input
            autoFocus
            type="text"
            placeholder="ENTER REPOSITORY UPLINK URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-black/40 border border-cyan-500/30 text-cyan-100 text-xs px-4 py-2 rounded-sm focus:outline-none focus:border-cyan-400 w-64 font-mono tracking-wider"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 px-4 py-2 rounded-sm hover:bg-cyan-500/40 transition-all font-bold text-[10px] tracking-[0.2em]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "INITIATE"}
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="group relative bg-cyan-950/20 border border-cyan-500/30 text-cyan-400 font-black text-[10px] tracking-[0.3em] px-6 py-3 rounded-sm hover:border-cyan-400 transition-all flex items-center gap-3"
        >
          <div className="absolute inset-0 bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
          ESTABLISH UPLINK
        </button>
      )}
    </div>
  );
}
