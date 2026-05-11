"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Sphere, Float } from "@react-three/drei";
import * as THREE from "three";
import { ExternalLink, Zap, ShieldCheck, Database, Activity } from "lucide-react";
import { useRouter } from "next/navigation";

// --- MATH & UTILS ---
function getFibonacciSpherePoints(samples = 1, radius = 100) {
  const points = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < samples; i++) {
    const y = 1 - (i / (samples - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = phi * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    points.push(new THREE.Vector3(x * radius, y * radius, z * radius));
  }
  return points;
}

const getNodeQuality = (repo: any) => {
  const readiness = repo.productionReadinessScore || 0;
  const stars = repo.stars || 0;
  const innovation = repo.innovationScore || 0;

  if (stars === 0 || readiness < 50) return "LOW";
  if (readiness >= 50 && innovation < 80) return "MID";
  return "HIGH";
};

const getQualityColors = (quality: string) => {
  switch (quality) {
    case "LOW": return { base: "#064e3b", emissive: "#047857", intensity: 0.5 };
    case "MID": return { base: "#ca8a04", emissive: "#eab308", intensity: 2 };
    case "HIGH": return { base: "#fef08a", emissive: "#ffffff", intensity: 5 };
    default: return { base: "#334155", emissive: "#475569", intensity: 1 };
  }
};

function IntelligenceCore() {
  const auraRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (auraRef.current) {
      const scale = 1 + Math.sin(t * 2) * 0.02;
      auraRef.current.scale.set(scale, scale, scale);
    }
  });
  return (
    <group>
      <Sphere args={[40, 64, 64]}>
        <meshPhysicalMaterial color="#020617" emissive="#0891b2" emissiveIntensity={0.5} roughness={0.2} metalness={0.9} clearcoat={1} wireframe transparent opacity={0.3} />
      </Sphere>
      <Sphere args={[38, 32, 32]}>
        <meshBasicMaterial color="#00f2ff" transparent opacity={0.1} />
      </Sphere>
      <Sphere ref={auraRef} args={[42, 32, 32]}>
        <meshBasicMaterial color="#0891b2" transparent opacity={0.05} side={THREE.BackSide} depthWrite={false} />
      </Sphere>
    </group>
  );
}

