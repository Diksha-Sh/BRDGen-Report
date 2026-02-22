"""
BRDGen Intelligence Suite — FastAPI Backend
Full 9-Stage Pipeline Orchestration

Pipeline order:
  1. parser.py         — Signal ingestion (EML/XML/JSON/PDF/TXT/DOCX)
  2. cleaner.py        — Linguistic cleaning & sentence splitting
  3. entity_resolver.py — Stakeholder name dedup
  4. classifier.py     — BART zero-shot → hard_req / soft_req / discard
  5. topic_model.py    — BERTopic → topic assignment
  6. embeddings.py     — MiniLM + cosine dedup → canonical requirements + ChromaDB
  7. conflict.py       — 4-type conflict detection
  8. graph.py          — NetworkX provenance graph
  9. generator.py      — Gemini BRD prose generation (section-by-section)
  10. agent.py         — LangChain ReAct agent for natural language editing
"""
import os
import shutil
import json
import uuid
import datetime
import traceback

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Pipeline stages — imported in order
from pipeline.parser import run_parser
from pipeline.cleaner import clean_and_split
from pipeline.entity_resolver import resolve_entities
from pipeline.classifier import run_classifier
from pipeline.topic_model import run_topic_model
from pipeline.embeddings import run_embeddings
from pipeline.conflict import detect_conflicts
from pipeline.graph import build_provenance_graph
from pipeline.generator import run_generator

# Database
from database import init_db, get_db, User, Project

# ── Directories ───────────────────────────────────────────────────────────────
UPLOAD_DIR = "data/raw"
PARSED_DIR = "data/parsed"
CHROMA_DIR = "data/chromadb"


# ── App Init ──────────────────────────────────────────────────────────────────
app = FastAPI(title="BRDGen Intelligence Suite", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for d in [UPLOAD_DIR, PARSED_DIR, CHROMA_DIR]:
    os.makedirs(d, exist_ok=True)

init_db()
print("🚀 BRDGen Intelligence Suite v3.0 — Full 9-Stage Pipeline Ready")


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "BRDGen v3.0 — 9-Stage Pipeline Active"}


# ── Auth ──────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str


@app.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        username = request.email.split('@')[0].capitalize() if '@' in request.email else "Analyst"
        user = User(name=username, email=request.email, hashed_password=request.password)
        db.add(user)
        db.commit()
        db.refresh(user)

    return {
        "status": "success",
        "user": {
            "id": user.id,
            "name": user.name,
            "role": user.role,
            "access_token": "DEMO-TOKEN"
        }
    }


