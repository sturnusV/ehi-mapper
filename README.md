# Ecosystem Health Index (EHI) Mapper

A full-stack web application for visualizing and predicting ecosystem health using spatial data and machine learning.

## 🚀 Tech Stack
- **Frontend**: React + TypeScript + Material-UI + MapLibre
- **Backend**: Node.js + Express + TypeScript 
- **Database**: PostGIS + PostgreSQL
- **Infrastructure**: Docker + Docker Compose
- **Data Sources**: GBIF, WorldClim, Copernicus, SEDAC

## 📁 Project Structure

    📁 EHI-MAPPER/
    ├── 📂 client/              → React frontend
    ├── 📂 server/              → Node.js backend
    ├── 📂 database/            → Database schemas & migrations
    ├── ⚙️ .github/             → GitHub workflows & conventions
    ├── 📝 CHANGELOG.md         → Project changelog
    ├── 🐳 docker-compose.yml   → Multi-service container setup
    └── 📘 README.md

## 🚀 Quick Start

The recommended way to run this application is using Docker Compose, which handles the database, backend, and frontend setup seamlessly.

### 🐳 Using Docker Compose (Recommended)

1.  **Build and Run:** Execute the following command from the root directory to start all services:

    ```bash
    docker compose up --build
    ```

2.  **Access the Application:**

    * **Frontend (Application):** `http://localhost:5173`
    * **Backend API:** `http://localhost:3001`
    * **PostGIS Database:** `localhost:5432`


### 💻 Manual Development Setup

If you prefer to run services individually for development:

1.  **Start Database:**

    ```bash
    docker compose up postgis
    ```

2.  **Start Backend (in `server/` directory):**

    ```bash
    cd server
    npm install
    npm run dev
    ```

3.  **Start Frontend (in `client/` directory):**

    ```bash
    cd client
    npm install
    npm run dev
    ```


## 🔧 API Endpoints

All endpoints are prefixed with `/api`.

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **EHI Calculation** | `POST` | `/api/calculate-ehi` | Calculate EHI scores using a custom set of weights. |
| **Data Management** | `POST` | `/api/data/refresh` | **Trigger the full automated data ingestion pipeline.** |
| **Data Management** | `POST` | `/api/data/refresh/:source` | Refresh a specific data source (e.g., `/api/data/refresh/gbif`). |
| **Data Management** | `GET` | `/api/data/status` | Check the current status of all external data sources. |
| **Data Access** | `GET` | `/api/ehi-locations` | Retrieve original demonstration dataset. |
| **Data Access** | `GET` | `/api/monitoring-sites` | Retrieve data from the automated monitoring sites. |
| **Spatial Data** | `GET` | `/api/enhanced-spatial-data` | GeoJSON of the original data points for mapping. |
| **Spatial Data** | `GET` | `/api/monitoring-spatial-data` | GeoJSON of the automated monitoring data for mapping. |


## 📊 Data Sources

The automated data pipeline processes the following external sources:

* **GBIF:** Species occurrence data for **biodiversity metrics**.
* **WorldClim:** Global climate data for **resilience scoring**.
* **Copernicus:** Land cover classification for **vegetation health**.
* **SEDAC:** Human footprint data for **pressure assessment**.


## 🗺️ Regional Focus: Colorado River Basin

The current EHI model and data are specifically focused on the **Colorado River Basin**.

* **14 Strategically Located Monitoring Sites**
* **Mixed Ecosystems:** Includes forests, wetlands, urban areas, and agriculture.
* **Automated Scoring:** EHI scores are calculated and updated daily based on the pipeline.


## ⚙️ Development Guide

### Adding New Data Sources

To integrate a new data stream into the EHI calculation:

1.  **Create a New Service:** Implement the ingestion logic in a new file within the `server/src/services/` directory. Ensure robust error handling.
2.  **Update Calculation Engine:** Modify the EHI calculation logic to incorporate the new data metric.
3.  **Add API Endpoints:** Create corresponding API endpoints for managing the new data source (e.g., manual refresh, status check).

### Environment Variables

The backend service relies on a `.env` file in the `server/` directory for configuration. A sample configuration for the PostGIS database is shown below:

```
DB_HOST=postgis
DB_PORT=5432
DB_USER=ehi_user
DB_PASSWORD=ehi_password
DB_NAME=ehi_mapper
```


## 🎯 Project Stages

| Stage | Status | Description |
| :--- | :--- | :--- |
| **Stage 1 (Core)** | ✅ Complete | Interactive Map, EHI Calculation, Data Pipeline, Dockerized Deployment, Professional UI/UX. |
| **Stage 2 (Advanced)** | 🚀 In Planning | AI/ML Integration for predictive analytics, Climate Change Projections (WorldClim), Species Distribution Modeling (GBIF), Advanced Spatial Analysis. |



## 🤝 Contributing

We welcome contributions! Please adhere to the following guidelines:

* **Commit Convention:** Follow the structured commit convention detailed in **`.github/COMMIT_CONVENTION.md`**.
* **Changelog:** Update **`CHANGELOG.md`** for any significant changes, new features, or major bug fixes.
* **Pull Requests (PRs):** Ensure all **tests pass** locally before submitting a PR.

---

## 📄 License
This project is for portfolio and demonstration purposes.
