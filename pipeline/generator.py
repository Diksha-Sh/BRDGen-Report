"""
BRDGen — Stage 8: Professional BRD Prose Generator
Input:  canonical requirements + conflicts + project_name
Output: {brd_sections: {section_name: prose_text}}

Uses Gemini (primary) with keyword fallback.
Each section is generated separately with its relevant requirements.
Every sentence references requirement IDs like [REQ-001] for traceability.
"""
import os
import json

try:
    import google.generativeai as genai
except ImportError:
    genai = None

# ── BRD Section Definitions ───────────────────────────────────────────────────

BRD_SECTIONS = [
    "Executive Summary",
    "Project Scope & Objectives",
    "Stakeholder Analysis",
    "Functional Requirements",
    "Non-Functional Requirements",
    "Data & Security Compliance",
    "Timeline & Milestones",
    "Identified Risks & Conflicts",
]

SECTION_LABELS = {
    "Functional Requirements":     ["hard_requirement"],
    "Non-Functional Requirements": ["soft_requirement"],
}


def _group_requirements_by_section(requirements: list) -> dict:
    """Map requirements to BRD sections."""
    section_map = {s: [] for s in BRD_SECTIONS}

    for req in requirements:
        label = req.get('label', 'soft_requirement')
        topic = req.get('topic_label', '').lower()
        text = req.get('canonical_text', '').lower()

        # Functional
        if label == 'hard_requirement':
            section_map["Functional Requirements"].append(req)
        else:
            section_map["Non-Functional Requirements"].append(req)

        # Also route to specialized sections by topic keywords
        if any(kw in topic or kw in text for kw in ['security', 'compliance', 'gdpr', 'privacy', 'encrypt']):
            section_map["Data & Security Compliance"].append(req)
        if any(kw in topic or kw in text for kw in ['timeline', 'milestone', 'deadline', 'launch', 'q1', 'q2', 'q3', 'q4', 'release']):
            section_map["Timeline & Milestones"].append(req)

    # Top-5 highest confidence = Business Objectives
    top5 = sorted(requirements, key=lambda r: r.get('confidence', 0), reverse=True)[:5]
    section_map["Project Scope & Objectives"] = top5

    # Stakeholders from sources
    section_map["Stakeholder Analysis"] = requirements  # will extract senders in prompt

    # High-corroboration = Executive Summary
    section_map["Executive Summary"] = sorted(requirements, key=lambda r: r.get('corroboration_count', 0), reverse=True)[:4]

    return section_map


def _build_req_block(requirements: list, max_items: int = 20) -> str:
    """Format requirements as a numbered block for the LLM prompt."""
    lines = []
    for r in requirements[:max_items]:
        sources_str = "; ".join([
            f"{s.get('sender','?')} ({s.get('role','?')}) via {s.get('source','?')}"
            for s in r.get('sources', [])[:2]
        ])
        lines.append(
            f"[{r.get('id','REQ-?')}] [{r.get('label','?').upper()}] "
            f"[Confidence: {r.get('confidence', 0):.0%}] "
            f"{r.get('canonical_text', '')}\n"
            f"   Sources: {sources_str}"
        )
    return "\n".join(lines)


def _build_stakeholder_block(requirements: list) -> str:
    """Aggregate unique stakeholders from all source lists."""
    seen = {}
    for req in requirements:
        for src in req.get('sources', []):
            name = src.get('sender', '')
            if name and name not in seen:
                seen[name] = {
                    "role": src.get('role', 'Stakeholder'),
                    "channel": src.get('source', 'Unknown'),
                    "count": 0
                }
            if name:
                seen[name]['count'] += 1

    lines = [
        f"- {name}: {info['role']} (via {info['channel']}, {info['count']} contributions)"
        for name, info in sorted(seen.items(), key=lambda x: x[1]['count'], reverse=True)
    ]
    return "\n".join(lines[:15])


def _build_conflict_block(conflicts: list) -> str:
    lines = []
    for c in conflicts[:10]:
        lines.append(
            f"• [{c.get('conflict_type','?').upper()}] {c.get('topic', '')[:70]}\n"
            f"  {c.get('source_a',{}).get('sender','?')} vs {c.get('source_b',{}).get('sender','?')}\n"
            f"  Resolution: {c.get('recommendation','')}"
        )
    return "\n".join(lines)


