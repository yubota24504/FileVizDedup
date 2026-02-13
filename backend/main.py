from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from backend.scanner import scan_directory
from backend.dedup import find_duplicates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

# New imports for LLM feature
from typing import List
from backend.llm_client import OllamaClient
from backend.prompt_builder import build_explain_prompt

app = FastAPI()

# --- Static file hosting definition ---
# Use Path to define the absolute path to the static directory.
# This prevents bugs where the app is launched from a different directory.
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Initialize the LLM client
ollama_client = OllamaClient()


app.add_middleware(
    CORSMiddleware,
    # Restrict origins for safer public publishing. Allows local UI only.
    allow_origins=["http://127.0.0.1:8000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    path: str

# New request model for explain feature
class ExplainRequest(BaseModel):
    path: str
    lang: str = "ja"
    max_groups: int = 10


@app.get("/")
async def root():
    return FileResponse(str(STATIC_DIR / "index.html"))


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

# New endpoint for generating explanations
@app.post("/api/duplicates/explain")
def explain_duplicates(request: ExplainRequest):
    if not os.path.exists(request.path):
        raise HTTPException(status_code=400, detail="Path does not exist")

    # find_duplicates returns a list of groups directly
    groups = find_duplicates(request.path)

    if not groups:
        return {"groups": []}

    # Sort groups by wasted space, descending. The 'wasted' key is now in the data.
    # The original sort key was also correct: `key=lambda g: g['wasted'], reverse=True`
    sorted_groups = sorted(groups, key=lambda g: g.get('wasted', 0), reverse=True)

    # Limit to max_groups
    target_groups = sorted_groups[:request.max_groups]

    # Generate explanations for the target groups
    for group in target_groups:
        prompt = build_explain_prompt(group, request.lang)
        explanation = ollama_client.generate(prompt)
        group["explanation"] = explanation

    return {"groups": target_groups}


@app.post("/api/delete")
def delete_files(request: dict):
    """Delete the specified files"""
    files = request.get("files", [])
    
    if not files:
        raise HTTPException(status_code=400, detail="No files specified")
    
    deleted = []
    errors = []
    
    for file_path in files:
        try:
            if os.path.exists(file_path) and os.path.isfile(file_path):
                os.remove(file_path)
                deleted.append(file_path)
            else:
                errors.append({"file": file_path, "error": "File not found or is not a file"})
        except Exception as e:
            errors.append({"file": file_path, "error": str(e)})
    
    return {
        "deleted": deleted,
        "errors": errors,
        "count": len(deleted)
    }
