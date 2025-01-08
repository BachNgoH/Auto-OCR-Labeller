import os
import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from src.routers import project_router, label_router, auth_router

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not os.path.exists("uploads"):
    os.makedirs("uploads")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads") 
app.include_router(project_router.router)
app.include_router(label_router.router)
app.include_router(auth_router.router)

if __name__ == "__main__":
  uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
