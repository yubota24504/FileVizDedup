from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from scanner import scan_directory
from dedup import find_duplicates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    # Restrict origins for safer public publishing. Allows local UI only.
    allow_origins=["http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    path: str

@app.get("/")
def read_root():
    return FileResponse('static/index.html')


@app.get("/favicon.ico")
def favicon():
    # Return empty response to avoid 404 noise from browsers when favicon is not provided.
    from fastapi.responses import Response
    return Response(status_code=204)

@app.post("/api/scan")
def scan_path(request: ScanRequest):
    if not os.path.exists(request.path):
        raise HTTPException(status_code=400, detail="Path does not exist")
    
    file_tree = scan_directory(request.path)
    return file_tree

@app.post("/api/duplicates")
def get_duplicates(request: ScanRequest):
    if not os.path.exists(request.path):
        raise HTTPException(status_code=400, detail="Path does not exist")
    
    duplicates = find_duplicates(request.path)
    return duplicates

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
