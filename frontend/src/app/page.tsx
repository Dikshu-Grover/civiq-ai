"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Activity, 
  Search, 
  AlertTriangle, 
  Map as MapIcon, 
  CloudRain, 
  Thermometer, 
  Droplet, 
  Building2, 
  Home, 
  Compass, 
  Play, 
  Wrench,
  Bot,
  RefreshCw,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Clock
} from "lucide-react";
import CommandMap from "@/components/CommandMap";
import LiveDemo from "@/components/LiveDemo";

import { API_BASE_URL } from "@/config/api";

// Fallback baseline states data to make the app work if the API is offline
const FALLBACK_STATES = [
  { id: "IN-AP", name: "Andhra Pradesh", region: "South-East", population: 49500000, risk_score: 55.0, risk_level: "Moderate", active_disaster: "Cyclone Alert", weather: "Humid & Overcast", temperature: 33, water_shortage_risk: 35, heatwave_risk: 45, hospitals: 280, shelters: 480, supplies: { boats: 200, medical_kits: 7000, rations_tons: 130 }, flood_risk: 45, response_time_minutes: 20.0 },
  { id: "IN-AR", name: "Arunachal Pradesh", region: "Northeast", population: 1400000, risk_score: 42.0, risk_level: "Moderate", active_disaster: "Landslide Watch", weather: "Heavy Rainfall", temperature: 20, water_shortage_risk: 10, heatwave_risk: 5, hospitals: 35, shelters: 60, supplies: { boats: 30, medical_kits: 1200, rations_tons: 25 }, flood_risk: 38, response_time_minutes: 45.0 },
  { id: "IN-AS", name: "Assam", region: "Northeast", population: 31200000, risk_score: 85.0, risk_level: "High", active_disaster: "Floods", weather: "Heavy Monsoon", temperature: 27, water_shortage_risk: 15, heatwave_risk: 10, hospitals: 142, shelters: 420, supplies: { boats: 250, medical_kits: 5000, rations_tons: 80 }, flood_risk: 88, response_time_minutes: 25.0 },
  { id: "IN-BR", name: "Bihar", region: "North", population: 104000000, risk_score: 55.0, risk_level: "Moderate", active_disaster: "River Inundation", weather: "Thunderstorms", temperature: 31, water_shortage_risk: 30, heatwave_risk: 40, hospitals: 210, shelters: 380, supplies: { boats: 180, medical_kits: 9000, rations_tons: 110 }, flood_risk: 60, response_time_minutes: 30.0 },
  { id: "IN-CT", name: "Chhattisgarh", region: "Central", population: 25500000, risk_score: 38.0, risk_level: "Moderate", active_disaster: "None", weather: "Partly Cloudy", temperature: 32, water_shortage_risk: 25, heatwave_risk: 35, hospitals: 130, shelters: 200, supplies: { boats: 40, medical_kits: 4500, rations_tons: 70 }, flood_risk: 18, response_time_minutes: 28.0 },
  { id: "IN-GA", name: "Goa", region: "West", population: 1500000, risk_score: 30.0, risk_level: "Low", active_disaster: "None", weather: "Monsoon Showers", temperature: 28, water_shortage_risk: 10, heatwave_risk: 15, hospitals: 45, shelters: 65, supplies: { boats: 60, medical_kits: 2000, rations_tons: 20 }, flood_risk: 28, response_time_minutes: 12.0 },
  { id: "IN-GJ", name: "Gujarat", region: "West", population: 60400000, risk_score: 68.0, risk_level: "High", active_disaster: "Heatwave", weather: "Extreme Heat", temperature: 43, water_shortage_risk: 65, heatwave_risk: 80, hospitals: 310, shelters: 180, supplies: { boats: 20, medical_kits: 8000, rations_tons: 150 }, flood_risk: 10, response_time_minutes: 20.0 },
  { id: "IN-HR", name: "Haryana", region: "North", population: 25400000, risk_score: 45.0, risk_level: "Moderate", active_disaster: "Heatwave Advisory", weather: "Hot & Dry", temperature: 40, water_shortage_risk: 50, heatwave_risk: 65, hospitals: 160, shelters: 180, supplies: { boats: 15, medical_kits: 5500, rations_tons: 90 }, flood_risk: 8, response_time_minutes: 18.0 },
  { id: "IN-HP", name: "Himachal Pradesh", region: "North", population: 6800000, risk_score: 22.0, risk_level: "Low", active_disaster: "None", weather: "Clear Sky", temperature: 21, water_shortage_risk: 15, heatwave_risk: 5, hospitals: 85, shelters: 120, supplies: { boats: 5, medical_kits: 3000, rations_tons: 45 }, flood_risk: 15, response_time_minutes: 35.0 },
  { id: "IN-JH", name: "Jharkhand", region: "East", population: 32900000, risk_score: 48.0, risk_level: "Moderate", active_disaster: "Flash Flood Watch", weather: "Overcast & Rain", temperature: 30, water_shortage_risk: 30, heatwave_risk: 40, hospitals: 140, shelters: 220, supplies: { boats: 70, medical_kits: 5000, rations_tons: 85 }, flood_risk: 35, response_time_minutes: 28.0 },
  { id: "IN-KA", name: "Karnataka", region: "South", population: 61100000, risk_score: 38.0, risk_level: "Moderate", active_disaster: "None", weather: "Moderate Rainfall", temperature: 27, water_shortage_risk: 30, heatwave_risk: 25, hospitals: 320, shelters: 400, supplies: { boats: 100, medical_kits: 8500, rations_tons: 140 }, flood_risk: 22, response_time_minutes: 18.0 },
  { id: "IN-KL", name: "Kerala", region: "South", population: 33400000, risk_score: 30.0, risk_level: "Low", active_disaster: "Landslide Hazard", weather: "Monsoon Showers", temperature: 26, water_shortage_risk: 10, heatwave_risk: 15, hospitals: 240, shelters: 310, supplies: { boats: 150, medical_kits: 6200, rations_tons: 95 }, flood_risk: 42, response_time_minutes: 18.0 },
  { id: "IN-MP", name: "Madhya Pradesh", region: "Central", population: 72600000, risk_score: 42.0, risk_level: "Moderate", active_disaster: "Heatwave Advisory", weather: "Hot & Humid", temperature: 39, water_shortage_risk: 50, heatwave_risk: 60, hospitals: 260, shelters: 320, supplies: { boats: 50, medical_kits: 7500, rations_tons: 130 }, flood_risk: 15, response_time_minutes: 25.0 },
  { id: "IN-MH", name: "Maharashtra", region: "West-Central", population: 112400000, risk_score: 48.0, risk_level: "Moderate", active_disaster: "Urban Inundation Risk", weather: "Monsoon Drizzle", temperature: 30, water_shortage_risk: 45, heatwave_risk: 50, hospitals: 450, shelters: 550, supplies: { boats: 190, medical_kits: 12000, rations_tons: 180 }, flood_risk: 40, response_time_minutes: 15.0 },
  { id: "IN-MN", name: "Manipur", region: "Northeast", population: 2900000, risk_score: 46.0, risk_level: "Moderate", active_disaster: "Landslide Watch", weather: "Heavy Rainfall", temperature: 24, water_shortage_risk: 15, heatwave_risk: 5, hospitals: 40, shelters: 75, supplies: { boats: 20, medical_kits: 1500, rations_tons: 30 }, flood_risk: 35, response_time_minutes: 40.0 },
  { id: "IN-ML", name: "Meghalaya", region: "Northeast", population: 3000000, risk_score: 62.0, risk_level: "High", active_disaster: "Flash Flood Alert", weather: "Extreme Rainfall", temperature: 22, water_shortage_risk: 5, heatwave_risk: 5, hospitals: 38, shelters: 80, supplies: { boats: 35, medical_kits: 1800, rations_tons: 28 }, flood_risk: 70, response_time_minutes: 38.0 },
  { id: "IN-MZ", name: "Mizoram", region: "Northeast", population: 1100000, risk_score: 34.0, risk_level: "Low", active_disaster: "None", weather: "Monsoon Showers", temperature: 23, water_shortage_risk: 10, heatwave_risk: 5, hospitals: 25, shelters: 45, supplies: { boats: 10, medical_kits: 800, rations_tons: 18 }, flood_risk: 28, response_time_minutes: 42.0 },
  { id: "IN-NL", name: "Nagaland", region: "Northeast", population: 2000000, risk_score: 35.0, risk_level: "Low", active_disaster: "None", weather: "Light Rain", temperature: 22, water_shortage_risk: 12, heatwave_risk: 5, hospitals: 30, shelters: 50, supplies: { boats: 8, medical_kits: 1000, rations_tons: 22 }, flood_risk: 25, response_time_minutes: 40.0 },
  { id: "IN-OR", name: "Odisha", region: "East", population: 41900000, risk_score: 62.0, risk_level: "High", active_disaster: "Cyclone Warning", weather: "Squally Winds", temperature: 29, water_shortage_risk: 20, heatwave_risk: 30, hospitals: 185, shelters: 650, supplies: { boats: 320, medical_kits: 7500, rations_tons: 120 }, flood_risk: 65, response_time_minutes: 22.0 },
  { id: "IN-PB", name: "Punjab", region: "North", population: 27700000, risk_score: 36.0, risk_level: "Moderate", active_disaster: "None", weather: "Hot & Clear", temperature: 38, water_shortage_risk: 45, heatwave_risk: 55, hospitals: 180, shelters: 200, supplies: { boats: 10, medical_kits: 5500, rations_tons: 95 }, flood_risk: 10, response_time_minutes: 18.0 },
  { id: "IN-RJ", name: "Rajasthan", region: "Northwest", population: 68500000, risk_score: 72.0, risk_level: "High", active_disaster: "Severe Heatwave", weather: "Arid & Heatwave", temperature: 46, water_shortage_risk: 85, heatwave_risk: 90, hospitals: 190, shelters: 140, supplies: { boats: 2, medical_kits: 6000, rations_tons: 100 }, flood_risk: 2, response_time_minutes: 28.0 },
  { id: "IN-SK", name: "Sikkim", region: "Northeast", population: 610000, risk_score: 40.0, risk_level: "Moderate", active_disaster: "Glacial Lake Outburst Watch", weather: "Cold & Overcast", temperature: 15, water_shortage_risk: 8, heatwave_risk: 2, hospitals: 18, shelters: 35, supplies: { boats: 5, medical_kits: 600, rations_tons: 12 }, flood_risk: 30, response_time_minutes: 45.0 },
  { id: "IN-TN", name: "Tamil Nadu", region: "South", population: 72100000, risk_score: 45.0, risk_level: "Moderate", active_disaster: "Cyclone Watch", weather: "Warm & Humid", temperature: 34, water_shortage_risk: 40, heatwave_risk: 45, hospitals: 380, shelters: 520, supplies: { boats: 180, medical_kits: 9500, rations_tons: 160 }, flood_risk: 30, response_time_minutes: 16.0 },
  { id: "IN-TG", name: "Telangana", region: "South-Central", population: 35000000, risk_score: 40.0, risk_level: "Moderate", active_disaster: "None", weather: "Hot & Humid", temperature: 36, water_shortage_risk: 40, heatwave_risk: 50, hospitals: 220, shelters: 280, supplies: { boats: 30, medical_kits: 6000, rations_tons: 100 }, flood_risk: 18, response_time_minutes: 18.0 },
  { id: "IN-TR", name: "Tripura", region: "Northeast", population: 3700000, risk_score: 42.0, risk_level: "Moderate", active_disaster: "Flood Watch", weather: "Heavy Showers", temperature: 28, water_shortage_risk: 10, heatwave_risk: 10, hospitals: 35, shelters: 70, supplies: { boats: 25, medical_kits: 1400, rations_tons: 25 }, flood_risk: 38, response_time_minutes: 35.0 },
  { id: "IN-UP", name: "Uttar Pradesh", region: "North", population: 199800000, risk_score: 60.0, risk_level: "High", active_disaster: "Heatwave & Flood Dual Risk", weather: "Hot & Thunderstorms", temperature: 40, water_shortage_risk: 50, heatwave_risk: 70, hospitals: 520, shelters: 680, supplies: { boats: 200, medical_kits: 15000, rations_tons: 250 }, flood_risk: 55, response_time_minutes: 25.0 },
  { id: "IN-UT", name: "Uttarakhand", region: "North", population: 10100000, risk_score: 62.0, risk_level: "High", active_disaster: "Cloudburst & Landslide Alert", weather: "Heavy Rainfall", temperature: 22, water_shortage_risk: 15, heatwave_risk: 10, hospitals: 95, shelters: 150, supplies: { boats: 25, medical_kits: 3500, rations_tons: 55 }, flood_risk: 58, response_time_minutes: 35.0 },
  { id: "IN-WB", name: "West Bengal", region: "East", population: 91300000, risk_score: 65.0, risk_level: "High", active_disaster: "Cyclone & Flood Risk", weather: "Heavy Monsoon", temperature: 30, water_shortage_risk: 20, heatwave_risk: 35, hospitals: 350, shelters: 500, supplies: { boats: 280, medical_kits: 10000, rations_tons: 170 }, flood_risk: 72, response_time_minutes: 22.0 },
  { id: "IN-CH", name: "Chandigarh", region: "North", population: 1100000, risk_score: 25.0, risk_level: "Low", active_disaster: "None", weather: "Hot & Clear", temperature: 38, water_shortage_risk: 30, heatwave_risk: 45, hospitals: 25, shelters: 30, supplies: { boats: 2, medical_kits: 1500, rations_tons: 15 }, flood_risk: 5, response_time_minutes: 10.0 },
  { id: "IN-DL", name: "Delhi", region: "North", population: 19000000, risk_score: 55.0, risk_level: "Moderate", active_disaster: "Heatwave & Air Quality Alert", weather: "Hot & Smoggy", temperature: 42, water_shortage_risk: 55, heatwave_risk: 75, hospitals: 350, shelters: 250, supplies: { boats: 15, medical_kits: 10000, rations_tons: 120 }, flood_risk: 20, response_time_minutes: 12.0 },
  { id: "IN-AN", name: "Andaman and Nicobar Islands", region: "Island", population: 380000, risk_score: 42.0, risk_level: "Moderate", active_disaster: "Cyclone Watch", weather: "Tropical Showers", temperature: 29, water_shortage_risk: 15, heatwave_risk: 10, hospitals: 12, shelters: 25, supplies: { boats: 80, medical_kits: 600, rations_tons: 10 }, flood_risk: 30, response_time_minutes: 50.0 },
  { id: "IN-DN", name: "Dadra and Nagar Haveli", region: "West", population: 590000, risk_score: 28.0, risk_level: "Low", active_disaster: "None", weather: "Warm & Humid", temperature: 30, water_shortage_risk: 20, heatwave_risk: 20, hospitals: 8, shelters: 15, supplies: { boats: 5, medical_kits: 400, rations_tons: 8 }, flood_risk: 12, response_time_minutes: 22.0 },
  { id: "IN-DD", name: "Daman and Diu", region: "West", population: 240000, risk_score: 28.0, risk_level: "Low", active_disaster: "None", weather: "Warm & Coastal", temperature: 31, water_shortage_risk: 18, heatwave_risk: 15, hospitals: 6, shelters: 12, supplies: { boats: 15, medical_kits: 350, rations_tons: 6 }, flood_risk: 10, response_time_minutes: 18.0 },
  { id: "IN-LD", name: "Lakshadweep", region: "Island", population: 65000, risk_score: 38.0, risk_level: "Moderate", active_disaster: "Cyclone Watch", weather: "Tropical Maritime", temperature: 28, water_shortage_risk: 25, heatwave_risk: 8, hospitals: 4, shelters: 10, supplies: { boats: 40, medical_kits: 200, rations_tons: 5 }, flood_risk: 25, response_time_minutes: 60.0 },
  { id: "IN-PY", name: "Puducherry", region: "South", population: 1250000, risk_score: 35.0, risk_level: "Low", active_disaster: "Coastal Erosion Watch", weather: "Warm & Humid", temperature: 32, water_shortage_risk: 25, heatwave_risk: 30, hospitals: 20, shelters: 35, supplies: { boats: 25, medical_kits: 800, rations_tons: 12 }, flood_risk: 18, response_time_minutes: 14.0 },
  { id: "IN-JK", name: "Jammu and Kashmir", region: "North", population: 12500000, risk_score: 40.0, risk_level: "Moderate", active_disaster: "None", weather: "Cold & Clear", temperature: 18, water_shortage_risk: 15, heatwave_risk: 5, hospitals: 110, shelters: 180, supplies: { boats: 15, medical_kits: 4000, rations_tons: 60 }, flood_risk: 15, response_time_minutes: 40.0 },
  { id: "IN-LA", name: "Ladakh", region: "North", population: 270000, risk_score: 32.0, risk_level: "Low", active_disaster: "Glacial Lake Watch", weather: "Cold & Arid", temperature: 10, water_shortage_risk: 20, heatwave_risk: 2, hospitals: 8, shelters: 20, supplies: { boats: 2, medical_kits: 500, rations_tons: 10 }, flood_risk: 12, response_time_minutes: 55.0 }
];

