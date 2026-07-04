# Stage 1: Build the React frontend
FROM node:20-slim as frontend-builder

WORKDIR /frontend
COPY ./frontend/package*.json ./
RUN npm install
COPY ./frontend ./
RUN npm run build

# Stage 2: Build Python dependencies
FROM python:3.12-slim as backend-requirements

WORKDIR /tmp
COPY ./backend/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip wheel --no-cache-dir --no-deps --wheel-dir /tmp/wheels -r requirements.txt

# Stage 3: Final Production Image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# Install system dependencies (ffmpeg is required for audio processing)
RUN apt-get update && apt-get install -y ffmpeg curl && rm -rf /var/lib/apt/lists/*

# Copy wheels and install backend dependencies
COPY --from=backend-requirements /tmp/wheels /tmp/wheels
RUN pip install --no-cache-dir /tmp/wheels/* && rm -rf /tmp/wheels

# Copy backend application code
COPY ./backend/app /app/app

# Copy frontend build to backend's static directory
COPY --from=frontend-builder /frontend/dist /app/app/static

# Expose port (Hugging Face Spaces uses 7860 by default)
EXPOSE 7860

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