def _generate_section_gemini(model, section: str, project_name: str,
                              req_block: str, stakeholder_block: str,
                              conflict_block: str) -> str:
    """Ask Gemini to write one BRD section."""
    context_for_section = {
        "Executive Summary": f"Write a 3-paragraph executive summary for the {project_name} project. Reference stakeholder names and the most corroborated requirements.",
        "Project Scope & Objectives": f"Write the Scope & Objectives section for {project_name}. Reference specific requirement IDs. State what is in-scope and what is out-of-scope.",
        "Stakeholder Analysis": f"Write the Stakeholder Analysis section for {project_name}. List every identified stakeholder with their role, communication channel, and area of influence.",
        "Functional Requirements": f"Write the Functional Requirements section. Number each requirement, cite its ID like [REQ-001], and attribute it to the stakeholder who raised it.",
        "Non-Functional Requirements": f"Write Non-Functional Requirements covering performance, security, scalability, usability, and compliance. Cite requirement IDs.",
        "Data & Security Compliance": f"Write the Data & Security Compliance section. Cover data privacy, access control, encryption standards, and audit requirements. Cite IDs.",
        "Timeline & Milestones": f"Write the Timeline & Milestones section for {project_name}. Extract all deadlines and milestones mentioned by stakeholders. Cite sources.",
        "Identified Risks & Conflicts": f"Write the Risks & Conflicts section. Describe each detected conflict, its type, the opposing stakeholders, and the recommended resolution.",
    }

    instruction = context_for_section.get(section, f"Write the '{section}' section for the BRD.")

    prompt = f"""You are a senior Business Analyst writing a formal Business Requirements Document for project: "{project_name}".

{instruction}

STAKEHOLDERS:
{stakeholder_block or "No stakeholder data."}

REQUIREMENTS:
{req_block or "No specific requirements for this section."}

CONFLICTS:
{conflict_block or "No conflicts."}

RULES:
- Reference requirement IDs like [REQ-001] inline where relevant
- Attribute insights to named stakeholders (e.g., "As stated by John Smith (Product Manager)...")
- Use formal, corporate prose
- Stay strictly within provided data — do NOT invent facts
- Be specific and detailed, not generic
- Write 2-4 paragraphs (or a numbered list for requirements sections)

Output ONLY the section text. No headers, no JSON, no markdown code blocks."""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"   ⚠️ Gemini failed for section '{section}': {e}")
        return _fallback_section(section, project_name, req_block)


def _fallback_section(section: str, project_name: str, req_block: str) -> str:
    """Simple fallback when Gemini is unavailable."""
    if not req_block:
        return f"No data available for {section}."
    lines = [line for line in req_block.split('\n') if line.startswith('[REQ')]
    return f"{section} for {project_name}:\n\n" + "\n".join(lines[:10])


def run_generator(requirements: list, conflicts: list, project_name: str,
                  gemini_key: str = None) -> dict:
    """
    Generate the full BRD.
    Args:
        requirements: canonical requirements from run_embeddings
        conflicts:    detected conflicts from detect_conflicts
        project_name: project display name
        gemini_key:   Gemini API key (falls back to env var)
    Returns:
        {"brd_sections": {section_name: prose_text}}
    """
    print(f"✍️  Stage 8: Generating BRD for '{project_name}'...")
    print(f"   → {len(requirements)} requirements, {len(conflicts)} conflicts")

    key = gemini_key or os.getenv("GEMINI_API_KEY") or "AIzaSyCFMQP-zGDhb78pDrOXfg_mS92Zb_JTb9I"
    gemini_model = None

    if genai and key:
        genai.configure(api_key=key)
        for model_name in ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash-latest", "gemini-1.5-flash"]:
            try:
                candidate = genai.GenerativeModel(model_name)
                candidate.generate_content("ping", generation_config={"max_output_tokens": 5})
                gemini_model = candidate
                print(f"   ✅ Gemini [{model_name}] active for BRD generation.")
                break
            except Exception as e:
                print(f"   ⚠️ [{model_name}] not available: {str(e)[:60]}")

    section_map = _group_requirements_by_section(requirements)
    stakeholder_block = _build_stakeholder_block(requirements)
    conflict_block = _build_conflict_block(conflicts)

    brd_sections = {}

    for section in BRD_SECTIONS:
        section_reqs = section_map.get(section, [])
        req_block = _build_req_block(section_reqs)

        if gemini_model:
            text = _generate_section_gemini(gemini_model, section, project_name,
                                            req_block, stakeholder_block, conflict_block)
        else:
            text = _fallback_section(section, project_name, req_block)

        brd_sections[section] = text
        print(f"   ✅ Section '{section}': {len(text)} chars")

    print(f"✅ Stage 8 Complete: BRD generated with {len(brd_sections)} sections.")
    return {"brd_sections": brd_sections}
