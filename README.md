# 🌿 Ecosystem Health Index (EHI) Mapper

[![Live Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://ehi-mapper.vercel.app/)
[![Backend API](https://img.shields.io/badge/API-Production-blue)](https://ehi-mapper-production.up.railway.app/health)
[![PostGIS](https://img.shields.io/badge/Database-PostGIS-orange)](https://postgis.net/)

A production-ready full-stack web application for visualizing and predicting ecosystem health using real spatial data and automated machine learning pipelines.

## 🚀 Live Deployment

**🌐 Frontend Application**: [https://ehi-mapper.vercel.app/](https://ehi-mapper.vercel.app/)  
**🔗 Backend API**: [https://ehi-mapper-production.up.railway.app](https://ehi-mapper-production.up.railway.app)  
**📊 Health Check**: [https://ehi-mapper-production.up.railway.app/health](https://ehi-mapper-production.up.railway.app/health)

## 🏗️ Architecture & Tech Stack

### **Frontend Layer**
![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Material-UI](https://img.shields.io/badge/Material--UI-5.14-007FFF?logo=mui)
![MapLibre](https://img.shields.io/badge/MapLibre-3.6-4264FB?logo=mapbox)
![Vite](https://img.shields.io/badge/Vite-4.4-646CFF?logo=vite)

### **Backend Layer**
![Node.js](https://img.shields.io/badge/Node.js-20.8-339933?logo=nodedotjs)
![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Knex.js](https://img.shields.io/badge/Knex.js-2.5-E16426?logo=knex)

### **Data & Infrastructure**
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)
![PostGIS](https://img.shields.io/badge/PostGIS-3.3-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-24.0-2496ED?logo=docker)
![Railway](https://img.shields.io/badge/Railway-Deployed-0B0D0E?logo=railway)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel)

### **Data Sources & APIs**
![GBIF](https://img.shields.io/badge/GBIF-Species_Data-4CAF50?logo=gbif)
![WorldClim](https://img.shields.io/badge/WorldClim-Climate_Data-2196F3)
![Copernicus](https://img.shields.io/badge/Copernicus-Land_Cover-FF9800)
![SEDAC](https://img.shields.io/badge/SEDAC-Human_Footprint-795548)

## 📁 Production Architecture
```
🌐 Production Stack
├── Frontend (Vercel)
│ ├── React + TypeScript + Material-UI
│ ├── MapLibre GL JS for spatial visualization
│ └── Vite for optimized builds
│
├── Backend API (Railway)
│ ├── Node.js + Express + TypeScript
│ ├── Automated data ingestion pipeline
│ ├── EHI calculation engine
│ └── RESTful API with spatial endpoints
│
├── Database (Railway PostgreSQL)
│ ├── PostgreSQL 15 with PostGIS 3.3
│ ├── 14 monitoring sites across Colorado River Basin
│ ├── Real-time EHI scoring
│ └── Automated daily data updates
│
└── External Data Pipeline
├── GBIF: Species occurrence data
├── WorldClim: Climate resilience metrics
├── Copernicus: Land cover classification
└── SEDAC: Human footprint analysis
```


## 🚀 Quick Start

### **🐳 Local Development with Docker (Recommended)**
```bash
# Clone and start complete stack
git clone https://github.com/your-username/ehi-mapper.git
cd ehi-mapper
docker compose up --build

# Access services:
# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
# Database: localhost:5432
```

## 🌐 Production Deployment

* **Frontend:** Vercel (from `client/` directory)
* **Backend:** Railway (from `server/` directory)
* **Database:** Railway PostgreSQL with PostGIS

## 🎯 Key Features

### ✅ Stage 1: Production Ready

* **Interactive Spatial Visualization** with real-time layer switching
* **Automated EHI Calculation Engine** with customizable weights
* **Production Data Pipeline** processing GBIF, WorldClim, Copernicus, and SEDAC data
* **Real Monitoring Network** - 14 sites across Colorado River Basin
* **Professional UI/UX** with Material-UI design system
* **Containerized Deployment** with Docker and cloud orchestration

### 🚀 Stage 2: AI/ML Roadmap

* Climate resilience predictions using WorldClim future scenarios
* Species distribution modeling with GBIF occurrence data
* Anomaly detection for ecosystem health monitoring
* Predictive analytics for conservation planning

## 🔧 API Endpoints

| Category | Method | Endpoint | Description | Live Example |
| :--- | :--- | :--- | :--- | :--- |
| **Health** | GET | `/health` | Service status | [Live] |
| **EHI Calculation** | POST | `/api/calculate-ehi` | Calculate scores with custom weights | [Try] |
| **Data Management** | POST | `/api/data/refresh` | Trigger full data pipeline | - |
| **Monitoring** | GET | `/api/monitoring-sites` | Get automated site data | [Live] |
| **Spatial Data** | GET | `/api/monitoring-spatial-data` | GeoJSON for mapping | [Live] |


## 📊 Data Pipeline Architecture

### 🔄 Automated Data Flow

1. **GBIF API** → Species occurrences → Biodiversity scoring
2. **WorldClim** → Climate metrics → Resilience scoring
3. **Copernicus** → Land cover → Vegetation health
4. **SEDAC** → Human footprint → Pressure assessment
5. **EHI Engine** → Composite scoring → Spatial visualization

## 🗺️ Regional Focus: Colorado River Basin

The application currently focuses on the **246,000 sq mile Colorado River Basin** with:

* **14 strategically located monitoring sites**
* Mixed ecosystems: forests, wetlands, urban areas, agriculture
* Real ecological gradients and climate patterns
* Automated daily EHI scoring and data updates


## 🛠️ Development Guide

### Adding New Data Sources

```bash
// 1. Create ingestion service
export class NewDataService {
  static async fetchAndProcessData() {
    // Implementation
  }
}

// 2. Update EHI calculator
// 3. Add API endpoints
// 4. Update frontend visualization
```

### Environment Configuration

```bash
# Production (automatically set by Railway)
DATABASE_URL=postgresql://user:pass@host:port/db

# Development
DB_HOST=localhost
DB_PORT=5432
DB_USER=ehi_user
DB_PASSWORD=ehi_password
DB_NAME=ehi_mapper
```

## 📈 Project Metrics

* 🚀 **Uptime:** 100% (Production deployment)
* 📊 **Data Sources:** 4 integrated APIs
* 🗺️ **Monitoring Sites:** 14 locations
* 🔄 **Automation:** Daily data updates
* ⚡ **Performance:** Sub-second API responses


## 🤝 Contributing

We welcome contributions! Please see our development guidelines:

* Follow **conventional commits**
* Update **`CHANGELOG.md`** for significant changes
* Ensure all tests pass before submitting PRs


## 📄 License

This project is developed for portfolio demonstration and environmental conservation research purposes.

Built with ❤️ for Environmental Conservation
Demonstrating full-stack development, spatial analytics, and ecological data science

* 🌐 **Live App**
* 🔗 **API**
* 📁 **GitHub**