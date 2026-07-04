---
title: Bird Sound Analyzer
emoji: 🐦
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
---
# Bird Sound Analyzer

This repository contains the Bird Sound Analyzer application. It consists of a FastAPI backend and a React (Vite) frontend.

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose (for running the backend)
- [Node.js](https://nodejs.org/) (version 18+ recommended) and npm (for the frontend)

## Starting the Application

### 1. Start the Backend (Docker)

The backend is built with FastAPI and can be easily started using Docker Compose. It will be available at `http://localhost:8000`.

Open a terminal in the root directory of the project and run:

```bash
docker-compose up -d --build
```

*(To view the logs, you can use `docker-compose logs -f backend`)*

### 2. Start the Frontend (Vite + React)

The frontend is a React application built with Vite. It runs on `http://localhost:5173` by default.

Open a second terminal, navigate to the `frontend` directory, install dependencies, and start the development server:

```bash
cd frontend
npm install
npm run dev
```

## Accessing the App

Once both the backend and frontend are running:
- **Frontend App**: Open your browser and go to `http://localhost:5173` (or the URL provided in your frontend terminal).
- **Backend API Docs**: You can access the Swagger UI documentation for the API at `http://localhost:8000/docs`.

## Stopping the Application

To stop the frontend development server, simply press `Ctrl + C` in the frontend terminal.

To stop the backend services, run the following command in the root directory:

```bash
docker-compose down
```
