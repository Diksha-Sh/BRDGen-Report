from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import os
import sys
import shutil
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "data/raw"

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
async def login(request: LoginRequest):
    # Simulated corporate directory check
    if "@" not in request.email:
        raise HTTPException(status_code=400, detail="Invalid corporate signal")
    
    # Allow both the Prime token and simple test tokens
    valid_tokens = ["SXS-882-PRIME", "12345", "admin"]
    
    if request.password not in valid_tokens:
        raise HTTPException(status_code=401, detail="Access Token Denied")
    
    username = request.email.split('@')[0].capitalize()
    return {
        "status": "success",
        "user": {
            "name": username,
            "role": "Intelligence Lead",
            "access_token": request.password
        }
    }

@app.post("/upload")
async def upload_files(
    email_file: UploadFile = File(None),
    transcript_file: UploadFile = File(None),
    slack_file: UploadFile = File(None),
    pdf_file: UploadFile = File(None),
    project_name: str = Form(...)
):
    # Clean old data to ensure fresh analysis of "current" files
    for folder in ["emails", "meetings", "slack", "pdfs"]:
        path = f"{UPLOAD_DIR}/{folder}"
        if os.path.exists(path):
            shutil.rmtree(path)
        os.makedirs(path, exist_ok=True)

    if email_file:
        with open(f"{UPLOAD_DIR}/emails/{email_file.filename}", "wb") as buffer:
            shutil.copyfileobj(email_file.file, buffer)
    
    if transcript_file:
        with open(f"{UPLOAD_DIR}/meetings/{transcript_file.filename}", "wb") as buffer:
            shutil.copyfileobj(transcript_file.file, buffer)

    if slack_file:
        with open(f"{UPLOAD_DIR}/slack/{slack_file.filename}", "wb") as buffer:
            shutil.copyfileobj(slack_file.file, buffer)

    if pdf_file:
        with open(f"{UPLOAD_DIR}/pdfs/{pdf_file.filename}", "wb") as buffer:
            shutil.copyfileobj(pdf_file.file, buffer)

    # Save project metadata
    with open("data/project_metadata.json", "w") as f:
        json.dump({"project_name": project_name}, f)

    return {"status": "success", "message": "Files uploaded successfully"}

@app.post("/run-pipeline")
async def trigger_pipeline(background_tasks: BackgroundTasks):
    def run_p():
        # Force a clear of old parsed data
        parsed_dir = "data/parsed"
        if os.path.exists(parsed_dir):
            for f in os.listdir(parsed_dir):
                if f.endswith('.json'):
                    os.remove(os.path.join(parsed_dir, f))
        
        subprocess.run([sys.executable, "run_pipeline.py"])
    
    background_tasks.add_task(run_p)
    return {"status": "success", "message": "Pipeline started and running in background"}

@app.get("/status")
async def get_status():
    return {"status": "operational"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
