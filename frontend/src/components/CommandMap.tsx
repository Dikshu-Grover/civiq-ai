"use client";

import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3-geo";

interface CommandMapProps {
  statesData: any[];
  selectedStateId: string | null;
  onSelectState: (stateId: string) => void;
  simulationUpdates: Record<string, any>;
}

export default function CommandMap({
  statesData,
  selectedStateId,
  onSelectState,
  simulationUpdates,
}: CommandMapProps) {
  const [geoJson, setGeoJson] = useState<any>(null);
  const [hoveredStateName, setHoveredStateName] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });

  // Map state ID/name in GeoJSON to ID in our backend
  const geoNameToId: Record<string, string> = {
    "Andhra Pradesh": "IN-AP",
    "Arunachal Pradesh": "IN-AR",
    "Assam": "IN-AS",
    "Bihar": "IN-BR",
    "Chandigarh": "IN-CH",
    "Chhattisgarh": "IN-CT",
    "Dadra and Nagar Haveli": "IN-DN",
    "Daman and Diu": "IN-DD",
    "Delhi": "IN-DL",
    "Goa": "IN-GA",
    "Gujarat": "IN-GJ",
    "Haryana": "IN-HR",
    "Himachal Pradesh": "IN-HP",
    "Jammu and Kashmir": "IN-JK",
    "Jharkhand": "IN-JH",
    "Karnataka": "IN-KA",
    "Kerala": "IN-KL",
    "Ladakh": "IN-LA",
    "Lakshadweep": "IN-LD",
    "Madhya Pradesh": "IN-MP",
    "Maharashtra": "IN-MH",
    "Manipur": "IN-MN",
    "Meghalaya": "IN-ML",
    "Mizoram": "IN-MZ",
    "Nagaland": "IN-NL",
    "Odisha": "IN-OR",
    "Puducherry": "IN-PY",
    "Punjab": "IN-PB",
    "Rajasthan": "IN-RJ",
    "Sikkim": "IN-SK",
    "Tamil Nadu": "IN-TN",
    "Telangana": "IN-TG",
    "Tripura": "IN-TR",
    "Uttar Pradesh": "IN-UP",
    "Uttarakhand": "IN-UT",
    "West Bengal": "IN-WB",
    "Andaman and Nicobar Islands": "IN-AN",
  };

  useEffect(() => {
    // Fetch GeoJSON file from public folder
    fetch("/india_states.geojson")
      .then((res) => res.json())
      .then((data) => setGeoJson(data))
      .catch((err) => console.error("Error loading GeoJSON map:", err));
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: width || 600,
          height: Math.max(height, 500) || 600,
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  if (!geoJson) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3 border border-slate-800/80 rounded-xl bg-slate-950/40">
        <div className="w-8 h-8 border-4 border-t-cyan-500 border-r-transparent border-slate-800 rounded-full animate-spin"></div>
        <p className="text-sm font-mono tracking-widest text-cyan-500/80 uppercase">Loading Tactical Grid...</p>
      </div>
    );
  }

  // Projection setup using D3
  const projection = d3.geoMercator()
    .center([82.7, 22.0]) // Centered around India
    .scale(dimensions.width * 1.5) // Adjust scale based on width
    .translate([dimensions.width / 2, dimensions.height / 2]);

  const pathGenerator = d3.geoPath().projection(projection);

  // Helper to determine fill color based on state threat parameters
  const getStateStyle = (stateName: string) => {
    const stateId = geoNameToId[stateName];
    if (!stateId) {
      return {
        fill: "rgba(15, 23, 42, 0.6)",
        stroke: "rgba(51, 65, 85, 0.4)",
        strokeWidth: 1,
      };
    }

    const baseState = statesData.find((s) => s.id === stateId);
    const simulated = simulationUpdates[stateId] || baseState;
    const isSelected = selectedStateId === stateId;

    if (!simulated) {
      return {
        fill: "rgba(51, 65, 85, 0.2)",
        stroke: isSelected ? "#06b6d4" : "rgba(100, 116, 139, 0.5)",
        strokeWidth: isSelected ? 2.5 : 1,
      };
    }

    const level = simulated.risk_level;
    let fill = "rgba(71, 85, 105, 0.15)";
    let stroke = "rgba(100, 116, 139, 0.4)";
    let strokeWidth = isSelected ? 2.5 : 1;

    if (level === "Critical") {
      fill = isSelected ? "rgba(239, 68, 68, 0.35)" : "rgba(239, 68, 68, 0.2)";
      stroke = "#ef4444";
    } else if (level === "High") {
      fill = isSelected ? "rgba(249, 115, 22, 0.3)" : "rgba(249, 115, 22, 0.15)";
      stroke = "#f97316";
    } else if (level === "Moderate") {
      fill = isSelected ? "rgba(234, 179, 8, 0.25)" : "rgba(234, 179, 8, 0.12)";
      stroke = "#eab308";
    } else if (level === "Low") {
      fill = isSelected ? "rgba(34, 197, 94, 0.2)" : "rgba(34, 197, 94, 0.08)";
      stroke = "#22c55e";
    }

    if (isSelected) {
      strokeWidth = 2.5;
    }

    return { fill, stroke, strokeWidth };
  };

  const getActiveDisaster = (stateName: string) => {
    const stateId = geoNameToId[stateName];
    if (!stateId) return null;
    const baseState = statesData.find((s) => s.id === stateId);
    const simulated = simulationUpdates[stateId] || baseState;
    return simulated ? simulated.active_disaster : null;
  };

  const handleMouseMove = (e: React.MouseEvent, stateName: string) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left + 15,
        y: e.clientY - rect.top - 15,
      });
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative border border-slate-800/80 rounded-xl bg-[#090b11]/85 shadow-2xl shadow-cyan-950/10 p-4 overflow-hidden select-none">
      {/* Radar scanning backdrop grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#0891b2_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div className="absolute inset-0 scanline pointer-events-none opacity-20"></div>

      {/* Map Header */}
      <div className="absolute top-4 left-4 z-10 font-mono text-[10px] text-slate-500 flex flex-col gap-1 tracking-wider uppercase">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>Tactical Map Grid V1.0</span>
        </div>
        <div>Projection: Mercator Grid</div>
        <div>Sensor Feeds: ACTIVE</div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1.5 font-mono text-[10px] bg-slate-950/80 p-2.5 rounded-lg border border-slate-850 glass-panel">
        <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Threat Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
          <span className="text-slate-300">Low Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_6px_#eab308]"></span>
          <span className="text-slate-300">Moderate Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_6px_#f97316]"></span>
          <span className="text-slate-300">High Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444] animate-pulse"></span>
          <span className="text-slate-300">Critical Threat</span>
        </div>
      </div>

      <svg width={dimensions.width} height={dimensions.height} className="w-full h-full">
        <g>
          {geoJson.features.map((feature: any, idx: number) => {
            const stateName = feature.properties.st_nm;
            const stateId = geoNameToId[stateName];
            const isClickable = !!stateId;
            const style = getStateStyle(stateName);

            return (
              <path
                key={idx}
                d={pathGenerator(feature) || ""}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                className={`transition-all duration-300 ${
                  isClickable
                    ? "cursor-pointer hover:fill-opacity-80 hover:stroke-cyan-300"
                    : "opacity-40"
                }`}
                onClick={() => {
                  if (isClickable && stateId) {
                    onSelectState(stateId);
                  }
                }}
                onMouseEnter={() => {
                  if (isClickable) setHoveredStateName(stateName);
                }}
                onMouseLeave={() => {
                  setHoveredStateName(null);
                }}
                onMouseMove={(e) => {
                  if (isClickable) handleMouseMove(e, stateName);
                }}
              />
            );
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredStateName && tooltipPos && (
        <div
          className="absolute z-50 pointer-events-none p-3 bg-slate-950/95 border border-cyan-800 rounded-lg text-slate-100 shadow-xl font-mono text-[11px] min-w-[150px] glass-panel"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="font-bold text-cyan-400 border-b border-slate-800 pb-1 mb-1.5 flex items-center justify-between">
            <span>{hoveredStateName}</span>
            <span className="text-[9px] text-slate-500 uppercase">Interactive</span>
          </div>
          {(() => {
            const stateId = geoNameToId[hoveredStateName];
            const baseState = statesData.find((s) => s.id === stateId);
            const simulated = simulationUpdates[stateId] || baseState;

            if (simulated) {
              return (
                <div className="space-y-1">
                  <div>Risk score: <span className="text-white font-bold">{simulated.risk_score}/100</span></div>
                  <div>Risk Level: <span className={`font-bold ${
                    simulated.risk_level === "Critical" ? "text-red-400" :
                    simulated.risk_level === "High" ? "text-orange-400" :
                    simulated.risk_level === "Moderate" ? "text-yellow-400" :
                    "text-emerald-400"
                  }`}>{simulated.risk_level}</span></div>
                  <div className="text-[10px] text-slate-400 mt-1 border-t border-slate-850 pt-1">
                    Threat: <span className="text-slate-200">{simulated.active_disaster}</span>
                  </div>
                </div>
              );
            }
            return <div className="text-slate-500 text-[10px]">No active tactical data.</div>;
          })()}
        </div>
      )}
    </div>
  );
}
