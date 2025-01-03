from fastapi import FastAPI
from src.routers import project_router, label_router
import uvicorn

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

app.include_router(project_router)
app.include_router(label_router)

if __name__ == "__main__":
  uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
