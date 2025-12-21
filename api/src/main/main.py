import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.main.database import engine, init_engine_and_session
from src.main.routers import (
    auth_router,
    invite_router,
    private_event_router,
    public_event_router,
    question_router,
    user_router,
)


# Initialize database engine and session
@asynccontextmanager
async def lifespan(app: FastAPI):
    if engine is None:
        DATABASE_URL = os.getenv("DATABASE_URL")
        if DATABASE_URL:
            init_engine_and_session(DATABASE_URL)
    yield


# Initialize the FastAPI app
app = FastAPI(lifespan=lifespan)

# Configure app middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:80",
        "http://localhost:5173",
        "http://getloopd.in",
        "http://www.getloopd.in",
        "http://18.119.176.60",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routes from each router with the app
app.include_router(auth_router.router)
app.include_router(invite_router.router)
app.include_router(private_event_router.router)
app.include_router(public_event_router.router)
app.include_router(question_router.router)
app.include_router(user_router.router)
