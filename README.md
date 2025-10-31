# Ecosystem Health Index (EHI) Mapper

A full-stack web application for visualizing and predicting ecosystem health using spatial data and machine learning.

## 🚀 Tech Stack
- **Frontend**: React + TypeScript + Material-UI + MapLibre
- **Backend**: Node.js + Express + TypeScript 
- **Database**: PostGIS + PostgreSQL
- **Infrastructure**: Docker + Railway + Vercel

## 📁 Project Structure
```
EHI-MAPPER/
├── client/ # React frontend
├── server/ # Node.js backend
├── database/ # Database schemas & migrations
├── .github/ # GitHub workflows & conventions
├── CHANGELOG.md # Project changelog
└── docker-compose.yml
```

## 🏃‍♂️ Quick Start
1. `docker-compose up postgis` - Start database
2. `cd server && npm run dev` - Start backend
3. `cd client && npm run dev` - Start frontend

## 📝 Development Workflow
- We follow [Conventional Commits](https://www.conventionalcommits.org/)
- All changes are documented in [CHANGELOG.md](./CHANGELOG.md)
- See [.github/COMMIT_CONVENTION.md](.github/COMMIT_CONVENTION.md) for commit guidelines

## 🎯 Project Phases
- [x] Phase 1: Project setup & database foundation
- [ ] Phase 2: Backend API development
- [ ] Phase 3: Frontend UI implementation
- [ ] Phase 4: EHI calculations & visualization
- [ ] Phase 5: AI prediction integration

## 📊 Current Status

| Component | Status | Details |
| :--- | :--- | :--- |
| **Database** | ✅ Operational | PostGIS spatial data enabled |
| **Backend** | 🚧 In Development | - |
| **Frontend** | 🚧 In Development | - |