export default function Dashboard() {
  const [states, setStates] = useState<any[]>(FALLBACK_STATES);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapType, setMapType] = useState<"vector" | "satellite">("vector");
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  
  // Simulator State
  const [simRainfall, setSimRainfall] = useState(150);
  const [simRoadClosures, setSimRoadClosures] = useState(10);
  const [simRescueTeams, setSimRescueTeams] = useState(8);
  const [simulationUpdates, setSimulationUpdates] = useState<Record<string, any>>({});
  
  // AI Insights State
  const [aiReport, setAiReport] = useState<any>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Load state baseline from API
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/states`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data)) {
          setStates(data);
        }
      })
      .catch((err) => console.warn("Using fallback state database. API is offline.", err));
  }, []);

  // Update simulator parameters when active state changes
  const activeState = states.find((s) => s.id === selectedStateId);
  const activeSimulatedState = activeState ? {
    ...activeState,
    ...(simulationUpdates[selectedStateId || ""] || {})
  } : null;

  useEffect(() => {
    if (activeState) {
      // Initialize simulator sliders based on active state baseline
      setSimRainfall(activeState.id === "IN-AS" ? 220 : (activeState.id === "IN-OR" ? 150 : 40));
      setSimRoadClosures(activeState.id === "IN-AS" ? 15 : 5);
      setSimRescueTeams(activeState.id === "IN-AS" ? 10 : 4);
      setAiReport(null); // Reset AI report for new state selection
    }
  }, [selectedStateId]);

  // Handle Simulation Request
  const handleSimulate = async (rainfall: number, roads: number, teams: number) => {
    if (!selectedStateId) return;

    // Fast local simulation first to ensure instant visual updates
    const stateData = activeState;
    if (!stateData) return;

    const rainfallInfluence = (rainfall / 100.0) * 18.0;
    const roadInfluence = roads * 0.15;
    const rescueInfluence = teams * 0.9;
    let risk_score = stateData.base_risk + rainfallInfluence + roadInfluence - rescueInfluence;
    risk_score = Math.max(5.0, Math.min(100.0, risk_score));
    
    let risk_level = "Low";
    if (risk_score <= 35) risk_level = "Low";
    else if (risk_score <= 60) risk_level = "Moderate";
    else if (risk_score <= 85) risk_level = "High";
    else risk_level = "Critical";

    const affected_multiplier = (risk_score / 100.0) * 0.05 + (rainfall > 200 ? ((rainfall - 200) / 300.0) * 0.10 : 0);
    const affected_population = Math.max(0, Math.min(stateData.population, Math.round(stateData.population * affected_multiplier)));
    const response_time_minutes = Math.max(8.0, Math.min(180.0, stateData.base_response_time + (roads * 0.4) - (teams * 0.3)));
    
    let active_disaster = stateData.active_disaster;
    if (rainfall > 250) active_disaster = "Severe Flooding";
    else if (rainfall > 100 && active_disaster === "None") active_disaster = "Monsoon Flash Flood Warning";
    
    const localUpdate = {
      risk_score: Math.round(risk_score * 10) / 10,
      risk_level,
      affected_population,
      response_time_minutes: Math.round(response_time_minutes * 10) / 10,
      active_disaster,
      flood_risk: Math.min(100, Math.round((rainfall / 300.0) * 80.0 + (risk_score * 0.2)))
    };

    setSimulationUpdates((prev) => ({
      ...prev,
      [selectedStateId]: localUpdate
    }));

    // Trigger asynchronous fetch to backend simulator to keep server synchronized
    try {
      const res = await fetch(`${API_BASE_URL}/api/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state_id: selectedStateId,
          rainfall_mm: rainfall,
          road_closures: roads,
          rescue_teams: teams
        })
      });
      const data = await res.json();
      if (data && data.risk_score) {
        setSimulationUpdates((prev) => ({
          ...prev,
          [selectedStateId]: data
        }));
      }
    } catch (e) {
      console.warn("Simulator backend offline. Relying on local simulation math.", e);
    }
  };

  // Trigger Simulator adjustments
  const updateRainfall = (val: number) => {
    setSimRainfall(val);
    handleSimulate(val, simRoadClosures, simRescueTeams);
  };
  const updateRoads = (val: number) => {
    setSimRoadClosures(val);
    handleSimulate(simRainfall, val, simRescueTeams);
  };
  const updateTeams = (val: number) => {
    setSimRescueTeams(val);
    handleSimulate(simRainfall, simRoadClosures, val);
  };

  // Generate AI Analysis via Gemini API
  const generateAIAnalysis = async () => {
    if (!selectedStateId || !activeSimulatedState) return;
    setIsGeneratingAI(true);
    setAiReport(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state_id: selectedStateId,
          rainfall_mm: simRainfall,
          road_closures: simRoadClosures,
          rescue_teams: simRescueTeams
        })
      });
      const data = await res.json();
      setAiReport(data);
    } catch (e) {
      console.warn("AI Analysis API failed. Generating rule-based simulation reports.", e);
      // Fallback local report creation
      setTimeout(() => {
        setAiReport({
          overall_risk_level: activeSimulatedState.risk_level,
          confidence_score: 88.5,
          explanation: `Tactical analysis indicates that ${activeSimulatedState.name} is facing increased stress levels. A precipitation value of ${simRainfall}mm leads to critical drainage saturation. Logistics operations are hampered by ${simRoadClosures}% road blockages, causing an estimated response latency of ${activeSimulatedState.response_time_minutes} minutes.`,
          forecast_24h: "Expect precipitation to accumulate further over low-lying valleys. Secondary cloudburst hazards are likely.",
          recommended_actions: [
            `Initiate pre-emptive deployments across all ${activeSimulatedState.shelters} local relief shelters.`,
            `Restock emergency provisions and rations in vulnerable communities.`,
            `Deploy ${simRescueTeams + 3} more rescue units to secure landslip paths.`
          ],
          priority_level: activeSimulatedState.risk_level === "Critical" ? "Immediate" : "High"
        });
      }, 800);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Filter states based on search query
  const filteredStates = states
    .map((s) => ({ ...s, ...(simulationUpdates[s.id] || {}) }))
    .filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Get high risk regions
  const highRiskRegions = [...states]
    .map((s) => ({ ...s, ...(simulationUpdates[s.id] || {}) }))
    .filter((s) => s.risk_level === "High" || s.risk_level === "Critical")
    .sort((a, b) => b.risk_score - a.risk_score);

  return (
    <div className="min-h-screen bg-[#04060b] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/35 overflow-hidden">
      {/* Immersive background noise and grid patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>
      <div className="absolute inset-0 scanline pointer-events-none opacity-[0.07]"></div>

      {/* Header Panel */}
      <header className="border-b border-slate-900 bg-[#070b13]/90 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-950/80 border border-cyan-800/40 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-950/20">
            <ShieldAlert className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider uppercase font-mono bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
              <span>CIVIQ AI</span>
              <span className="text-[9px] font-mono tracking-widest text-slate-400 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 font-normal">NEOC-V1</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">National Disaster Command & Control Support</p>
          </div>
        </div>

        {/* Tactical Status Panel */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="bg-slate-950/80 border border-slate-850 px-3 py-1.5 rounded-lg flex items-center gap-2.5 font-mono text-[10px] uppercase text-slate-400 glass-panel">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            <span>Alerts:</span>
            <span className="text-red-400 font-bold">2 Critical</span>
            <span className="text-slate-650">|</span>
            <span className="text-orange-400 font-bold">3 High Risk</span>
          </div>

          {/* Toggle Map Mode */}
          <div className="flex items-center bg-slate-950 border border-slate-850 rounded-lg p-0.5 font-mono text-[10px] glass-panel">
            <button
              onClick={() => { setMapType("vector"); }}
              className={`px-3 py-1.5 rounded-md transition-all uppercase flex items-center gap-1.5 ${
                mapType === "vector"
                  ? "bg-cyan-950/80 text-cyan-400 border border-cyan-800/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Vector Grid
            </button>
            <button
              onClick={() => { setMapType("satellite"); }}
              className={`px-3 py-1.5 rounded-md transition-all uppercase flex items-center gap-1.5 ${
                mapType === "satellite"
                  ? "bg-cyan-950/80 text-cyan-400 border border-cyan-800/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Satellite
            </button>
          </div>

          <button
            onClick={() => setIsDemoOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-red-950/30 transition-all border border-red-500/30"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Start Live Demo
          </button>
        </div>
      </header>

      {/* Alert Ticker */}
      <div className="bg-[#0b0c14]/90 border-b border-slate-900 py-1.5 px-6 font-mono text-[10px] text-slate-400 overflow-hidden relative">
        <div className="animate-ticker space-x-12">
          <span>⚠️ [RED ALERT] Brahmaputra waterbeds breaching flood channels. Inundation escalating in lower Assam subdivisions.</span>
          <span>⚠️ [ORANGE ALERT] Cyclone depression forming over Bengal coast. Squally winds reaching 70km/h expected in Odisha districts.</span>
          <span>⚠️ [HEATWAVE WARNING] Land surface thermal loading peaking at 46°C in Rajasthan desert margins. Evaporative indices extreme.</span>
          <span>⚠️ [RESOURCE DISPATCH] NDRF task forces mobilized for dispatch to Tezpur airbase. Tactical readiness active.</span>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden relative h-[calc(100vh-100px)]">
        
        {/* Column 1: Left Dashboard Statistics */}
        <section className="lg:col-span-1 border-r border-slate-900 p-6 flex flex-col gap-6 overflow-y-auto bg-[#06080d]/60">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search State or Region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-850 rounded-xl text-xs font-mono text-slate-200 placeholder:text-slate-550 focus:outline-none focus:border-cyan-800/80 transition-all"
            />
          </div>

          {/* AI Situation Summary */}
          <div className="glass-panel border-slate-850 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              <h3 className="font-mono text-xs uppercase tracking-wider text-slate-200 font-bold">AI Situation Briefing</h3>
            </div>
            <p className="font-mono text-[10.5px] text-slate-400 leading-relaxed">
              Monsoon cloud formations are actively discharging heavy precipitation over the Northeast and East-coastal corridors. High surface thermal patterns persist in Rajasthan and Gujarat. Multi-hazard indices show high localized risk. Sensor grid rates operational.
            </p>
          </div>

          {/* High Risk Regions or Search Results panel */}
          <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
            <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest flex items-center justify-between">
              <span>{searchQuery.trim() !== "" ? `Search Results (${filteredStates.length})` : "Top High-Risk regions"}</span>
              {searchQuery.trim() === "" && (
                <span className="text-[9px] text-red-400 font-bold px-1.5 py-0.5 rounded bg-red-950/15 border border-red-500/20 animate-pulse">Alert Active</span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {(searchQuery.trim() !== "" ? filteredStates : highRiskRegions).map((region) => (
                <div
                  key={region.id}
                  onClick={() => setSelectedStateId(region.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 relative overflow-hidden ${
                    selectedStateId === region.id
                      ? "bg-slate-900/60 border-cyan-800 shadow-lg shadow-cyan-950/10"
                      : "bg-slate-950/40 border-slate-850 hover:bg-slate-900/30 hover:border-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-center relative z-10">
                    <span className="font-bold text-sm text-slate-200">{region.name}</span>
                    <span className={`font-mono text-[9px] px-2 py-0.5 rounded border font-semibold ${
                      region.risk_level === "Critical"
                        ? "text-red-400 bg-red-950/20 border-red-500/30 animate-pulse"
                        : "text-orange-400 bg-orange-950/20 border-orange-500/30"
                    }`}>
                      {region.risk_level}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 relative z-10">
                    <span>Threat: <strong className="text-slate-350">{region.active_disaster}</strong></span>
                    <span>Risk: <strong className="text-white font-bold">{region.risk_score}/100</strong></span>
                  </div>

                  {/* Tiny progress fill bar */}
                  <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden relative z-10">
                    <div 
                      className={`h-full ${region.risk_level === "Critical" ? "bg-red-500" : "bg-orange-500"}`}
                      style={{ width: `${region.risk_score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Column 2 & 3: Map Viewport */}
        <section className="lg:col-span-2 p-6 flex flex-col gap-4 relative overflow-hidden bg-[#05070c]">
          {mapType === "vector" ? (
            <CommandMap
              statesData={states}
              selectedStateId={selectedStateId}
              onSelectState={setSelectedStateId}
              simulationUpdates={simulationUpdates}
            />
          ) : (
            <div className="w-full h-full relative border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950 flex flex-col">
              {/* Mock Satellite Imagery Container */}
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200')" }}></div>
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

              {/* Grid overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="p-3 bg-cyan-950/60 border border-cyan-800/50 rounded-full mb-4">
                  <MapIcon className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-slate-200">Google Satellite Overlay</h3>
                <p className="text-xs text-slate-400 font-mono max-w-sm mt-2 leading-relaxed">
                  Enter your Google Maps API Key in `.env` to load live satellite grids. Running local tactical projection vector grid instead.
                </p>
                <button
                  onClick={() => setMapType("vector")}
                  className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-850 text-cyan-400 border border-cyan-900 rounded font-mono text-[10px] uppercase font-bold tracking-widest transition-all"
                >
                  Return to Vector Grid
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Column 4: Right Side Panel (Intelligence & Simulator) */}
        <section className="lg:col-span-1 border-l border-slate-900 p-6 flex flex-col gap-6 overflow-y-auto bg-[#06080d]/60">
          
          {selectedStateId && activeSimulatedState ? (
            <div className="space-y-6">
              
              {/* Selected State Title */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <span>{activeSimulatedState.name}</span>
                      <span className="font-mono text-[9px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {activeSimulatedState.region}
                      </span>
                    </h2>
                    <p className="text-[10px] font-mono text-slate-400 uppercase mt-1">
                      Census Population: {(activeSimulatedState.population / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedStateId(null)}
                    className="p-1 hover:bg-slate-850 rounded border border-slate-850 hover:text-slate-200 text-slate-400 font-mono text-[10px]"
                  >
                    CLOSE
                  </button>
                </div>
              </div>

              {/* Threat Matrix Stats card */}
              <div className="glass-panel border-slate-800 p-4 rounded-xl space-y-3.5">
                <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                  Disaster threat matrix
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900">
                    <div className="text-[9px] text-slate-500 font-mono uppercase">Threat Index</div>
                    <div className="text-xl font-bold font-mono text-white mt-1">
                      {activeSimulatedState.risk_score}/100
                    </div>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900">
                    <div className="text-[9px] text-slate-500 font-mono uppercase">Threat Level</div>
                    <div className={`text-sm font-bold font-mono mt-1 ${
                      activeSimulatedState.risk_level === "Critical" ? "text-red-400" :
                      activeSimulatedState.risk_level === "High" ? "text-orange-400" :
                      activeSimulatedState.risk_level === "Moderate" ? "text-yellow-400" :
                      "text-emerald-400"
                    }`}>
                      {activeSimulatedState.risk_level}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900">
                    <div className="text-[9px] text-slate-500 font-mono uppercase">Inundated Pop</div>
                    <div className="text-sm font-bold font-mono text-white mt-1">
                      {(activeSimulatedState.affected_population / 1000).toFixed(0)}k
                    </div>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900">
                    <div className="text-[9px] text-slate-500 font-mono uppercase">Response Latency</div>
                    <div className="text-sm font-bold font-mono text-slate-200 mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{activeSimulatedState.response_time_minutes}m</span>
                    </div>
                  </div>
                </div>

                {/* Sub-risks meters */}
                <div className="space-y-2 pt-1 border-t border-slate-850">
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[9px] text-slate-400">
                      <span>FLOOD HAZARD</span>
                      <span>{activeSimulatedState.flood_risk}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1">
                      <div className="bg-blue-500 h-full" style={{ width: `${activeSimulatedState.flood_risk}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[9px] text-slate-400">
                      <span>HEATWAVE HAZARD</span>
                      <span>{activeSimulatedState.heatwave_risk}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1">
                      <div className="bg-orange-500 h-full" style={{ width: `${activeSimulatedState.heatwave_risk}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[9px] text-slate-400">
                      <span>WATER SHORTAGE</span>
                      <span>{activeSimulatedState.water_shortage_risk}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1">
                      <div className="bg-cyan-500 h-full" style={{ width: `${activeSimulatedState.water_shortage_risk}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource Logistics panel */}
              <div className="glass-panel border-slate-800 p-4 rounded-xl space-y-3">
                <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest flex justify-between">
                  <span>Logistical Inventory</span>
                  <span className="text-[9px] text-cyan-400 font-bold">READY</span>
                </div>

                <div className="space-y-2 text-xs font-mono text-slate-350">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-cyan-500" />
                    <span>Hospitals: <strong>{activeSimulatedState.hospitals}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-emerald-500" />
                    <span>Relief Camps: <strong>{activeSimulatedState.shelters}</strong></span>
                  </div>
                  <div className="border-t border-slate-850 pt-2 space-y-1 text-[10.5px]">
                    <div>Boats Deployable: <strong className="text-white">{activeSimulatedState.supplies.boats}</strong></div>
                    <div>Medical kits: <strong className="text-white">{activeSimulatedState.supplies.medical_kits}</strong></div>
                    <div>Rations tons: <strong className="text-white">{activeSimulatedState.supplies.rations_tons}t</strong></div>
                  </div>
                </div>
              </div>

              {/* Decision Simulator Panel */}
              <div className="glass-panel border-slate-800 p-4 rounded-xl space-y-4">
                <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>Interactive simulator</span>
                </div>

                <div className="space-y-3.5">
                  {/* Slider: Rainfall */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[10px] text-slate-300">
                      <span>PRECIPITATION RANGE</span>
                      <span className="text-cyan-400 font-bold">{simRainfall} mm</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={simRainfall}
                      onChange={(e) => updateRainfall(Number(e.target.value))}
                      className="w-full accent-cyan-500 bg-slate-900 rounded-lg appearance-none h-1 cursor-pointer"
                    />
                  </div>

                  {/* Slider: Road Closures */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[10px] text-slate-300">
                      <span>ROAD BLOCKAGES</span>
                      <span className="text-orange-400 font-bold">{simRoadClosures}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={simRoadClosures}
                      onChange={(e) => updateRoads(Number(e.target.value))}
                      className="w-full accent-orange-500 bg-slate-900 rounded-lg appearance-none h-1 cursor-pointer"
                    />
                  </div>

                  {/* Slider: Rescue Teams */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[10px] text-slate-300">
                      <span>RESCUE UNITS</span>
                      <span className="text-emerald-400 font-bold">{simRescueTeams} Teams</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={simRescueTeams}
                      onChange={(e) => updateTeams(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-900 rounded-lg appearance-none h-1 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* AI Gemini Analysis panel */}
              <div className="glass-panel border-cyan-800/40 p-4 rounded-xl bg-cyan-950/5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="font-mono text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    <span>AI Disaster Analyst</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono uppercase">Gemini 1.5</span>
                </div>

                {!aiReport && !isGeneratingAI && (
                  <button
                    onClick={generateAIAnalysis}
                    className="w-full py-2.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/60 rounded-xl font-mono text-[10.5px] uppercase tracking-wider text-cyan-400 font-bold flex items-center justify-center gap-2 transition-all shadow-inner"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate AI Report
                  </button>
                )}

                {isGeneratingAI && (
                  <div className="py-6 flex flex-col items-center justify-center text-slate-400 gap-2.5 font-mono text-[10px]">
                    <div className="w-6 h-6 border-2 border-t-cyan-500 border-r-transparent border-slate-800 rounded-full animate-spin"></div>
                    <span className="uppercase text-cyan-400/80 tracking-widest">Invoking Gemini Engine...</span>
                  </div>
                )}

                {aiReport && (
                  <div className="space-y-4 font-mono text-[11px] border-t border-slate-900 pt-3">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-300">INCIDENT CONCLUSION:</div>
                      <p className="text-slate-400 leading-relaxed text-[10.5px]">
                        {aiReport.explanation}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="font-bold text-slate-300">24-HOUR METEOROLOGICAL FORECAST:</div>
                      <p className="text-slate-400 leading-relaxed text-[10.5px]">
                        {aiReport.forecast_24h}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="font-bold text-slate-300">AI RECOMMENDED ACTIONS:</div>
                      <div className="space-y-1 text-slate-400 pl-1">
                        {aiReport.recommended_actions.map((act: string, idx: number) => (
                          <div key={idx} className="flex gap-1.5 items-start">
                            <span className="text-cyan-400 mt-0.5">•</span>
                            <span className="text-[10px] leading-relaxed">{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] bg-slate-950 p-2 rounded border border-slate-900">
                      <span>COMMAND PRIORITY:</span>
                      <span className="text-red-400 font-extrabold animate-pulse uppercase">
                        {aiReport.priority_level}
                      </span>
                    </div>

                    <button 
                      onClick={() => setAiReport(null)}
                      className="w-full py-1.5 text-center text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider text-[9px]"
                    >
                      Clear Report
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-full mb-4 glass-panel">
                <Compass className="w-8 h-8 text-slate-650" />
              </div>
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">Tactical Node Selection</h3>
              <p className="text-[10.5px] text-slate-500 font-mono max-w-[200px] mt-2 leading-relaxed">
                Select a state node from the vector grid or search above to load real-time telemetry and simulator controls.
              </p>
            </div>
          )}

        </section>
      </main>

      {/* Live Cinematic Demo Modal */}
      <LiveDemo
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        stateData={states.find((s) => s.id === "IN-AS")}
      />
    </div>
  );
}
