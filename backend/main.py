from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router
from stock import router as stock_router
from labor import router as labor_router
from dashboard import router as dashboard_router

app = FastAPI(title="Pramukh Scrap Software Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Backend is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Register Routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(stock_router, prefix="/api", tags=["stock"])
app.include_router(labor_router, prefix="/api", tags=["labor"])
app.include_router(dashboard_router, prefix="/api", tags=["dashboard"])