# ── Main Pipeline Endpoint ────────────────────────────────────────────────────
@app.post("/generate")
async def generate_brd(
    project_name: str = Form(...),
    emails: UploadFile = File(None),
    transcripts: UploadFile = File(None),
    slack: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    session_id = str(uuid.uuid4())
    session_dir = os.path.join(UPLOAD_DIR, session_id)
    os.makedirs(os.path.join(session_dir, "emails"), exist_ok=True)
    os.makedirs(os.path.join(session_dir, "meetings"), exist_ok=True)
    os.makedirs(os.path.join(session_dir, "slack"), exist_ok=True)

    print(f"\n{'='*60}")
    print(f"🚀 BRDGen Pipeline Starting: '{project_name}' [{session_id[:8]}]")
    print(f"{'='*60}")

    # ── Save Uploaded Files ───────────────────────────────────────────────────
    for upload, subfolder in [(emails, "emails"), (transcripts, "meetings"), (slack, "slack")]:
        if upload and upload.filename:
            dest = os.path.join(session_dir, subfolder, upload.filename)
            with open(dest, "wb") as f:
                shutil.copyfileobj(upload.file, f)
            print(f"   Saved: {subfolder}/{upload.filename}")

    try:
        # ── Stage 1: Parse ────────────────────────────────────────────────────
        signals = run_parser(
            os.path.join(session_dir, "emails"),
            os.path.join(session_dir, "meetings"),
            os.path.join(session_dir, "slack")
        )

        if not signals:
            print("⚠️  No signals parsed — pipeline will produce heuristic output.")

        # ── Stage 2: Clean & Split ────────────────────────────────────────────
        sentences = clean_and_split(signals)

        # ── Stage 3: Entity Resolution ────────────────────────────────────────
        sentences, identity_map = resolve_entities(sentences)

        # ── Stage 4: BART Classification ──────────────────────────────────────
        # use_bart=False for quick demo (instant); True triggers 1.6GB download
        classified = run_classifier(sentences, use_bart=False)

        # If classifier filtered everything out, use all sentences with default labels
        if not classified and sentences:
            print("⚠️  Classifier filtered all sentences. Using unclassified sentences.")
            for s in sentences:
                s.setdefault('label', 'soft_requirement')
                s.setdefault('confidence', 0.60)
            classified = sentences

        # ── Stage 5: Topic Modeling ───────────────────────────────────────────
        classified = run_topic_model(classified, use_bertopic=False)

        # ── Stage 6: Semantic Dedup → Canonical Requirements ─────────────────
        requirements = run_embeddings(classified, db_path=CHROMA_DIR)

        # ── Stage 7: Conflict Detection ───────────────────────────────────────
        conflicts = detect_conflicts(requirements)

        # ── Stage 8: Provenance Graph ─────────────────────────────────────────
        graph = build_provenance_graph(requirements, conflicts)

        # ── Stage 9: BRD Generation (Gemini) ─────────────────────────────────
        brd_result = run_generator(requirements, conflicts, project_name)
        brd_sections = brd_result.get("brd_sections", {})

        # ── Assemble Final Response ───────────────────────────────────────────
        parking_lot = [r for r in requirements if r.get('confidence', 1.0) < 0.70]

        # Health score: weighted avg confidence - conflict penalty
        avg_conf = sum(r.get('confidence', 0) for r in requirements) / max(len(requirements), 1)
        conflict_penalty = len(conflicts) * 3
        parking_penalty = len(parking_lot) * 1
        health_score = max(0, min(100, int(avg_conf * 100) - conflict_penalty - parking_penalty))

        unique_stakeholders = list(set(
            src.get('sender', '')
            for req in requirements
            for src in req.get('sources', [])
            if src.get('sender')
        ))

        result = {
            "session_id": session_id,
            "project_name": project_name,
            "mode": "GEMINI",
            "brd_sections": brd_sections,
            "requirements": requirements,
            "conflicts": conflicts,
            "graph": graph,
            "parking_lot": parking_lot,
            "health_score": health_score,
            "stats": {
                "total_requirements": len(requirements),
                "conflicts_detected": len(conflicts),
                "signals_processed": len(sentences),
                "unique_stakeholders": len(unique_stakeholders),
                "parking_lot_count": len(parking_lot),
                "avg_confidence": round(avg_conf, 3)
            },
            "stakeholders": unique_stakeholders,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }

        # ── Persist to DB ─────────────────────────────────────────────────────
        db_project = Project(
            name=project_name,
            health_score=health_score,
            results_json=json.dumps(result)
        )
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        result["project_id"] = db_project.id

        print(f"\n{'='*60}")
        print(f"✅ Pipeline Complete!")
        print(f"   Requirements : {len(requirements)}")
        print(f"   Conflicts    : {len(conflicts)}")
        print(f"   BRD Sections : {len(brd_sections)}")
        print(f"   Health Score : {health_score}%")
        print(f"   Stakeholders : {len(unique_stakeholders)}")
        print(f"{'='*60}\n")

        return result

    except Exception as e:
        err = traceback.format_exc()
        print(f"\n❌ Pipeline Error:\n{err}")
        raise HTTPException(status_code=500, detail=str(e))


# ── Agent Edit Endpoint ───────────────────────────────────────────────────────
class EditRequest(BaseModel):
    instruction: str
    brd_data: dict


@app.post("/edit")
async def edit_brd(request: EditRequest):
    """Natural language BRD editing via LangChain ReAct agent."""
    try:
        from pipeline.agent import BRDAgent
        agent = BRDAgent(
            requirements=request.brd_data.get('requirements', []),
            conflicts=request.brd_data.get('conflicts', []),
            graph=request.brd_data.get('graph', {}),
            brd_sections=request.brd_data.get('brd_sections', {}),
            project_name=request.brd_data.get('project_name', 'Project')
        )
        response = agent.run(request.instruction)
        return {
            "response": response,
            "brd_sections": agent.get_updated_brd_sections(),
            "conflicts": agent.get_updated_conflicts()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Project History ───────────────────────────────────────────────────────────
@app.get("/projects")
async def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.created_at.desc()).limit(20).all()
    return [{
        "id": p.id,
        "name": p.name,
        "created_at": p.created_at.isoformat(),
        "health_score": p.health_score
    } for p in projects]


@app.get("/projects/{project_id}")
async def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return json.loads(project.results_json)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
