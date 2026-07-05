"use client";

import React, { useEffect, useState, useRef } from "react";
import maplibregl from "maplibre-gl";
import * as d3 from "d3-geo";
import "maplibre-gl/dist/maplibre-gl.css";

interface InteractiveMapProps {
  statesData: any[];
  selectedStateId: string | null;
  onSelectState: (stateId: string) => void;
  simulationUpdates: Record<string, any>;
}

export default function InteractiveMap({
  statesData,
  selectedStateId,
  onSelectState,
  simulationUpdates,
}: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [hoveredStateName, setHoveredStateName] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

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

  // Helper to determine style properties based on threat level
  const getStateStyle = (stateName: string, isSelected: boolean, isHovered: boolean) => {
    const stateId = geoNameToId[stateName];
    if (!stateId) {
      return {
        fill: "rgba(15, 23, 42, 0.4)",
        stroke: "rgba(51, 65, 85, 0.4)",
        strokeWidth: 1.0,
      };
    }

    const baseState = statesData.find((s) => s.id === stateId);
    const simulated = simulationUpdates[stateId] || baseState;

    if (!simulated) {
      return {
        fill: "rgba(51, 65, 85, 0.15)",
        stroke: isSelected ? "#06b6d4" : "rgba(100, 116, 139, 0.4)",
        strokeWidth: isSelected ? 2.5 : (isHovered ? 2.0 : 1.0),
      };
    }

    const level = simulated.risk_level;
    let fill = "rgba(71, 85, 105, 0.15)";
    let stroke = "rgba(100, 116, 139, 0.4)";
    let strokeWidth = isSelected ? 2.5 : (isHovered ? 2.0 : 1.0);

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

    return { fill, stroke, strokeWidth };
  };

  // Compile GeoJSON features with updated styling attributes
  const getStyledGeoJson = (baseGeoJson: any) => {
    if (!baseGeoJson) return null;
    return {
      ...baseGeoJson,
      features: baseGeoJson.features.map((feature: any) => {
        const stateName = feature.properties.st_nm;
        const stateId = geoNameToId[stateName];
        const isSelected = selectedStateId === stateId;
        const isHovered = hoveredStateName === stateName;
        const style = getStateStyle(stateName, isSelected, isHovered);
        return {
          ...feature,
          properties: {
            ...feature.properties,
            risk_color: style.fill,
            risk_stroke: style.stroke,
            stroke_width: style.strokeWidth,
          },
        };
      }),
    };
  };

  // Fetch GeoJSON on mount
  useEffect(() => {
    fetch("/india_states.geojson")
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data))
      .catch((err) => console.error("Error loading GeoJSON for MapLibre:", err));
  }, []);

  // Initialize MapLibre Map
  useEffect(() => {
    if (!containerRef.current || !geoJsonData) return;

    // Use CARTO Dark Matter keyless tiles
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          "carto-dark-tiles": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
              "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
              "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
              "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          },
        },
        layers: [
          {
            id: "carto-dark-layer",
            type: "raster",
            source: "carto-dark-tiles",
            minzoom: 0,
            maxzoom: 20,
          },
        ],
      },
      center: [82.7, 22.0], // Center of India
      zoom: 4.2, // Adjust zoom level to show the entire country
      minZoom: 3,
      maxZoom: 10,
      dragRotate: false,
      touchPitch: false,
      pitchWithRotate: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    mapRef.current = map;

    map.on("load", () => {
      map.addSource("india-states", {
        type: "geojson",
        data: getStyledGeoJson(geoJsonData),
      });

      // Fill Layer for States
      map.addLayer({
        id: "state-fills",
        type: "fill",
        source: "india-states",
        paint: {
          "fill-color": ["coalesce", ["get", "risk_color"], "rgba(71, 85, 105, 0.15)"],
          "fill-opacity": 0.9,
        },
      });

      // Border Layer for States
      map.addLayer({
        id: "state-borders",
        type: "line",
        source: "india-states",
        paint: {
          "line-color": ["coalesce", ["get", "risk_stroke"], "rgba(100, 116, 139, 0.4)"],
          "line-width": ["coalesce", ["get", "stroke_width"], 1.0],
        },
      });

      // Hover / Tooltip Interaction
      map.on("mousemove", "state-fills", (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const stateName = feature.properties?.st_nm;
          const stateId = geoNameToId[stateName];

          if (stateId) {
            setHoveredStateName(stateName);
            
            // Get mouse position relative to container for overlay placement
            if (containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect();
              setTooltipPos({
                x: e.originalEvent.clientX - rect.left + 15,
                y: e.originalEvent.clientY - rect.top - 15,
              });
            }
          } else {
            setHoveredStateName(null);
          }
        }
      });

      map.on("mouseleave", "state-fills", () => {
        setHoveredStateName(null);
      });

      // Click Interaction
      map.on("click", "state-fills", (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const stateName = feature.properties?.st_nm;
          const stateId = geoNameToId[stateName];
          if (stateId) {
            onSelectState(stateId);
          }
        }
      });

      // Cursor styles
      map.on("mouseenter", "state-fills", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "state-fills", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [geoJsonData]);

  // Reactive state highlighting
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geoJsonData) return;

    const source = map.getSource("india-states") as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(getStyledGeoJson(geoJsonData));
    }
  }, [statesData, simulationUpdates, selectedStateId, hoveredStateName, geoJsonData]);

  // Reactive disaster markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geoJsonData) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Create markers for active disasters
    geoJsonData.features.forEach((feature: any) => {
      const stateName = feature.properties.st_nm;
      const stateId = geoNameToId[stateName];
      if (!stateId) return;

      const baseState = statesData.find((s) => s.id === stateId);
      const simulated = simulationUpdates[stateId] || baseState;
      if (!simulated || !simulated.active_disaster || simulated.active_disaster === "None") {
        return;
      }

      // Calculate centroid
      const centroid = d3.geoCentroid(feature);
      if (!centroid || isNaN(centroid[0]) || isNaN(centroid[1])) return;

      // Custom marker wrapper element
      const el = document.createElement("div");
      el.className = "relative flex items-center justify-center cursor-pointer";
      
      const level = simulated.risk_level;
      
      // Outer animated ping
      const ping = document.createElement("span");
      ping.className = `animate-ping absolute inline-flex h-6 w-6 rounded-full opacity-75 ${
        level === "Critical" ? "bg-red-500" :
        level === "High" ? "bg-orange-500" :
        level === "Moderate" ? "bg-yellow-500" : "bg-emerald-500"
      }`;
      
      // Core center dot
      const dot = document.createElement("span");
      dot.className = `relative inline-flex rounded-full h-3 w-3 shadow-[0_0_8px_rgba(0,0,0,0.6)] ${
        level === "Critical" ? "bg-red-600" :
        level === "High" ? "bg-orange-600" :
        level === "Moderate" ? "bg-yellow-600" : "bg-emerald-600"
      }`;
      
      // Overlay label showing active disaster
      const label = document.createElement("span");
      label.className = "absolute top-5 font-mono text-[8px] tracking-wider text-slate-300 bg-slate-950/95 border border-slate-800/80 rounded px-1.5 py-0.5 whitespace-nowrap shadow-md pointer-events-none uppercase font-semibold";
      label.innerText = simulated.active_disaster;

      el.appendChild(ping);
      el.appendChild(dot);
      el.appendChild(label);

      // Bind click handler (with propagation block)
      el.addEventListener("click", (evt) => {
        evt.stopPropagation();
        onSelectState(stateId);
      });

      // Add to map
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([centroid[0], centroid[1]])
        .addTo(map);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
  }, [statesData, simulationUpdates, geoJsonData]);

  return (
    <div className="w-full h-full relative border border-slate-800/80 rounded-xl bg-[#090b11]/85 shadow-2xl shadow-cyan-950/10 overflow-hidden select-none">
      {/* Mapbox/MapLibre container */}
      <div ref={containerRef} className="w-full h-full" style={{ minHeight: "500px" }} />

      {/* Radar scanning backdrop grid effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#0891b2_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div className="absolute inset-0 scanline pointer-events-none opacity-20"></div>

      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 z-10 font-mono text-[10px] text-slate-500 flex flex-col gap-1 tracking-wider uppercase bg-slate-950/80 p-2.5 rounded-lg border border-slate-850/60 glass-panel">
        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>Tactical Map Grid V1.0</span>
        </div>
        <div>Projection: Web Mercator</div>
        <div>Sensor Feeds: ACTIVE</div>
      </div>

      {/* Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1.5 font-mono text-[10px] bg-slate-950/90 p-2.5 rounded-lg border border-slate-850 glass-panel">
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

      {/* Tooltip Overlay */}
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
