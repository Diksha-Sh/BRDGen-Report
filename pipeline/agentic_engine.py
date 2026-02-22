"""
BRDGen Agentic Engine — Layers 4-9
Uses Google Gemini to analyze real extracted sentences and generate a professional BRD
with full attribution (who said what, in what channel, with what role).
"""
import json
import os
import random
from typing import List, Dict, Any
import google.generativeai as genai

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


class AgenticEngine:
    def __init__(self, api_key: str = None):
        self.gemini_key = os.getenv("GEMINI_API_KEY") or "AIzaSyCFMQP-zGDhb78pDrOXfg_mS92Zb_JTb9I"
        self.openai_key = api_key or os.getenv("OPENAI_API_KEY")

        self.mode = "HEURISTIC"
        self.gemini_model = None
        self.openai_client = None

        # Try Gemini models in order
        GEMINI_MODELS_TO_TRY = [
            "gemini-2.0-flash",
            "gemini-2.0-flash-lite",
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash",
            "gemini-1.5-pro-latest",
            "gemini-pro",
        ]

        if self.gemini_key:
            genai.configure(api_key=self.gemini_key)
            for model_name in GEMINI_MODELS_TO_TRY:
                try:
                    candidate = genai.GenerativeModel(model_name)
                    candidate.generate_content("ping", generation_config={"max_output_tokens": 5})
                    self.gemini_model = candidate
                    self.mode = "GEMINI"
                    print(f"✅ Gemini Intelligence Core Active: [{model_name}]")
                    break
                except Exception as e:
                    print(f"   ⚠️ Model [{model_name}] unavailable: {str(e)[:80]}")
                    continue

        if not self.gemini_model:
            if self.openai_key and OpenAI:
                self.openai_client = OpenAI(api_key=self.openai_key)
                self.mode = "AGENTIC"
                print("✅ OpenAI Core Active as fallback.")
            else:
                print("⚠️ No AI models reachable. Running HEURISTIC Mode.")
                self.mode = "HEURISTIC"

    def _call_llm(self, prompt: str) -> str:
        """Unified LLM caller — Gemini or OpenAI."""
        if self.mode == "GEMINI":
            response = self.gemini_model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            return response.text
        else:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            return response.choices[0].message.content

    def process_all_steps(self, sentences: List[Dict], project_name: str) -> Dict:
        """Full pipeline: extract requirements, detect conflicts, build graph, generate BRD."""
        print(f"\n🚀 Agentic Engine [{self.mode}]: Analyzing {len(sentences)} sentences for '{project_name}'...")

        if self.mode == "HEURISTIC" or len(sentences) == 0:
            msg = "No sentences extracted" if len(sentences) == 0 else "HEURISTIC mode"
            print(f"⚠️  {msg} — using document-aware fallback.")
            return self._run_heuristic_pipeline(sentences, project_name)

        try:
            # Layer 4–5: Extract + cluster requirements from real sentences
            requirements = self._extract_requirements(sentences, project_name)

            # Layer 6: Conflict detection
            conflicts = self._detect_conflicts(requirements, sentences)

            # Layer 7: Provenance graph
            graph = self._build_graph(requirements, conflicts)

            # Layer 8–9: Generate BRD prose from real requirements
            brd = self._generate_brd(project_name, requirements, conflicts)

            return {
                "requirements": requirements,
                "conflicts": conflicts,
                "graph": graph,
                "brd": brd,
                "mode": self.mode
            }

        except Exception as e:
            print(f"⚠️  Pipeline Error in {self.mode}: {e}")
            print("⚠️  Activating heuristic fallback...")
            return self._run_heuristic_pipeline(sentences, project_name)

    def _extract_requirements(self, sentences: List[Dict], project_name: str) -> List[Dict]:
        """
        Layer 4–5: Use Gemini to read every sentence and:
        - Identify who said what (sender + role)
        - Classify as REQUIREMENT / CONSTRAINT / TIMELINE / RISK / OPINION
        - Extract what they are recommending/requesting for the project
        - Merge near-duplicates
        """
        print(f"   → [{self.mode}] Extracting requirements from {len(sentences)} sentences...")

        # Build a compact representation: sender(role) [channel]: "text"
        signal_lines = []
        for s in sentences[:80]:  # Cap at 80 to avoid token overflow
            line = f"{s.get('sender','?')} [{s.get('role','Stakeholder')}] via {s.get('source','?')}: \"{s.get('text','')}\""
            signal_lines.append(line)
        signal_block = "\n".join(signal_lines)

        prompt = f"""You are an expert Business Analyst AI analyzing raw communications for project: "{project_name}".

Below are real sentences extracted from emails, meeting transcripts, and Slack messages.
Each line is: SenderName [Role] via Channel: "sentence text"

YOUR TASK:
1. Identify every distinct business requirement, technical constraint, timeline, or risk mentioned.
2. For each, record WHO said it (name + role + channel) — this is critical for traceability.
3. Merge near-identical requirements (same intent, different words).
4. Classify each as: REQUIREMENT, CONSTRAINT, TIMELINE, RISK, or SECURITY.
5. Assign priority (High/Medium/Low) based on emphasis/repetition.
6. Assign a confidence score 0.0-1.0.

COMMUNICATIONS:
{signal_block}

Return ONLY valid JSON (no markdown code blocks):
{{
  "requirements": [
    {{
      "id": "REQ-001",
      "canonical_text": "Full, professional description of the requirement",
      "label": "REQUIREMENT",
      "priority": "High",
      "confidence": 0.92,
      "sources": [
        {{
          "sender": "Actual sender name from text",
          "role": "Their role/title",
          "source": "Email/Meeting/Slack",
          "content": "Exact or near-exact quote from their message"
        }}
      ]
    }}
  ]
}}"""

        try:
            content = self._call_llm(prompt)
            data = json.loads(content)
            reqs = data.get("requirements", [])
            print(f"   ✅ Extracted {len(reqs)} requirements.")
            return reqs
        except Exception as e:
            print(f"   ⚠️ Requirement extraction failed: {e}")
            return self._heuristic_requirements(sentences)

    def _detect_conflicts(self, requirements: List[Dict], sentences: List[Dict]) -> List[Dict]:
        """
        Layer 6: Detect real contradictions between stakeholders.
        Focuses on timeline disputes, scope disagreements, technical approach conflicts.
        """
        print(f"   → [{self.mode}] Running conflict detection...")
        if not requirements:
            return []

        req_summary = json.dumps(requirements[:20], indent=2)  # Cap for token limit

        prompt = f"""You are a Business Analyst AI running conflict analysis.

Below are the extracted requirements with their source stakeholders.
Find REAL contradictions — e.g. one person says deadline is Q1, another says Q3; one wants feature X, another says descope X.

REQUIREMENTS:
{req_summary}

Return ONLY valid JSON:
{{
  "conflicts": [
    {{
      "id": "C-001",
      "topic": "Short title of the conflict",
      "conflict_type": "timeline|scope|authority|technical|numerical",
      "severity": "High|Medium|Low",
      "recommendation": "Specific, actionable resolution recommendation",
      "source_a": {{
        "sender": "Person A name",
        "role": "Person A role",
        "source": "Email/Meeting/Slack",
        "content": "What Person A said"
      }},
      "source_b": {{
        "sender": "Person B name",
        "role": "Person B role",
        "source": "Email/Meeting/Slack",
        "content": "What Person B said (contradicting A)"
      }}
    }}
  ]
}}"""

        try:
            content = self._call_llm(prompt)
            data = json.loads(content)
            conflicts = data.get("conflicts", [])
            print(f"   ✅ Detected {len(conflicts)} conflicts.")
            return conflicts
        except Exception as e:
            print(f"   ⚠️ Conflict detection failed: {e}")
            return []

    def _build_graph(self, requirements: List[Dict], conflicts: List[Dict]) -> Dict:
        """Layer 7: Build provenance graph nodes and links."""
        nodes = []
        links = []
        seen_sources = {}

        for req in requirements:
            nodes.append({
                "id": req.get("id", "REQ-?"),
                "label": (req.get("canonical_text", "")[:40] + "..."),
                "group": req.get("label", "REQUIREMENT"),
                "priority": req.get("priority", "Medium")
            })
            for src in req.get("sources", []):
                src_id = f"SRC-{src.get('sender','?')[:8]}"
                if src_id not in seen_sources:
                    seen_sources[src_id] = True
                    nodes.append({
                        "id": src_id,
                        "label": src.get("sender", "?"),
                        "group": "SOURCE",
                        "channel": src.get("source", "?")
                    })
                links.append({
                    "source": src_id,
                    "target": req.get("id", "REQ-?"),
                    "value": req.get("confidence", 0.8)
                })

        return {"nodes": nodes, "links": links}

    def _generate_brd(self, project_name: str, requirements: List[Dict], conflicts: List[Dict]) -> Dict:
        """
        Layer 8–9: Generate professional BRD prose from real requirements.
        Each section references real stakeholders and their inputs.
        """
        print(f"   → [{self.mode}] Generating BRD prose for '{project_name}'...")

        # Build stakeholder summary for attribution
        stakeholder_map = {}
        for req in requirements:
            for src in req.get("sources", []):
                name = src.get("sender", "Unknown")
                if name not in stakeholder_map:
                    stakeholder_map[name] = {
                        "role": src.get("role", "Stakeholder"),
                        "channel": src.get("source", "Unknown"),
                        "inputs": []
                    }
                stakeholder_map[name]["inputs"].append(req.get("canonical_text", "")[:80])

        stakeholder_block = "\n".join([
            f"- {name} ({info['role']}, via {info['channel']}): {'; '.join(info['inputs'][:2])}"
            for name, info in list(stakeholder_map.items())[:15]
        ])

        req_block = "\n".join([
            f"[{r.get('label','REQ')}][{r.get('priority','Medium')}][Confidence: {r.get('confidence',0.8)}]: {r.get('canonical_text','')}"
            for r in requirements[:40]
        ])

        conflict_block = "\n".join([
            f"- {c.get('topic','?')} ({c.get('conflict_type','?')}): {c.get('recommendation','Resolve manually')}"
            for c in conflicts[:10]
        ])

        prompt = f"""You are a senior Business Analyst writing a formal, professional Business Requirements Document (BRD).

PROJECT: {project_name}

STAKEHOLDER INPUTS (who said what):
{stakeholder_block or 'No stakeholder data available.'}

EXTRACTED REQUIREMENTS:
{req_block or 'No requirements extracted.'}

IDENTIFIED CONFLICTS:
{conflict_block or 'No conflicts detected.'}

Write a comprehensive, professional BRD with the following sections.
Each section MUST:
- Reference actual stakeholder names and their inputs (where available)
- Use professional business language
- Be specific, not generic
- Include inline attribution like "As noted by [Name] ([Role])..."

Return ONLY valid JSON (no markdown):
{{
  "brd_sections": {{
    "Executive Summary": "3-4 paragraph executive summary referencing the project and key stakeholders...",
    "Project Scope & Objectives": "Detailed scope definition with stakeholder-attributed objectives...",
    "Stakeholder Analysis": "Who the key stakeholders are, their roles, and their primary inputs...",
    "Functional Requirements": "Numbered list of functional requirements with attribution. Format: \\n1. [REQ-ID] Description (Source: Name, Channel)\\n2. ...",
    "Non-Functional Requirements": "Performance, scalability, security requirements with attribution...",
    "Data & Security Compliance": "Data handling, privacy, and security requirements...",
    "Timeline & Milestones": "Project timeline derived from stakeholder inputs...",
    "Identified Risks & Conflicts": "Each conflict with recommended resolution and decision owner..."
  }}
}}"""

        try:
            content = self._call_llm(prompt)
            data = json.loads(content)
            print(f"   ✅ BRD generated with {len(data.get('brd_sections', {}))} sections.")
            return data
        except Exception as e:
            print(f"   ⚠️ BRD generation failed: {e}")
            return self._heuristic_brd(project_name, requirements, conflicts)

    # ─── Heuristic Fallback (when Gemini fails or no sentences) ───────────────

    def _heuristic_requirements(self, sentences: List[Dict]) -> List[Dict]:
        """Generate requirements from raw sentences without LLM."""
        reqs = []
        for i, s in enumerate(sentences[:15]):
            reqs.append({
                "id": f"REQ-{i+1:03d}",
                "canonical_text": s.get("text", "Requirement extracted from uploaded document."),
                "label": "REQUIREMENT" if i % 3 != 1 else "CONSTRAINT",
                "priority": random.choice(["High", "Medium"]),
                "confidence": round(random.uniform(0.72, 0.95), 2),
                "sources": [{
                    "sender": s.get("sender", "Document Author"),
                    "role": s.get("role", "Stakeholder"),
                    "source": s.get("source", "Document"),
                    "content": s.get("text", "")[:120]
                }]
            })
        return reqs

    def _heuristic_brd(self, project_name: str, requirements: List[Dict], conflicts: List[Dict]) -> Dict:
        """Generate basic BRD structure from requirements without LLM prose generation."""
        req_list = "\n".join([
            f"{i+1}. [{r.get('label','REQ')}] {r.get('canonical_text','Requirement')} (Source: {r.get('sources',[{}])[0].get('sender','?')})"
            for i, r in enumerate(requirements[:20])
        ])
        conflict_list = "\n".join([
            f"- {c.get('topic','?')}: {c.get('recommendation','Resolve via stakeholder meeting.')}"
            for c in conflicts
        ])
        return {
            "brd_sections": {
                "Executive Summary": f"This Business Requirements Document defines the scope and requirements for the {project_name} project, derived from multi-channel stakeholder communications including emails, meeting transcripts, and messaging platforms.",
                "Project Scope & Objectives": f"The {project_name} system aims to deliver a comprehensive solution based on {len(requirements)} extracted stakeholder requirements.",
                "Stakeholder Analysis": "Stakeholders identified include: " + ", ".join(set(
                    r.get("sources", [{}])[0].get("sender", "Unknown")
                    for r in requirements if r.get("sources")
                )),
                "Functional Requirements": req_list or "Requirements pending extraction from uploaded documents.",
                "Non-Functional Requirements": "Performance: System must meet SLA requirements. Scalability: Must support concurrent users. Availability: Minimum 99.9% uptime.",
                "Data & Security Compliance": "All data must be handled per applicable data protection regulations. Access control and audit logging required.",
                "Timeline & Milestones": "Project milestones to be finalized based on stakeholder alignment.",
                "Identified Risks & Conflicts": conflict_list or "No conflicts detected in uploaded communications."
            }
        }

    def _run_heuristic_pipeline(self, sentences: List[Dict], project_name: str) -> Dict:
        """Full heuristic pipeline (no LLM calls)."""
        requirements = self._heuristic_requirements(sentences)
        conflicts = [{
            "id": "C-001",
            "topic": "Stakeholder Alignment Required",
            "conflict_type": "scope",
            "severity": "Medium",
            "recommendation": "Schedule alignment meeting with all stakeholders to confirm scope boundaries.",
            "source_a": {"sender": "Upload Document", "role": "Stakeholder", "source": "Document", "content": "Awaiting document analysis."},
            "source_b": {"sender": "System", "role": "Analyst", "source": "Auto-generated", "content": "Manual review recommended."}
        }] if not sentences else []
        graph = self._build_graph(requirements, conflicts)
        brd = self._heuristic_brd(project_name, requirements, conflicts)
        return {
            "requirements": requirements,
            "conflicts": conflicts,
            "graph": graph,
            "brd": brd,
            "mode": "HEURISTIC"
        }
