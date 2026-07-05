"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  X, 
  AlertTriangle, 
  Activity, 
  ShieldAlert, 
  CloudRain, 
  Truck, 
  Home, 
  FileText, 
  CheckCircle2,
  Volume2
} from "lucide-react";

interface LiveDemoProps {
  isOpen: boolean;
  onClose: () => void;
  stateData: any; // Assam state data reference
}

export default function LiveDemo({ isOpen, onClose, stateData }: LiveDemoProps) {
  const [phase, setPhase] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [rainfall, setRainfall] = useState<number>(45);
  const [riskScore, setRiskScore] = useState<number>(30);
  const [deployments, setDeployments] = useState({ rescue: 0, medical: 0, shelters: 0 });

  useEffect(() => {
    if (!isOpen) {
      setPhase(0);
      setTimer(0);
      setLogMessages([]);
      setRainfall(45);
      setRiskScore(30);
      setDeployments({ rescue: 0, medical: 0, shelters: 0 });
      return;
    }

    // Step logger utility
    const log = (msg: string) => {
      setLogMessages((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    log("SYSTEM START: Initializing disaster command live simulation.");
    log("SENSOR INGESTION: Region ASSAM (IN-AS) stream initialized. Status: STABLE.");

    const interval = setInterval(() => {
      setTimer((t) => {
        const nextTime = t + 1;
        
        // Phase logic based on time
        if (nextTime === 5) {
          setPhase(1); // Rising Rainfall
          log("MONITOR WARNING: Heavy monsoon depression forming over Northeast India.");
        } else if (nextTime === 15) {
          setPhase(2); // Inundation alert
          log("CRITICAL INCIDENT: River Brahmaputra breaches warning level at Dibrugarh.");
          log("AI DIAGNOSTIC: Triggering pre-emptive flash-flood prediction models.");
        } else if (nextTime === 30) {
          setPhase(3); // Critical evacuations
          log("ALARM SHIELD: Red alert status active. Direct threat to rural sub-divisions.");
          log("TACTICAL RESPONSE: Deploying Emergency Rescue and NDRF teams.");
        } else if (nextTime === 45) {
          setPhase(4); // Mitigation & Stabilization
          log("STABILIZING: Relief shelters operational at 94% capacity. Water release controlled.");
          log("AI SITUATION REPORT: Generating emergency summary...");
        } else if (nextTime >= 60) {
          clearInterval(interval);
        }
        
        // Simulating parameter climbs
        if (nextTime < 15) {
          // Phase 0/1: normal to rain start
          setRainfall((r) => Math.min(120, r + 5));
          setRiskScore((s) => Math.min(48, s + 1));
        } else if (nextTime < 30) {
          // Phase 2: severe rain
          setRainfall((r) => Math.min(260, r + 9));
          setRiskScore((s) => Math.min(75, s + 2));
        } else if (nextTime < 45) {
          // Phase 3: critical rain peak
          setRainfall((r) => Math.min(390, r + 10));
          setRiskScore((s) => Math.min(96, s + 1.5));
          setDeployments((d) => ({
            rescue: Math.min(40, d.rescue + 3),
            medical: Math.min(25, d.medical + 2),
            shelters: Math.min(380, d.shelters + 25),
          }));
        } else {
          // Phase 4: stabilized
          setRainfall((r) => Math.max(340, r - 3));
          setRiskScore((s) => Math.max(88, s - 0.5));
          setDeployments((d) => ({
            rescue: Math.min(50, d.rescue + 1),
            medical: Math.min(35, d.medical + 1),
            shelters: Math.min(420, d.shelters + 5),
          }));
        }

        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  // Determine current active phase metrics
  const getPhaseDetails = () => {
    switch (phase) {
      case 0:
        return { title: "NORMAL MONITORING", bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" };
      case 1:
        return { title: "DELUGE DETECTION", bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" };
      case 2:
        return { title: "ALERT TRIGGERED", bg: "bg-orange-500/10", border: "border-orange-500/40", text: "text-orange-400" };
      case 3:
        return { title: "CRITICAL CRISIS ACTION", bg: "bg-red-500/15", border: "border-red-500/50", text: "text-red-500 animate-pulse" };
      case 4:
        return { title: "STABILIZATION REPORT", bg: "bg-cyan-500/10", border: "border-cyan-500/40", text: "text-cyan-400" };
      default:
        return { title: "SIMULATION COMPLETED", bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-400" };
    }
  };

  const details = getPhaseDetails();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
        {/* Radar grids backdrop */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="absolute inset-0 scanline pointer-events-none opacity-20"></div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-6xl h-[85vh] bg-[#07090e] border border-red-500/30 rounded-2xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.15)] glass-panel"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 p-4 bg-[#0a0d16]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/30 animate-pulse">
                <ShieldAlert className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="font-mono text-sm uppercase tracking-wider text-slate-100 flex items-center gap-2">
                  <span>Tactical Simulation: Flood emergency scenario</span>
                  <span className="text-xs text-red-500/70 font-semibold px-2 py-0.5 border border-red-500/30 rounded bg-red-950/20">LIVE DEMO</span>
                </h2>
                <p className="text-[10px] font-mono text-slate-400">Assam monsoon breach simulation timeline</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-200 transition-colors border border-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden p-6 gap-6">
            
            {/* Left: Simulation Metrics */}
            <div className="flex flex-col gap-4">
              <div className="glass-panel border-slate-800 p-4 rounded-xl flex flex-col gap-4">
                <div className="font-mono text-xs text-slate-400 uppercase tracking-widest border-b border-slate-850 pb-2 flex justify-between items-center">
                  <span>Tactical telemetry</span>
                  <span className="text-cyan-400 font-bold">{timer}s / 60s</span>
                </div>

                {/* State/Phase Status */}
                <div className={`p-3 rounded-lg border flex items-center justify-between transition-all duration-300 ${details.bg} ${details.border}`}>
                  <div className="flex items-center gap-2">
                    <Activity className={`w-4 h-4 ${details.text}`} />
                    <span className="font-mono text-xs font-bold text-slate-200 tracking-wider">COMMAND PHASE:</span>
                  </div>
                  <span className={`font-mono text-xs font-extrabold tracking-widest ${details.text}`}>
                    {details.title}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-red-500 h-full transition-all duration-1000 ease-linear shadow-[0_0_8px_#ef4444]" 
                    style={{ width: `${(timer / 60) * 100}%` }}
                  ></div>
                </div>

                {/* Gauges */}
                <div className="space-y-4 pt-2">
                  {/* Rainfall Gauge */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-[10px] text-slate-400 uppercase">
                      <span className="flex items-center gap-1"><CloudRain className="w-3.5 h-3.5 text-blue-400" /> Rainfall Intensity</span>
                      <span className="font-bold text-blue-300">{rainfall} mm</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full transition-all duration-300 ease-out" 
                        style={{ width: `${(rainfall / 400) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Threat Score */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-[10px] text-slate-400 uppercase">
                      <span className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Calculated Threat index</span>
                      <span className="font-bold text-red-400">{riskScore.toFixed(0)}/100</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ease-out ${
                          riskScore > 85 ? "bg-red-500 shadow-[0_0_8px_#ef4444]" :
                          riskScore > 60 ? "bg-orange-500" : "bg-yellow-500"
                        }`} 
                        style={{ width: `${riskScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource Deployment Meter */}
              <div className="glass-panel border-slate-800 p-4 rounded-xl flex-1 flex flex-col gap-3 overflow-hidden">
                <div className="font-mono text-xs text-slate-400 uppercase tracking-widest border-b border-slate-850 pb-2">
                  Emergency deployments
                </div>

                <div className="flex-1 flex flex-col justify-center gap-4">
                  {/* Rescue teams */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-950/40 rounded border border-cyan-800/30">
                      <Truck className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between font-mono text-[10px] text-slate-300">
                        <span>Rescue & Logistics (NDRF)</span>
                        <span className="font-bold text-cyan-400">{deployments.rescue} Units</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-cyan-500 h-full transition-all duration-500 ease-out" 
                          style={{ width: `${(deployments.rescue / 50) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Medical Teams */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-950/40 rounded border border-emerald-800/30">
                      <Activity className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between font-mono text-[10px] text-slate-300">
                        <span>Emergency Medical Dispatch</span>
                        <span className="font-bold text-emerald-400">{deployments.medical} Units</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-500 ease-out" 
                          style={{ width: `${(deployments.medical / 40) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Shelters Activated */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-950/40 rounded border border-purple-800/30">
                      <Home className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between font-mono text-[10px] text-slate-300">
                        <span>Relief Camps Operational</span>
                        <span className="font-bold text-purple-400">{deployments.shelters} Camps</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-purple-500 h-full transition-all duration-500 ease-out" 
                          style={{ width: `${(deployments.shelters / 420) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle: Live Inundation Map Visualizer */}
            <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
              <div className="flex-1 glass-panel border-slate-800 rounded-xl relative overflow-hidden flex flex-col">
                <div className="p-3 border-b border-slate-850 flex items-center justify-between bg-slate-950/40 font-mono text-[10px] uppercase text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                    <span>Live satellite imagery feed -- Assam delta</span>
                  </div>
                  <span>Sector coordinates: 26.20° N, 92.93° E</span>
                </div>

                <div className="flex-1 relative flex items-center justify-center p-6 bg-slate-950/60 overflow-hidden">
                  {/* Dynamic Visual Mock for Map and Inundation */}
                  <div className="w-full max-w-[450px] aspect-[4/3] border border-slate-800/80 rounded-lg p-2 bg-[#090d16] relative flex flex-col justify-between overflow-hidden shadow-inner">
                    {/* Simulated river pathways */}
                    <div className="absolute inset-0 bg-[#060910] pointer-events-none opacity-20 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px]"></div>

                    {/* Rivers drawing in neon blue */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Main river channel */}
                      <path 
                        d="M0,45 Q20,30 40,55 T80,40 T100,50" 
                        fill="none" 
                        stroke="#0ea5e9" 
                        strokeWidth="3.5" 
                        className="transition-all duration-500"
                        style={{
                          strokeWidth: phase >= 3 ? "7" : (phase >= 1 ? "5" : "3.5"),
                          filter: phase >= 2 ? "drop-shadow(0 0 8px #0ea5e9)" : "none"
                        }}
                      />
                      {/* Flooding inundation layers */}
                      {phase >= 2 && (
                        <path 
                          d="M0,45 Q20,30 40,55 T80,40 T100,50 L100,100 L0,100 Z" 
                          fill="rgba(14, 165, 233, 0.22)" 
                          className="transition-all duration-1000 ease-out"
                        />
                      )}
                      {phase >= 3 && (
                        <path 
                          d="M0,45 Q20,30 40,55 T80,40 T100,50 L100,0 L0,0 Z" 
                          fill="rgba(239, 68, 68, 0.15)" 
                          className="transition-all duration-1000 ease-out animate-pulse"
                        />
                      )}
                    </svg>

                    {/* Danger zones markers */}
                    {phase >= 2 && (
                      <div className="absolute top-[40%] left-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <span className="w-3 h-3 rounded-full bg-orange-500 animate-ping absolute"></span>
                        <span className="w-2 h-2 rounded-full bg-orange-500 relative"></span>
                        <span className="font-mono text-[8px] text-orange-400 bg-slate-950/80 px-1 py-0.5 border border-orange-500/30 rounded mt-1">DIBRUGARH</span>
                      </div>
                    )}
                    {phase >= 3 && (
                      <>
                        <div className="absolute top-[55%] left-[55%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                          <span className="w-4 h-4 rounded-full bg-red-500 animate-ping absolute"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 relative"></span>
                          <span className="font-mono text-[8px] text-red-400 bg-slate-950/80 px-1 py-0.5 border border-red-500/30 rounded mt-1">GUWAHATI</span>
                        </div>
                        <div className="absolute top-[32%] left-[75%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                          <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping absolute"></span>
                          <span className="w-2 h-2 rounded-full bg-red-500 relative"></span>
                          <span className="font-mono text-[8px] text-red-400 bg-slate-950/80 px-1 py-0.5 border border-red-500/30 rounded mt-1">TEZPUR</span>
                        </div>
                      </>
                    )}

                    <div className="font-mono text-[9px] text-slate-500 flex justify-between w-full">
                      <span>SCALE: 1:500,000</span>
                      <span>MONITOR GRID: ACTIVE</span>
                    </div>
                  </div>
                </div>

                {/* Alerts Banner */}
                {phase >= 2 && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-3 bg-red-950/30 border-t border-red-500/20 flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-red-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 animate-bounce" />
                      <span>{phase === 2 ? "WARNING: HIGH RIVER RUNOFF RATES DETECTED" : "CRITICAL ALERT: SEVERE INUNDATION PROGRESSING"}</span>
                    </span>
                    <span className="text-[10px] text-red-500/80 uppercase tracking-widest font-bold">Priority RED</span>
                  </motion.div>
                )}
              </div>

              {/* Console log of events */}
              <div className="h-[200px] glass-panel border-slate-800 p-4 rounded-xl flex flex-col bg-slate-950/95 font-mono text-[10px] overflow-hidden">
                <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-900 pb-1 flex justify-between">
                  <span>Emergency Operation Center Log</span>
                  <span className="flex items-center gap-1 text-[8px]"><Volume2 className="w-3 h-3 text-cyan-400" /> Audio telemetry</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800 pr-1">
                  {logMessages.map((msg, idx) => (
                    <div key={idx} className={`${msg.includes("CRITICAL") || msg.includes("ALARM") ? "text-red-400" : msg.includes("WARNING") ? "text-amber-400" : "text-slate-400"}`}>
                      {msg}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* AI Situation Report Section at the End */}
          <AnimatePresence>
            {phase >= 4 && (
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="absolute inset-x-0 bottom-0 bg-[#090c12]/98 border-t border-cyan-500/30 p-6 flex flex-col h-[350px] z-20 glass-panel"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-mono text-xs uppercase tracking-wider text-slate-100 font-bold">
                      Gemini Tactical Intelligence Situation Report
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">MODEL: GEMINI-1.5-FLASH</span>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
                  <div className="md:col-span-2 font-mono text-slate-300 text-xs overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                    <div className="font-bold text-slate-100 flex items-center gap-2 border-b border-slate-900 pb-1 text-[11px] uppercase tracking-wide">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Executive Inundation Briefing</span>
                    </div>
                    <p className="leading-relaxed">
                      Assam delta is experiencing a severe flood episode due to precipitation breaching normal parameters. {rainfall}mm rainfall sparked high river surges across Brahmaputra waterbeds. Total estimated affected population stands at approximately 528,000 citizens. Pre-emptive NDRF evacuation of low-lying floodplains has prevented catastrophic casualty.
                    </p>
                    <div className="space-y-1">
                      <div className="font-bold text-slate-200">Mitigation Strategy:</div>
                      <div className="pl-3 border-l-2 border-cyan-800 space-y-1 text-slate-400">
                        <div>1. Coordinate water release levels at downstream reservoirs to limit riverbed congestion.</div>
                        <div>2. Establish food supply lines and medical kit distribution across the {deployments.shelters} active relief shelters.</div>
                        <div>3. Deploy additional air support to isolate zones reporting road closures.</div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-800 p-4 rounded-lg bg-slate-950/40 font-mono text-[10px] space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-2 pb-1 border-b border-slate-900">Summary assessment</div>
                      <div className="flex justify-between py-1 border-b border-slate-900">
                        <span>Incident:</span>
                        <span className="text-red-400 font-bold">Floods (Assam)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-900">
                        <span>Overall Risk:</span>
                        <span className="text-red-500 font-extrabold animate-pulse">CRITICAL</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-900">
                        <span>Confidence Score:</span>
                        <span className="text-emerald-400 font-bold">96.5%</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Priority Level:</span>
                        <span className="text-red-500 font-bold">IMMEDIATE</span>
                      </div>
                    </div>

                    <button 
                      onClick={onClose}
                      className="w-full py-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800/80 rounded font-bold uppercase tracking-wider text-[10px] transition-all"
                    >
                      Exit Simulation
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
