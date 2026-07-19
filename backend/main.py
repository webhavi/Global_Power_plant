from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routes import predict, auth, plants, analytics
import uvicorn

app = FastAPI(
    title="Global Power Plant Dashboard API",
    description="API for predicting power plant capacity and analyzing global power plant data",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router)
app.include_router(auth.router)
app.include_router(plants.router)
app.include_router(analytics.router)


@app.on_event("startup")
def startup():
    init_db()
    from ml.model import load_model, get_label_encoders, get_scaler
    load_model()
    get_label_encoders()
    get_scaler()


@app.get("/")
def root():
    return {"message": "Global Power Plant Dashboard API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
