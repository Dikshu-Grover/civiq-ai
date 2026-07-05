import os
import random
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="CIVIQ AI API", description="Disaster Command Center API")

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
origins = [origin.strip() for origin in frontend_url.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    print("Gemini API configured successfully.")
else:
    print("WARNING: GEMINI_API_KEY not found. Operating in local rules/fallback mode.")

# Pydantic schemas for request/response
class SimulationRequest(BaseModel):
    state_id: str
    rainfall_mm: float = Field(..., ge=0, le=500)
    road_closures: float = Field(..., ge=0, le=100)
    rescue_teams: int = Field(..., ge=0, le=50)

class AIAnalysisRequest(BaseModel):
    state_id: str
    rainfall_mm: float
    road_closures: float
    rescue_teams: int

class AIAnalysisResponse(BaseModel):
    overall_risk_level: str = Field(description="Low, Moderate, High, or Critical")
    confidence_score: float = Field(description="Confidence percentage from 0 to 100")
    explanation: str = Field(description="Clear explanation of the risk factors and environment details")
    forecast_24h: str = Field(description="Forecast predictions for the next 24 hours")
    recommended_actions: List[str] = Field(description="Bullet points of recommended emergency operations")
    priority_level: str = Field(description="Low, Medium, High, or Immediate")

# Baseline Database of India States
BASE_STATES_DATA = {
    "IN-AP": {
        "id": "IN-AP",
        "name": "Andhra Pradesh",
        "region": "South-East",
        "population": 49500000,
        "base_risk": 36.0,
        "base_response_time": 20.0,
        "active_disaster": "Cyclone Alert",
        "weather": "Humid & Overcast",
        "temperature": 33,
        "water_shortage_risk": 35,
        "heatwave_risk": 45,
        "hospitals": 280,
        "shelters": 480,
        "supplies": {"boats": 200, "medical_kits": 7000, "rations_tons": 130},
    },
    "IN-AR": {
        "id": "IN-AR",
        "name": "Arunachal Pradesh",
        "region": "Northeast",
        "population": 1400000,
        "base_risk": 28.0,
        "base_response_time": 45.0,
        "active_disaster": "Landslide Watch",
        "weather": "Heavy Rainfall",
        "temperature": 20,
        "water_shortage_risk": 10,
        "heatwave_risk": 5,
        "hospitals": 35,
        "shelters": 60,
        "supplies": {"boats": 30, "medical_kits": 1200, "rations_tons": 25},
    },
    "IN-AS": {
        "id": "IN-AS",
        "name": "Assam",
        "region": "Northeast",
        "population": 31200000,
        "base_risk": 45.0,
        "base_response_time": 25.0,
        "active_disaster": "Floods",
        "weather": "Heavy Monsoon",
        "temperature": 27,
        "water_shortage_risk": 15,
        "heatwave_risk": 10,
        "hospitals": 142,
        "shelters": 420,
        "supplies": {"boats": 250, "medical_kits": 5000, "rations_tons": 80},
    },
    "IN-BR": {
        "id": "IN-BR",
        "name": "Bihar",
        "region": "North",
        "population": 104000000,
        "base_risk": 40.0,
        "base_response_time": 30.0,
        "active_disaster": "River Inundation",
        "weather": "Thunderstorms",
        "temperature": 31,
        "water_shortage_risk": 30,
        "heatwave_risk": 40,
        "hospitals": 210,
        "shelters": 380,
        "supplies": {"boats": 180, "medical_kits": 9000, "rations_tons": 110},
    },
    "IN-CT": {
        "id": "IN-CT",
        "name": "Chhattisgarh",
        "region": "Central",
        "population": 25500000,
        "base_risk": 30.0,
        "base_response_time": 28.0,
        "active_disaster": "None",
        "weather": "Partly Cloudy",
        "temperature": 32,
        "water_shortage_risk": 25,
        "heatwave_risk": 35,
        "hospitals": 130,
        "shelters": 200,
        "supplies": {"boats": 40, "medical_kits": 4500, "rations_tons": 70},
    },
    "IN-GA": {
        "id": "IN-GA",
        "name": "Goa",
        "region": "West",
        "population": 1500000,
        "base_risk": 22.0,
        "base_response_time": 12.0,
        "active_disaster": "None",
        "weather": "Monsoon Showers",
        "temperature": 28,
        "water_shortage_risk": 10,
        "heatwave_risk": 15,
        "hospitals": 45,
        "shelters": 65,
        "supplies": {"boats": 60, "medical_kits": 2000, "rations_tons": 20},
    },
    "IN-GJ": {
        "id": "IN-GJ",
        "name": "Gujarat",
        "region": "West",
        "population": 60400000,
        "base_risk": 35.0,
        "base_response_time": 20.0,
        "active_disaster": "Heatwave",
        "weather": "Extreme Heat & Dry",
        "temperature": 43,
        "water_shortage_risk": 65,
        "heatwave_risk": 80,
        "hospitals": 310,
        "shelters": 180,
        "supplies": {"boats": 20, "medical_kits": 8000, "rations_tons": 150},
    },
    "IN-HR": {
        "id": "IN-HR",
        "name": "Haryana",
        "region": "North",
        "population": 25400000,
        "base_risk": 33.0,
        "base_response_time": 18.0,
        "active_disaster": "Heatwave Advisory",
        "weather": "Hot & Dry",
        "temperature": 40,
        "water_shortage_risk": 50,
        "heatwave_risk": 65,
        "hospitals": 160,
        "shelters": 180,
        "supplies": {"boats": 15, "medical_kits": 5500, "rations_tons": 90},
    },
    "IN-HP": {
        "id": "IN-HP",
        "name": "Himachal Pradesh",
        "region": "North",
        "population": 6800000,
        "base_risk": 25.0,
        "base_response_time": 35.0,
        "active_disaster": "None",
        "weather": "Clear Sky",
        "temperature": 21,
        "water_shortage_risk": 15,
        "heatwave_risk": 5,
        "hospitals": 85,
        "shelters": 120,
        "supplies": {"boats": 5, "medical_kits": 3000, "rations_tons": 45},
    },
    "IN-JH": {
        "id": "IN-JH",
        "name": "Jharkhand",
        "region": "East",
        "population": 32900000,
        "base_risk": 34.0,
        "base_response_time": 28.0,
        "active_disaster": "Flash Flood Watch",
        "weather": "Overcast & Rain",
        "temperature": 30,
        "water_shortage_risk": 30,
        "heatwave_risk": 40,
        "hospitals": 140,
        "shelters": 220,
        "supplies": {"boats": 70, "medical_kits": 5000, "rations_tons": 85},
    },
    "IN-KA": {
        "id": "IN-KA",
        "name": "Karnataka",
        "region": "South",
        "population": 61100000,
        "base_risk": 30.0,
        "base_response_time": 18.0,
        "active_disaster": "None",
        "weather": "Moderate Rainfall",
        "temperature": 27,
        "water_shortage_risk": 30,
        "heatwave_risk": 25,
        "hospitals": 320,
        "shelters": 400,
        "supplies": {"boats": 100, "medical_kits": 8500, "rations_tons": 140},
    },
    "IN-KL": {
        "id": "IN-KL",
        "name": "Kerala",
        "region": "South",
        "population": 33400000,
        "base_risk": 30.0,
        "base_response_time": 18.0,
        "active_disaster": "Landslide Hazard",
        "weather": "Moderate Rainfall",
        "temperature": 26,
        "water_shortage_risk": 10,
        "heatwave_risk": 15,
        "hospitals": 240,
        "shelters": 310,
        "supplies": {"boats": 150, "medical_kits": 6200, "rations_tons": 95},
    },
    "IN-MP": {
        "id": "IN-MP",
        "name": "Madhya Pradesh",
        "region": "Central",
        "population": 72600000,
        "base_risk": 34.0,
        "base_response_time": 25.0,
        "active_disaster": "Heatwave Advisory",
        "weather": "Hot & Humid",
        "temperature": 39,
        "water_shortage_risk": 50,
        "heatwave_risk": 60,
        "hospitals": 260,
        "shelters": 320,
        "supplies": {"boats": 50, "medical_kits": 7500, "rations_tons": 130},
    },
    "IN-MH": {
        "id": "IN-MH",
        "name": "Maharashtra",
        "region": "West-Central",
        "population": 112400000,
        "base_risk": 32.0,
        "base_response_time": 15.0,
        "active_disaster": "Urban Inundation Risk",
        "weather": "Overcast with Showers",
        "temperature": 30,
        "water_shortage_risk": 45,
        "heatwave_risk": 50,
        "hospitals": 450,
        "shelters": 550,
        "supplies": {"boats": 190, "medical_kits": 12000, "rations_tons": 180},
    },
    "IN-MN": {
        "id": "IN-MN",
        "name": "Manipur",
        "region": "Northeast",
        "population": 2900000,
        "base_risk": 32.0,
        "base_response_time": 40.0,
        "active_disaster": "Landslide Watch",
        "weather": "Heavy Rainfall",
        "temperature": 24,
        "water_shortage_risk": 15,
        "heatwave_risk": 5,
        "hospitals": 40,
        "shelters": 75,
        "supplies": {"boats": 20, "medical_kits": 1500, "rations_tons": 30},
    },
    "IN-ML": {
        "id": "IN-ML",
        "name": "Meghalaya",
        "region": "Northeast",
        "population": 3000000,
        "base_risk": 35.0,
        "base_response_time": 38.0,
        "active_disaster": "Flash Flood Alert",
        "weather": "Extreme Rainfall",
        "temperature": 22,
        "water_shortage_risk": 5,
        "heatwave_risk": 5,
        "hospitals": 38,
        "shelters": 80,
        "supplies": {"boats": 35, "medical_kits": 1800, "rations_tons": 28},
    },
    "IN-MZ": {
        "id": "IN-MZ",
        "name": "Mizoram",
        "region": "Northeast",
        "population": 1100000,
        "base_risk": 26.0,
        "base_response_time": 42.0,
        "active_disaster": "None",
        "weather": "Monsoon Showers",
        "temperature": 23,
        "water_shortage_risk": 10,
        "heatwave_risk": 5,
        "hospitals": 25,
        "shelters": 45,
        "supplies": {"boats": 10, "medical_kits": 800, "rations_tons": 18},
    },
    "IN-NL": {
        "id": "IN-NL",
        "name": "Nagaland",
        "region": "Northeast",
        "population": 2000000,
        "base_risk": 27.0,
        "base_response_time": 40.0,
        "active_disaster": "None",
        "weather": "Light Rain",
        "temperature": 22,
        "water_shortage_risk": 12,
        "heatwave_risk": 5,
        "hospitals": 30,
        "shelters": 50,
        "supplies": {"boats": 8, "medical_kits": 1000, "rations_tons": 22},
    },
    "IN-OR": {
        "id": "IN-OR",
        "name": "Odisha",
        "region": "East",
        "population": 41900000,
        "base_risk": 38.0,
        "base_response_time": 22.0,
        "active_disaster": "Cyclone Warning",
        "weather": "Squally Winds & Rain",
        "temperature": 29,
        "water_shortage_risk": 20,
        "heatwave_risk": 30,
        "hospitals": 185,
        "shelters": 650,
        "supplies": {"boats": 320, "medical_kits": 7500, "rations_tons": 120},
    },
    "IN-PB": {
        "id": "IN-PB",
        "name": "Punjab",
        "region": "North",
        "population": 27700000,
        "base_risk": 28.0,
        "base_response_time": 18.0,
        "active_disaster": "None",
        "weather": "Hot & Clear",
        "temperature": 38,
        "water_shortage_risk": 45,
        "heatwave_risk": 55,
        "hospitals": 180,
        "shelters": 200,
        "supplies": {"boats": 10, "medical_kits": 5500, "rations_tons": 95},
    },
    "IN-RJ": {
        "id": "IN-RJ",
        "name": "Rajasthan",
        "region": "Northwest",
        "population": 68500000,
        "base_risk": 48.0,
        "base_response_time": 28.0,
        "active_disaster": "Severe Heatwave & Drought",
        "weather": "Arid & Heatwave",
        "temperature": 46,
        "water_shortage_risk": 85,
        "heatwave_risk": 90,
        "hospitals": 190,
        "shelters": 140,
        "supplies": {"boats": 2, "medical_kits": 6000, "rations_tons": 100},
    },
    "IN-SK": {
        "id": "IN-SK",
        "name": "Sikkim",
        "region": "Northeast",
        "population": 610000,
        "base_risk": 30.0,
        "base_response_time": 45.0,
        "active_disaster": "Glacial Lake Outburst Watch",
        "weather": "Cold & Overcast",
        "temperature": 15,
        "water_shortage_risk": 8,
        "heatwave_risk": 2,
        "hospitals": 18,
        "shelters": 35,
        "supplies": {"boats": 5, "medical_kits": 600, "rations_tons": 12},
    },
    "IN-TN": {
        "id": "IN-TN",
        "name": "Tamil Nadu",
        "region": "South",
        "population": 72100000,
        "base_risk": 34.0,
        "base_response_time": 16.0,
        "active_disaster": "Cyclone Watch",
        "weather": "Warm & Humid",
        "temperature": 34,
        "water_shortage_risk": 40,
        "heatwave_risk": 45,
        "hospitals": 380,
        "shelters": 520,
        "supplies": {"boats": 180, "medical_kits": 9500, "rations_tons": 160},
    },
    "IN-TG": {
        "id": "IN-TG",
        "name": "Telangana",
        "region": "South-Central",
        "population": 35000000,
        "base_risk": 32.0,
        "base_response_time": 18.0,
        "active_disaster": "None",
        "weather": "Hot & Humid",
        "temperature": 36,
        "water_shortage_risk": 40,
        "heatwave_risk": 50,
        "hospitals": 220,
        "shelters": 280,
        "supplies": {"boats": 30, "medical_kits": 6000, "rations_tons": 100},
    },
    "IN-TR": {
        "id": "IN-TR",
        "name": "Tripura",
        "region": "Northeast",
        "population": 3700000,
        "base_risk": 30.0,
        "base_response_time": 35.0,
        "active_disaster": "Flood Watch",
        "weather": "Heavy Showers",
        "temperature": 28,
        "water_shortage_risk": 10,
        "heatwave_risk": 10,
        "hospitals": 35,
        "shelters": 70,
        "supplies": {"boats": 25, "medical_kits": 1400, "rations_tons": 25},
    },
    "IN-UP": {
        "id": "IN-UP",
        "name": "Uttar Pradesh",
        "region": "North",
        "population": 199800000,
        "base_risk": 42.0,
        "base_response_time": 25.0,
        "active_disaster": "Heatwave & Flood Dual Risk",
        "weather": "Hot & Thunderstorms",
        "temperature": 40,
        "water_shortage_risk": 50,
        "heatwave_risk": 70,
        "hospitals": 520,
        "shelters": 680,
        "supplies": {"boats": 200, "medical_kits": 15000, "rations_tons": 250},
    },
    "IN-UT": {
        "id": "IN-UT",
        "name": "Uttarakhand",
        "region": "North",
        "population": 10100000,
        "base_risk": 38.0,
        "base_response_time": 35.0,
        "active_disaster": "Cloudburst & Landslide Alert",
        "weather": "Heavy Rainfall",
        "temperature": 22,
        "water_shortage_risk": 15,
        "heatwave_risk": 10,
        "hospitals": 95,
        "shelters": 150,
        "supplies": {"boats": 25, "medical_kits": 3500, "rations_tons": 55},
    },
    "IN-WB": {
        "id": "IN-WB",
        "name": "West Bengal",
        "region": "East",
        "population": 91300000,
        "base_risk": 40.0,
        "base_response_time": 22.0,
        "active_disaster": "Cyclone & Flood Risk",
        "weather": "Heavy Monsoon",
        "temperature": 30,
        "water_shortage_risk": 20,
        "heatwave_risk": 35,
        "hospitals": 350,
        "shelters": 500,
        "supplies": {"boats": 280, "medical_kits": 10000, "rations_tons": 170},
    },
    "IN-CH": {
        "id": "IN-CH",
        "name": "Chandigarh",
        "region": "North",
        "population": 1100000,
        "base_risk": 18.0,
        "base_response_time": 10.0,
        "active_disaster": "None",
        "weather": "Hot & Clear",
        "temperature": 38,
        "water_shortage_risk": 30,
        "heatwave_risk": 45,
        "hospitals": 25,
        "shelters": 30,
        "supplies": {"boats": 2, "medical_kits": 1500, "rations_tons": 15},
    },
    "IN-DL": {
        "id": "IN-DL",
        "name": "Delhi",
        "region": "North",
        "population": 19000000,
        "base_risk": 35.0,
        "base_response_time": 12.0,
        "active_disaster": "Heatwave & Air Quality Alert",
        "weather": "Hot & Smoggy",
        "temperature": 42,
        "water_shortage_risk": 55,
        "heatwave_risk": 75,
        "hospitals": 350,
        "shelters": 250,
        "supplies": {"boats": 15, "medical_kits": 10000, "rations_tons": 120},
    },
    "IN-AN": {
        "id": "IN-AN",
        "name": "Andaman and Nicobar Islands",
        "region": "Island",
        "population": 380000,
        "base_risk": 30.0,
        "base_response_time": 50.0,
        "active_disaster": "Cyclone Watch",
        "weather": "Tropical Showers",
        "temperature": 29,
        "water_shortage_risk": 15,
        "heatwave_risk": 10,
        "hospitals": 12,
        "shelters": 25,
        "supplies": {"boats": 80, "medical_kits": 600, "rations_tons": 10},
    },
    "IN-DN": {
        "id": "IN-DN",
        "name": "Dadra and Nagar Haveli",
        "region": "West",
        "population": 590000,
        "base_risk": 20.0,
        "base_response_time": 22.0,
        "active_disaster": "None",
        "weather": "Warm & Humid",
        "temperature": 30,
        "water_shortage_risk": 20,
        "heatwave_risk": 20,
        "hospitals": 8,
        "shelters": 15,
        "supplies": {"boats": 5, "medical_kits": 400, "rations_tons": 8},
    },
    "IN-DD": {
        "id": "IN-DD",
        "name": "Daman and Diu",
        "region": "West",
        "population": 240000,
        "base_risk": 22.0,
        "base_response_time": 18.0,
        "active_disaster": "None",
        "weather": "Warm & Coastal",
        "temperature": 31,
        "water_shortage_risk": 18,
        "heatwave_risk": 15,
        "hospitals": 6,
        "shelters": 12,
        "supplies": {"boats": 15, "medical_kits": 350, "rations_tons": 6},
    },
    "IN-LD": {
        "id": "IN-LD",
        "name": "Lakshadweep",
        "region": "Island",
        "population": 65000,
        "base_risk": 28.0,
        "base_response_time": 60.0,
        "active_disaster": "Cyclone Watch",
        "weather": "Tropical Maritime",
        "temperature": 28,
        "water_shortage_risk": 25,
        "heatwave_risk": 8,
        "hospitals": 4,
        "shelters": 10,
        "supplies": {"boats": 40, "medical_kits": 200, "rations_tons": 5},
    },
    "IN-PY": {
        "id": "IN-PY",
        "name": "Puducherry",
        "region": "South",
        "population": 1250000,
        "base_risk": 28.0,
        "base_response_time": 14.0,
        "active_disaster": "Coastal Erosion Watch",
        "weather": "Warm & Humid",
        "temperature": 32,
        "water_shortage_risk": 25,
        "heatwave_risk": 30,
        "hospitals": 20,
        "shelters": 35,
        "supplies": {"boats": 25, "medical_kits": 800, "rations_tons": 12},
    },
    "IN-JK": {
        "id": "IN-JK",
        "name": "Jammu and Kashmir",
        "region": "North",
        "population": 12500000,
        "base_risk": 32.0,
        "base_response_time": 40.0,
        "active_disaster": "None",
        "weather": "Cold & Clear",
        "temperature": 18,
        "water_shortage_risk": 15,
        "heatwave_risk": 5,
        "hospitals": 110,
        "shelters": 180,
        "supplies": {"boats": 15, "medical_kits": 4000, "rations_tons": 60},
    },
    "IN-LA": {
        "id": "IN-LA",
        "name": "Ladakh",
        "region": "North",
        "population": 270000,
        "base_risk": 25.0,
        "base_response_time": 55.0,
        "active_disaster": "Glacial Lake Watch",
        "weather": "Cold & Arid",
        "temperature": 10,
        "water_shortage_risk": 20,
        "heatwave_risk": 2,
        "hospitals": 8,
        "shelters": 20,
        "supplies": {"boats": 2, "medical_kits": 500, "rations_tons": 10},
    }
}

def calculate_simulated_metrics(state_data: dict, rainfall: float, road_closures: float, rescue_teams: int):
    """
    Implements mathematical equations to simulate disaster metrics
    """
    # 1. Calculate simulated risk score
    # Rainfall increases risk (flood/landslide)
    rainfall_influence = (rainfall / 100.0) * 18.0
    
    # Road closures impede response, slightly increasing risk
    road_influence = road_closures * 0.15
    
    # Rescue teams mitigate risk
    rescue_influence = rescue_teams * 0.9
    
    # Adjust base risk dynamically
    risk_score = state_data["base_risk"] + rainfall_influence + road_influence - rescue_influence
    risk_score = max(5.0, min(100.0, risk_score)) # Clamp between 5 and 100
    
    # Categorize Risk Level
    if risk_score <= 35:
        risk_level = "Low"
    elif risk_score <= 60:
        risk_level = "Moderate"
    elif risk_score <= 85:
        risk_level = "High"
    else:
        risk_level = "Critical"
        
    # 2. Affected population based on risk score and rainfall
    affected_multiplier = (risk_score / 100.0) * 0.05
    if rainfall > 200:
        affected_multiplier += ((rainfall - 200) / 300.0) * 0.10
    
    affected_pop = int(state_data["population"] * affected_multiplier)
    affected_pop = max(0, min(state_data["population"], affected_pop))
    
    # 3. Response time based on road closures and rescue teams
    response_time = state_data["base_response_time"] + (road_closures * 0.4) - (rescue_teams * 0.3)
    response_time = max(8.0, min(180.0, response_time)) # Clamp between 8 mins and 3 hours
    
    # Update active disaster based on rainfall or heatwave
    active_disaster = state_data["active_disaster"]
    if rainfall > 250:
        active_disaster = "Severe Flooding"
    elif rainfall > 100 and active_disaster == "None":
        active_disaster = "Monsoon Flash Flood Warning"
    elif state_data["heatwave_risk"] > 75 and rainfall < 10:
        active_disaster = "Severe Heatwave & Drought"
        
    # Flood risk score
    flood_risk = min(100, int((rainfall / 300.0) * 80.0 + (risk_score * 0.2)))
    if state_data["id"] in ("IN-AS", "IN-BR", "IN-WB", "IN-UP"):
        flood_risk = min(100, flood_risk + 15)
        
    return {
        "risk_score": round(risk_score, 1),
        "risk_level": risk_level,
        "affected_population": affected_pop,
        "response_time_minutes": round(response_time, 1),
        "flood_risk": flood_risk,
        "active_disaster": active_disaster
    }

@app.get("/api/states")
def get_states():
    """
    Returns baseline state info with calculated risks
    """
    # Default rainfall values by state for baseline display
    default_rainfall = {
        "IN-AS": 220, "IN-OR": 150, "IN-WB": 180, "IN-BR": 140, "IN-UP": 100,
        "IN-UT": 160, "IN-ML": 200, "IN-AR": 130, "IN-MN": 120, "IN-TR": 110,
        "IN-SK": 90, "IN-KL": 100, "IN-KA": 60, "IN-TN": 70, "IN-AP": 80,
        "IN-JH": 90, "IN-MH": 70, "IN-CT": 50, "IN-MP": 40, "IN-TG": 50,
        "IN-GJ": 20, "IN-RJ": 10, "IN-HR": 15, "IN-PB": 20, "IN-HP": 30,
        "IN-GA": 80, "IN-MZ": 100, "IN-NL": 90,
    }
    default_road_closures = {
        "IN-AS": 15, "IN-OR": 10, "IN-WB": 10, "IN-UT": 12, "IN-ML": 8,
    }
    default_rescue = {
        "IN-AS": 10, "IN-OR": 8, "IN-WB": 8, "IN-UP": 6,
    }
    result = []
    for state_id, state_data in BASE_STATES_DATA.items():
        sim_metrics = calculate_simulated_metrics(
            state_data=state_data,
            rainfall=default_rainfall.get(state_id, 40),
            road_closures=default_road_closures.get(state_id, 5),
            rescue_teams=default_rescue.get(state_id, 4)
        )
        merged = {**state_data, **sim_metrics}
        result.append(merged)
    return result

@app.post("/api/simulate")
def simulate_state(req: SimulationRequest):
    """
    Returns recalculated risk stats based on user simulation inputs
    """
    if req.state_id not in BASE_STATES_DATA:
        raise HTTPException(status_code=404, detail="State not found")
        
    state_data = BASE_STATES_DATA[req.state_id]
    sim_metrics = calculate_simulated_metrics(
        state_data=state_data,
        rainfall=req.rainfall_mm,
        road_closures=req.road_closures,
        rescue_teams=req.rescue_teams
    )
    
    return {
        "state_id": req.state_id,
        "state_name": state_data["name"],
        **sim_metrics
    }

@app.post("/api/analyze", response_model=AIAnalysisResponse)
def analyze_state(req: AIAnalysisRequest):
    """
    Runs Gemini (or falls back to local rules) to analyze disaster state parameters
    """
    if req.state_id not in BASE_STATES_DATA:
        raise HTTPException(status_code=404, detail="State not found")
        
    state_data = BASE_STATES_DATA[req.state_id]
    sim_metrics = calculate_simulated_metrics(
        state_data=state_data,
        rainfall=req.rainfall_mm,
        road_closures=req.road_closures,
        rescue_teams=req.rescue_teams
    )
    
    prompt = f"""
    You are an expert AI Disaster Analyst at the National Emergency Operations Center of India.
    Analyze the following situation report:
    
    Location: {state_data['name']} (Region: {state_data['region']})
    Total Population: {state_data['population']:,}
    Current Active Disaster Status: {sim_metrics['active_disaster']}
    Simulated Risk Level: {sim_metrics['risk_level']} (Risk Score: {sim_metrics['risk_score']}/100)
    Affected Population Estimate: {sim_metrics['affected_population']:,}
    Response Time: {sim_metrics['response_time_minutes']} minutes
    Rainfall Level: {req.rainfall_mm} mm
    Road Closures: {req.road_closures}%
    Rescue Teams Deployed: {req.rescue_teams} teams
    Hospitals: {state_data['hospitals']}
    Relief Shelters: {state_data['shelters']}
    Available Emergency Supplies: {state_data['supplies']}
    
    Provide your response as a structured, actionable emergency command report. Make it highly professional, precise, and specific to the geography of {state_data['name']}. Keep sentences short and impact-driven.
    """
    
    if GEMINI_API_KEY:
        try:
            # We use gemini-1.5-flash which supports structured outputs
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    response_schema=AIAnalysisResponse
                )
            )
            import json
            parsed = json.loads(response.text)
            return AIAnalysisResponse(**parsed)
        except Exception as e:
            print(f"Gemini API invocation failed: {e}. Falling back to rule-based simulation.")
            # Fall through to local rule-based generation
            
    # Local Rule-Based Mock Response Generation
    risk_level = sim_metrics["risk_level"]
    risk_score = sim_metrics["risk_score"]
    
    # Priority Level Mapping
    if risk_level == "Critical":
        priority = "Immediate"
    elif risk_level == "High":
        priority = "High"
    elif risk_level == "Moderate":
        priority = "Medium"
    else:
        priority = "Low"
        
    # Local detailed summaries customized per state
    explanations = {
        "IN-AP": f"Andhra Pradesh faces cyclone-driven storm surge risks along its 974km coastline. {req.rainfall_mm}mm rainfall is intensifying runoff into Krishna and Godavari deltas. {sim_metrics['affected_population']:,} people in low-lying coastal areas are threatened.",
        "IN-AR": f"Arunachal Pradesh's steep Himalayan terrain is experiencing landslide triggers from {req.rainfall_mm}mm rainfall. Remote connectivity makes rescue operations challenging with {req.road_closures}% road blockages.",
        "IN-AS": f"Assam's risk is critical due to heavy monsoon deluge causing the Brahmaputra River to breach embankments. {req.road_closures}% road blockages severely isolate low-lying areas. Active rescue deployment of {req.rescue_teams} teams is mitigating some impact, but {sim_metrics['affected_population']:,} citizens remain threatened.",
        "IN-BR": f"Bihar's flood hazard is driven by Kosi and Ganga river runoff. {sim_metrics['affected_population']:,} people are in inundation zones. Siltation and dyke erosion are contributing factors.",
        "IN-CT": f"Chhattisgarh's central plateau region shows moderate risk levels. {req.rainfall_mm}mm rainfall is causing waterlogging in Mahanadi basin areas. Mining districts face drainage challenges.",
        "IN-GA": f"Goa's coastal belt is experiencing monsoon-driven tidal surges. {req.rainfall_mm}mm rainfall saturating the narrow coastal strip. River Mandovi and Zuari basins show elevated water levels.",
        "IN-GJ": f"Gujarat is grappling with severe meteorological drought and thermal stress. The temperature is hovering at {state_data['temperature']}°C with {state_data['water_shortage_risk']}% water resource shortage. Heavy solar loading threatens agricultural grids.",
        "IN-HR": f"Haryana faces heat stress with temperatures at {state_data['temperature']}°C. Water table depletion at {state_data['water_shortage_risk']}% is affecting agricultural irrigation. {req.rainfall_mm}mm rainfall provides minimal relief.",
        "IN-HP": f"Himachal Pradesh is currently stable, but steep slopes remain susceptible to flash flood triggers if rainfall spikes. Current rain stands at {req.rainfall_mm}mm.",
        "IN-JH": f"Jharkhand's Damodar Valley region faces flash flood risks from {req.rainfall_mm}mm rainfall. Mining areas experiencing waterlogging. {sim_metrics['affected_population']:,} people in flood-prone zones.",
        "IN-KA": f"Karnataka's Western Ghats receiving {req.rainfall_mm}mm rainfall triggering landslide risks in Kodagu and Chikmagalur. Coastal Karnataka faces tidal flooding concerns.",
        "IN-KL": f"Kerala's rugged Western Ghats are experiencing landslip triggers due to {req.rainfall_mm}mm of rain. Inundation is mounting in lower basins. {req.rescue_teams} rescue units are currently clearing landslide debris.",
        "IN-MP": f"Madhya Pradesh experiences heat stress at {state_data['temperature']}°C with monsoon variability. Narmada and Chambal river basins face flood risks when rainfall exceeds thresholds. Current rainfall: {req.rainfall_mm}mm.",
        "IN-MH": f"Maharashtra faces urban flooding in coastal hubs and dry weather in rural districts. Runoff rates are high due to concrete surfaces and congested drains.",
        "IN-MN": f"Manipur's hilly terrain faces landslide hazards with {req.rainfall_mm}mm rainfall. Imphal Valley flooding risk is elevated. Remote areas face connectivity challenges with {req.road_closures}% road blockages.",
        "IN-ML": f"Meghalaya, home to the wettest place on Earth, is recording {req.rainfall_mm}mm rainfall. Flash flood risks are extreme in Jaintia and Khasi Hills. River systems are at dangerously high levels.",
        "IN-MZ": f"Mizoram's terrain presents challenges for emergency response. Current rainfall at {req.rainfall_mm}mm. Bamboo forests limiting landslide damage but road connectivity remains vulnerable.",
        "IN-NL": f"Nagaland's mountainous districts show moderate stability. Rainfall at {req.rainfall_mm}mm with localized landslide risks in Kohima and Dimapur corridors.",
        "IN-OR": f"Odisha is facing severe storm surges and wind hazards. High rainfall levels ({req.rainfall_mm}mm) coupled with {req.road_closures}% road blocks increase vulnerability. Immediate action required in coastal zones to coordinate evacuation.",
        "IN-PB": f"Punjab's agricultural plains face heat stress at {state_data['temperature']}°C. Groundwater depletion critical. Sutlej River flood risk increases with upstream dam releases. {req.rainfall_mm}mm rainfall recorded.",
        "IN-RJ": f"Rajasthan faces severe desert heatwaves reaching {state_data['temperature']}°C. Extreme water shortage at {state_data['water_shortage_risk']}% calls for water trains and tankers.",
        "IN-SK": f"Sikkim faces glacial lake outburst flood (GLOF) risks in high-altitude zones. {req.rainfall_mm}mm rainfall destabilizing moraine dams. Teesta River monitoring is critical.",
        "IN-TN": f"Tamil Nadu's Coromandel Coast faces cyclone-season vulnerability. {req.rainfall_mm}mm rainfall causing urban flooding in Chennai basin. Cauvery delta districts face inundation risks.",
        "IN-TG": f"Telangana's urban centers face heat stress at {state_data['temperature']}°C. Musi and Krishna rivers show moderate flood indices. {req.rainfall_mm}mm rainfall impacting Hyderabad's drainage systems.",
        "IN-TR": f"Tripura's low-lying areas face flooding from {req.rainfall_mm}mm rainfall. Gomati and Muhuri river basins at elevated levels. {sim_metrics['affected_population']:,} residents in vulnerable zones.",
        "IN-UP": f"Uttar Pradesh faces dual hazards: heat stress at {state_data['temperature']}°C in western districts and flood risk from Ganga-Yamuna system in eastern regions. {sim_metrics['affected_population']:,} people at risk.",
        "IN-UT": f"Uttarakhand faces cloudburst and landslide hazards in fragile Himalayan terrain. {req.rainfall_mm}mm rainfall threatening Kedarnath and Badrinath corridors. {req.road_closures}% road blockages isolating hill communities.",
        "IN-WB": f"West Bengal faces dual cyclone and flood threats. {req.rainfall_mm}mm rainfall in Sundarbans delta causing severe inundation. Hooghly River at danger mark. {sim_metrics['affected_population']:,} people in risk zones.",
    }
    
    forecasts = {
        "IN-AP": f"Cyclone depression tracking towards Andhra coast. Storm surge of 1.2m expected in Visakhapatnam-Kakinada belt. Heavy rainfall (>100mm) in next 24 hours.",
        "IN-AR": f"Continued heavy rainfall expected. Multiple landslide warnings for Tawang and West Kameng districts. River Kameng levels rising.",
        "IN-AS": f"Brahmaputra water levels are forecast to rise by another 0.8 meters. High precipitation (>50mm) expected overnight. Inundation will spread to district sub-divisions.",
        "IN-BR": f"Upstream reservoir releases from Nepal will reach North Bihar in 12 hours. Severe waterlogging expected in urban centers.",
        "IN-CT": f"Moderate rainfall expected to continue. Mahanadi basin water levels stabilizing. No major escalation anticipated in next 24 hours.",
        "IN-GA": f"Heavy monsoon showers expected to persist. High tide at 15:00 hrs may cause coastal flooding. River levels rising steadily.",
        "IN-GJ": f"Heatwave conditions will persist for the next 72 hours. Dry westerly winds will sustain temperatures above 42°C. Ground moisture will deplete further.",
        "IN-HR": f"Heat wave conditions to persist for 48 hours. Dust storm advisory for southern districts. No significant rainfall expected.",
        "IN-HP": f"Clear weather will continue for 24 hours, followed by localized thundershowers. Landslide risks are low but dynamic.",
        "IN-JH": f"Damodar Valley Corporation may release water from Panchet Dam. Flash flood warnings for downstream areas. Moderate rainfall to continue.",
        "IN-KA": f"Western Ghats to receive sustained heavy rainfall. Landslide warnings for Kodagu and Hassan. Coastal flooding risk in Mangaluru belt.",
        "IN-KL": f"Monsoon trough is intensifying. Landslide warnings remain high for Idukki and Wayanad. Runoff volume will spike streamflow levels.",
        "IN-MP": f"Monsoon trough passing through central MP. Heavy rainfall expected in Narmada belt. Temperatures to moderate slightly with cloud cover.",
        "IN-MH": f"Heavy coastal downpours forecast for Mumbai and Konkan region. High tide at 14:30 hrs will block urban runoff channels.",
        "IN-MN": f"Intermittent heavy showers expected. Landslide warnings for NH-2 corridor. Imphal Valley flood risk elevated for 48 hours.",
        "IN-ML": f"Cherrapunji and Mawsynram to receive >200mm in next 24 hours. Flash flood warnings for all major river systems. Extreme caution advised.",
        "IN-MZ": f"Moderate rainfall to continue for 24 hours. No major escalation expected. Road conditions may deteriorate in Aizawl district.",
        "IN-NL": f"Light to moderate rainfall expected. Localized landslide risks in Kohima-Dimapur highway corridor. Conditions stable overall.",
        "IN-OR": f"Cyclone landfall projected within 18 hours. Wind speeds exceeding 110 km/h. High-tide surge of 1.5m will inundate 3km inland.",
        "IN-PB": f"Heat wave to persist for 36 hours. Bhakra Dam water release scheduled. Sutlej River flood warning for downstream districts.",
        "IN-RJ": f"Thermal stress will peak at 47°C during midday hours. High-speed dust winds will limit visibility. Dry air mass will dominate.",
        "IN-SK": f"Glacial melt rates accelerating. Teesta River monitoring critical. Localized cloudbursts possible in North Sikkim. GLOF risk remains elevated.",
        "IN-TN": f"Northeast monsoon trough approaching. Heavy rainfall expected in Chennai and delta districts. Bay of Bengal depression intensifying.",
        "IN-TG": f"Heatwave conditions to moderate in 48 hours. Isolated thunderstorms expected over Hyderabad. Musi River levels steady.",
        "IN-TR": f"Continued rainfall expected. Gomati River nearing danger levels. Urban flooding risk in Agartala for next 24 hours.",
        "IN-UP": f"Ganga-Yamuna confluence area flood risk high. Heat wave in western UP to persist. Eastern districts may see 80mm+ rainfall overnight.",
        "IN-UT": f"Cloudburst warnings for Chamoli and Pithoragarh. Alaknanda River levels critical. Road blockages expected to worsen in next 12 hours.",
        "IN-WB": f"Cyclone remnants moving towards Sundarbans. Heavy rainfall (>150mm) expected. Hooghly River at danger mark. Storm surge advisory active.",
    }
    
    # Custom actions
    actions = [
        f"Evacuate vulnerable populations from designated low-lying areas to the {state_data['shelters']} available relief shelters.",
        f"Deploy {max(5, req.rescue_teams + 5)} additional rescue and medical response teams to critical junctions.",
        f"Deliver emergency medical kits (current stock: {state_data['supplies']['medical_kits']} kits) and food rations.",
        "Issue red alerts to district collectors and local radio frequencies.",
        "Establish satellite communication bridges at key emergency posts."
    ]
    if "Heatwave" in state_data["active_disaster"] or state_data["temperature"] > 40:
        actions = [
            "Establish cooling centers in public spaces and supply drinking water packets.",
            "Issue advisory restricting outdoor work between 11:00 AM and 4:00 PM.",
            "Deploy mobile water tankers (water shortage risk at {state_data['water_shortage_risk']}%).",
            "Prepare hospitals for heatstroke casualties and restock electrolyte fluids.",
            "Activate emergency energy grid sharing to support cooling grids."
        ]
        
    return AIAnalysisResponse(
        overall_risk_level=risk_level,
        confidence_score=float(round(max(70.0, 95.0 - (100.0 - risk_score) * 0.2), 1)),
        explanation=explanations.get(req.state_id, f"The region of {state_data['name']} is showing abnormal indices with a risk score of {risk_score}/100. Rainfall and logistics closures are critical factors."),
        forecast_24h=forecasts.get(req.state_id, "Heavy clouds forming over the area. Meteorological variables indicate high likelihood of increased threat levels within the next 24 hours."),
        recommended_actions=actions,
        priority_level=priority
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
