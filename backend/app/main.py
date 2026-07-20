import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from contextlib import asynccontextmanager

from app.core.analyzer import get_analyzer

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.exceptions import AppException, app_exception_handler, global_exception_handler
from app.api.v1.router import api_router

# Setup logging
setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the BirdNET model into memory on startup
    get_analyzer()
    yield

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="Backend API for ChirpCheck",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        lifespan=lifespan
    )

    # Set up CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"], # In production, replace with specific origins
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Exception Handlers
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(Exception, global_exception_handler)
    
    # Custom 404 handler for React SPA routing
    @app.exception_handler(404)
    async def custom_404_handler(request, exc):
        from fastapi.responses import JSONResponse, FileResponse
        # If it's an API route that's not found, return JSON 404
        if request.url.path.startswith(settings.API_V1_STR):
            return JSONResponse({"detail": "Not Found"}, status_code=404)
        
        # Otherwise, fallback to React's index.html for client-side routing
        index_path = os.path.join(os.path.dirname(__file__), "static", "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
            
        return JSONResponse({"detail": "Not Found"}, status_code=404)

    # Routers
    app.include_router(api_router, prefix=settings.API_V1_STR)

    # Mount static files for the React frontend (if the directory exists)
    static_dir = os.path.join(os.path.dirname(__file__), "static")
    if os.path.exists(static_dir):
        app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

    return app

app = create_app()

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
