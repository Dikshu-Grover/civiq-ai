# CIVIQ AI -- India's AI Disaster Command Center

Build a production-quality AI-powered web application called **CIVIQ AI**, an intelligent disaster command center for India. The application should feel like software used by a National Emergency Operations Center, where AI helps authorities monitor disasters, assess risks, predict impacts, and recommend emergency actions.

### Core Experience

The homepage should open with a premium command-center dashboard featuring an interactive map of India, live disaster statistics, an AI Situation Summary, a search bar for states and districts, and a **Top High-Risk Regions** panel for quick navigation. Users should be able to either search or click a state/district to instantly view detailed disaster intelligence.

### AI Intelligence

Integrate Gemini as an intelligent disaster analyst--not a generic chatbot. For every selected state or district, generate:

- Overall risk level 
- Confidence score 
- Explanation of why the area is at risk 
- Disaster forecast for the next 24 hours 
- Recommended emergency actions 
- Priority level 

Responses should be concise, explainable, and actionable.

### Interactive Intelligence Panel

Selecting a location should open a smooth side panel displaying:

- Disaster overview 
- Weather and rainfall 
- Flood, heatwave, and water shortage risk 
- Hospitals and relief shelters 
- Emergency resources 
- AI-generated recommendations 

Use realistic sample data where necessary.

### Decision Simulator

Allow users to simulate scenarios such as increased rainfall, road closures, or additional rescue teams, and instantly visualize changes in risk levels, affected population, response time, and AI recommendations.

### Live Emergency Demo

Include a **Start Live Demo** button that runs a cinematic one-minute flood emergency simulation. Show rainfall intensifying, risk levels increasing, AI detecting the emergency, alerts appearing, rescue teams deploying, shelters activating, resources being allocated, and an AI-generated situation report at the end. This should be the highlight of the application.

### Design & Tech

Use **Next.js 15, React, TypeScript, Tailwind CSS, Framer Motion, Google Maps, Recharts, FastAPI, and the Gemini API**.

Design the interface with inspiration from **Linear, Vercel, Notion AI, and Google Material 3**. Focus on a premium dark theme, smooth animations, responsive layouts, reusable components, clean architecture, and realistic sample data.

**Prioritize polish over feature count. Every screen should reinforce that CIVIQ AI is an intelligent decision-support platform--not just another dashboard. The first 30 seconds of using the application should leave a strong impression through excellent UI, meaningful AI insights, and a memorable live demo.**