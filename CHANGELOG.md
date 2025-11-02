# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- n/a

### Changed
- n/a

### Fixed
- n/a

### Removed
- n/a

---

## [0.4.0] - 01-11-2025

### Added
- **Full Docker Compose stack** with client, server, and database services
- **Automated data ingestion system** for GBIF, WorldClim, Copernicus, and SEDAC data
- **Realistic Colorado River Basin monitoring sites** with ecological context
- **Enhanced EHI calculation engine** with dynamic scoring
- **Data automation scheduler** for daily updates and weekly recalculation

### Changed
- **Database schema** to support automated data pipelines
- **Backend API** with new endpoints for monitoring sites and data management
- **Frontend map visualization** with dynamic layer switching and EHI scoring
- **Project structure** to separate demo data from automated systems

### Fixed
- **PostgreSQL decimal precision** for latitude/longitude coordinates
- **Database initialization** with proper error handling
- **Map layer selection** functionality with real-time visualization updates

### Removed
- n/a

---

## [0.3.0] - 31-10-2025

### Added
- **React frontend foundation** with TypeScript and Material-UI
- **API integration** to fetch spatial data from backend
- **Real-time data display** showing PostGIS coordinates
- **Professional UI** with loading states and error handling

### Changed
- **Enhanced project status** to show full-stack operational status

### Fixed
- n/a

### Removed
- n/a

---

## [0.2.0] - 31-10-2025

### Added
- **Backend foundation** with Node.js, Express, and TypeScript.
- Basic API endpoints for **health checks** and test data retrieval.
- Project dependency management initialized with `package.json`.
- TypeScript configuration (`tsconfig.json`) for type safety.
- Development scripts configured with **hot-reload support**.

### Changed
- **Updated** initial project structure to include `src/` for backend code.

### Fixed
- n/a

### Removed
- n/a

---

## [0.1.0] - 31-10-2025

### Added
- Initial **project scaffolding** created.
- File structure established (`client/`, `server/`, `database/`).
- Docker Compose configuration added, including the **PostGIS database**.
- Database initialization script with test **spatial data**.
- Project documentation including `CHANGELOG.md` and initial `README.md`.
- Git repository initialized with a **conventional commit setup**.

### Changed
- n/a

### Fixed
- n/a

### Removed
- n/a