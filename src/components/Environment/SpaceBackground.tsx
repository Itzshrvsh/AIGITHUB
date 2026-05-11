"use client";

import React from "react";

export default function SpaceBackground() {
  return (
    <div className="fixed inset-0 z-0 bg-[#020617] overflow-hidden pointer-events-none">
      {/* Deep Space Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black opacity-80" />
      
      {/* Subtle Grid overlay for structural feel */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)", 
          backgroundSize: "60px 60px" 
        }} 
      />

      {/* Large Atmospheric Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-cyan-900/20 rounded-full blur-[120px] mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[100px] mix-blend-screen" />
    </div>
  );
}
