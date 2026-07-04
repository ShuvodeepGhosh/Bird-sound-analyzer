# BirdSense AI

Version: 1.0

---

# 1. Overview

BirdSense AI is an AI-powered wildlife acoustic monitoring platform that identifies bird species from uploaded audio recordings or live microphone streams using BirdNET.

The application should be production-ready, scalable, modular, and capable of running on Windows, Linux, Docker, cloud VMs, and Raspberry Pi devices without major architectural changes.

The system should be designed using modern software engineering practices, emphasizing clean architecture, maintainability, scalability, and extensibility.

---

# 2. Objectives

The application shall:

- Identify bird species from audio recordings.
- Support live microphone analysis.
- Display detected birds with confidence and timestamps.
- Visualize uploaded audio using waveforms.
- Support Raspberry Pi deployment.
- Expose REST APIs and WebSocket APIs.
- Be deployable via Docker.

---

# 3. Target Users

- Bird enthusiasts
- Wildlife researchers
- Students
- AI enthusiasts
- IoT developers
- Raspberry Pi hobbyists

---

# 4. Technology Stack

## Frontend

- React 19
- TypeScript
- Vite
- Material UI
- React Query
- Axios
- React Router
- WaveSurfer.js
- Recharts

## Backend

- Python 3.12
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- Uvicorn
- Librosa
- FFmpeg
- BirdNET Analyzer

Future

- PostgreSQL
- Redis
- Celery

---

# 5. Architecture

Frontend

↓

REST API

↓

FastAPI

↓

BirdNET Service

↓

BirdNET Analyzer

↓

JSON

No frontend component may directly interact with BirdNET.

Business logic shall never exist inside API routes.

---

# 6. Project Structure

backend/

app/

api/

services/

repositories/

database/

models/

schemas/

core/

utils/

uploads/

tests/

frontend/

src/

components/

pages/

hooks/

services/

types/

theme/

context/

assets/

---

# 7. Application Pages

## Home

Landing page

Navigation

Application description

---

## Upload Audio

Upload existing recordings.

Supported formats:

- wav
- mp3
- flac
- ogg
- m4a

Features

- Drag and Drop
- Browse File
- Upload Progress
- Audio Preview
- Validation
- Analyze Button

---

## Live Detection

Features

Start Listening

Stop Listening

Recording Timer

Live Detection

WebSocket communication

Continuous updates

---

## Analysis History

Shows previous analyses.

Search

Filter

Delete

Re-analyze

Export

---

## Settings

BirdNET version

Maximum upload size

Theme

Microphone selection

API configuration

---

# 8. Upload Workflow

Upload Audio

↓

Validate

↓

Save temporarily

↓

BirdNET

↓

Parse output

↓

Return JSON

↓

Delete temporary file

---

# 9. Live Workflow

Browser Microphone

↓

MediaRecorder

↓

3-second chunks

↓

WebSocket

↓

FastAPI

↓

BirdNET

↓

Live Response

---

# 10. REST API

GET /health

POST /api/v1/analyze

GET /api/v1/history

GET /api/v1/history/{id}

DELETE /api/v1/history/{id}

POST /api/v1/reanalyze/{id}

---

# 11. WebSocket

/ws/live

Receive

Audio Chunks

Return

Bird detections

Confidence

Timestamp

---

# 12. Result Model

Analysis

id

filename

duration

processing_time

created_at

Bird Detections

species

scientific_name

confidence

start_time

end_time

frequency

---

# 13. UI Components

Navbar

Sidebar

Upload Card

Waveform

Bird Card

Statistics Card

Timeline

Confidence Chart

Audio Player

History Table

Settings Dialog

Loading Overlay

Error Dialog

---

# 14. Dashboard

Display

Uploaded Audio

Waveform

Bird List

Timeline

Statistics

Most Frequent Bird

Average Confidence

Processing Time

BirdNET Version

---

# 15. Waveform

WaveSurfer.js

Features

Zoom

Play

Pause

Seek

Detection Markers

Click marker

Jump to timestamp

---

# 16. Live Dashboard

Status

Listening

Recording Timer

Latest Detection

Bird Count

Activity Level

Species Count

Confidence

---

# 17. Future Spectrogram

Architecture must support spectrogram overlays.

Spectrogram should synchronize with BirdNET timestamps.

---

# 18. Database

SQLite

Tables

Analysis

Detection

Settings

Database layer must be optional.

Application must run without persistence.

---

# 19. Logging

Structured logging.

Execution time.

BirdNET runtime.

API latency.

Exceptions.

---

# 20. Error Handling

Centralized exception middleware.

Meaningful HTTP codes.

Consistent JSON.

---

# 21. Security

Validate uploads.

Limit upload size.

Sanitize filenames.

Prevent path traversal.

Enable CORS.

---

# 22. Performance

Temporary files only.

Delete files after processing.

Avoid unnecessary memory copies.

Background tasks where appropriate.

---

# 23. UI Theme

Glassmorphism

Dark Forest

Primary

#1B4332

Secondary

#40916C

Accent

#95D5B2

Background

#081C15

Rounded Cards

Smooth Animations

Responsive Layout

---

# 24. Coding Standards

Frontend

Strict TypeScript

Functional Components

Reusable Components

React Query

No inline styles

Backend

Python typing

SOLID

DRY

KISS

Dependency Injection

Repository Pattern

Service Layer

No business logic inside routes.

---

# 25. Testing

Backend

Pytest

Frontend

Vitest

Future

Playwright

---

# 26. Docker

Backend

Frontend

Compose

Environment variables

Health checks

---

# 27. Raspberry Pi Support

Application shall run on Raspberry Pi.

No platform-specific code.

---

# 28. Future Roadmap

- Spectrogram
- Mobile App
- PWA
- GPS Bird Mapping
- Multi-device Monitoring
- Cloud Deployment
- User Authentication
- Notification System
- Rare Bird Alerts
- Analytics Dashboard
- AI Summary Generation

---

# 29. Development Phases

Phase 1

Project Setup

Phase 2

Backend

Phase 3

BirdNET Integration

Phase 4

Frontend

Phase 5

Upload Workflow

Phase 6

Waveform

Phase 7

History

Phase 8

Live Streaming

Phase 9

Docker

Phase 10

Testing

Each phase must be completed before starting the next.

Never generate placeholder code.

Always generate production-ready code.

Always explain architectural decisions before implementation.

Never break previously implemented functionality.