function RepoNode({ repo, position, isSelected, isDimmed, onClick }: any) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const quality = getNodeQuality(repo);
  const colors = getQualityColors(quality);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = position.y + Math.sin(t * 2 + position.x) * 2;
    const targetScale = isSelected ? 1.5 : (hovered ? 1.2 : 1);
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <group 
      ref={meshRef} 
      position={position} 
      onClick={(e) => { e.stopPropagation(); onClick(repo); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <line>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={2} array={new Float32Array([0, 0, 0, -position.x * 0.8, -position.y * 0.8, -position.z * 0.8])} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color={colors.emissive} transparent opacity={isDimmed ? 0.02 : (isSelected || hovered ? 0.4 : 0.1)} />
        </line>
        <mesh>
          <sphereGeometry args={[isSelected ? 6 : 4, 32, 32]} />
          <meshPhysicalMaterial color={colors.base} emissive={colors.emissive} emissiveIntensity={isDimmed ? 0.1 : (hovered || isSelected ? colors.intensity * 2 : colors.intensity)} roughness={0.1} metalness={0.8} transmission={0.5} thickness={2} transparent opacity={isDimmed ? 0.2 : 1} />
        </mesh>
        {hovered && !isSelected && (
          <Html distanceFactor={150} position={[10, 10, 0]} zIndexRange={[100, 0]} center>
            <div className="glass-panel px-3 py-2 border-cyan-500/30 rounded-sm min-w-[160px] pointer-events-none animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-2 mb-1">
                <Database className="w-3 h-3 text-cyan-400" />
                <span className="text-[10px] font-bold tracking-widest text-white uppercase truncate">{repo.fullName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex flex-col">
                  <span className="text-[7px] text-slate-500 uppercase tracking-widest">Readiness</span>
                  <span className="text-[9px] font-mono text-green-400">{(repo.productionReadinessScore || 0)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[7px] text-slate-500 uppercase tracking-widest">Innovation</span>
                  <span className="text-[9px] font-mono text-yellow-400">{(repo.innovationScore || 0)}%</span>
                </div>
              </div>
            </div>
          </Html>
        )}
      </Float>
    </group>
  );
}

function Ecosystem({ repos, selectedNode, onSelectNode }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const nodePositions = useMemo(() => getFibonacciSpherePoints(repos.length, 42), [repos.length]);

  useFrame(() => {
    if (!groupRef.current || !selectedNode) return;
    const idx = repos.findIndex((r: any) => r.id === selectedNode.id);
    if (idx !== -1) {
      const targetPos = nodePositions[idx].clone().applyMatrix4(groupRef.current.matrixWorld);
      const desiredCamPos = targetPos.clone().add(targetPos.clone().normalize().multiplyScalar(40));
      camera.position.lerp(desiredCamPos, 0.05);
      camera.lookAt(targetPos);
    }
  });

  return (
    <group ref={groupRef}>
      <IntelligenceCore />
      {repos.map((repo: any, i: number) => (
        <RepoNode 
          key={repo.id} 
          repo={repo} 
          position={nodePositions[i]} 
          isSelected={selectedNode?.id === repo.id} 
          isDimmed={selectedNode && selectedNode.id !== repo.id} 
          onClick={onSelectNode} 
        />
      ))}
    </group>
  );
}

export default function GalaxyGraph({ repos }: { repos: any[] }) {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setCanvasKey(prev => prev + 1);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full h-full relative cursor-crosshair">
      <Canvas key={`canvas-${canvasKey}`} camera={{ position: [0, 0, 250], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#00f2ff" />
        <directionalLight position={[100, 100, 100]} intensity={1} />
        <Ecosystem repos={repos || []} selectedNode={selectedNode} onSelectNode={setSelectedNode} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} minDistance={80} maxDistance={500} autoRotate={!selectedNode} autoRotateSpeed={0.5} rotateSpeed={-0.6} zoomSpeed={0.8} />
      </Canvas>

      {selectedNode && (
        <div className="absolute top-1/2 left-[60%] -translate-y-1/2 z-50">
          <div className="orbital-details glass-panel p-5 w-[320px] animate-in slide-in-from-right-8 fade-in duration-700 rounded-sm border-cyan-500/40 shadow-[0_0_40px_rgba(34,211,238,0.2)] pointer-events-auto backdrop-blur-2xl bg-slate-950/80">
            <div className="flex items-center justify-between mb-4 border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h3 className="text-xs font-black tracking-widest text-white uppercase shadow-cyan-500/50 drop-shadow-md">{selectedNode.fullName}</h3>
              </div>
              <div className="px-2 py-1 rounded border text-[9px] font-black bg-cyan-500/20 border-cyan-500/30 text-cyan-400 uppercase tracking-widest">
                {getNodeQuality(selectedNode)} TIER
              </div>
            </div>
            <p className="text-[11px] text-slate-300 line-clamp-3 mb-5 leading-relaxed font-light">{selectedNode.summary || "Processing neural architecture..."}</p>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="flex flex-col gap-1.5 text-[9px] text-slate-400 uppercase font-bold tracking-widest">Innovation: {selectedNode.innovationScore}%</div>
              <div className="flex flex-col gap-1.5 text-[9px] text-slate-400 uppercase font-bold tracking-widest">Readiness: {selectedNode.productionReadinessScore}%</div>
            </div>
            <button onClick={() => router.push(`/report/${selectedNode.id}`)} className="w-full py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 hover:border-cyan-400 rounded-sm text-[10px] font-black tracking-[0.2em] uppercase text-cyan-300 transition-all flex items-center justify-center gap-2 group">
              Intelligence Brief <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </button>
          </div>
        </div>
      )}

      {selectedNode && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 px-6 py-3 glass-panel border-cyan-500/30 flex items-center gap-6 animate-in slide-in-from-top-4 duration-500 z-50 rounded-full bg-slate-950/80 backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-[11px] font-black tracking-[0.2em] text-white uppercase">Focus Mode Active</span>
          </div>
          <button onClick={() => setSelectedNode(null)} className="text-[10px] text-cyan-500 hover:text-cyan-300 uppercase font-bold tracking-widest transition-colors cursor-pointer">Disengage Lock</button>
        </div>
      )}
    </div>
  );
}
