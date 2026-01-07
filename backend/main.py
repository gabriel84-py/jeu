from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
import uvicorn
import os

app = FastAPI(title="Mégachiasse", version="1.0.0")

# Chemin vers le dossier frontend1
frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend1")

# Servir les fichiers statiques (CSS, JS, images, etc.)
app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

@app.get("/")
async def root():
    html_file_path = os.path.join(frontend_dir, "index.html")
    return FileResponse(html_file_path)

# Routes pour servir directement les fichiers CSS et JS
@app.get("/style.css")
async def get_css():
    css_path = os.path.join(frontend_dir, "style.css")
    return FileResponse(css_path, media_type="text/css")

@app.get("/game.js")
async def get_js():
    js_path = os.path.join(frontend_dir, "game.js")
    return FileResponse(js_path, media_type="application/javascript")


# uvicorn main:app --reload

uvicorn.run(app, host="0.0.0.0", port=8000)