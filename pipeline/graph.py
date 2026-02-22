"""
BRDGen — Stage 7: NetworkX Provenance Graph Builder
Input:  canonical requirements list + conflicts list
Output: {nodes, links} dict (D3-compatible format)

Graph structure:
  SOURCE nodes  → "who said it" (stakeholder name, role, channel)
  REQ nodes     → canonical requirements (text, label, confidence)
  CONFLICT nodes → detected conflicts between requirements

Edges: SOURCE → REQ (with original quote), REQ → CONFLICT
This graph powers the full citation engine — from any BRD sentence to original source.
"""
import networkx as nx


def build_provenance_graph(requirements: list, conflicts: list) -> dict:
    """
    Build the provenance graph.
    Args:
        requirements: canonical requirements from run_embeddings
        conflicts: detected conflicts from detect_conflicts
    Returns:
        {"nodes": [...], "links": [...]} — D3-compatible + citation-traversable
    """
    print(f"🕸️  Stage 7: Building provenance graph ({len(requirements)} reqs, {len(conflicts)} conflicts)...")

    G = nx.DiGraph()

    # ── Source Nodes ──────────────────────────────────────────────────────────
    source_ids = {}  # sender → node_id

    for req in requirements:
        for src in req.get('sources', []):
            sender = src.get('sender', 'Unknown')
            if sender not in source_ids:
                src_node_id = f"SRC-{len(source_ids)+1:03d}"
                source_ids[sender] = src_node_id
                G.add_node(src_node_id, **{
                    "id": src_node_id,
                    "type": "source",
                    "label": sender,
                    "role": src.get('role', 'Stakeholder'),
                    "channel": src.get('source', 'Unknown'),
                    "group": 1
                })

    # ── Requirement Nodes ─────────────────────────────────────────────────────
    for req in requirements:
        req_id = req.get('id', f"REQ-{id(req)}")
        G.add_node(req_id, **{
            "id": req_id,
            "type": "requirement",
            "label": (req.get('canonical_text', '')[:80] + "...") if len(req.get('canonical_text', '')) > 80 else req.get('canonical_text', ''),
            "canonical_text": req.get('canonical_text', ''),
            "classification": req.get('label', 'requirement'),
            "priority": req.get('priority', 'Medium'),
            "confidence": req.get('confidence', 0.0),
            "corroboration_count": req.get('corroboration_count', 1),
            "topic": req.get('topic_label', 'General'),
            "group": 2
        })

        # ── Source → Requirement Edges ─────────────────────────────────────────
        for src in req.get('sources', []):
            sender = src.get('sender', 'Unknown')
            src_node_id = source_ids.get(sender)
            if src_node_id:
                G.add_edge(src_node_id, req_id, **{
                    "type": "contributes",
                    "sender": sender,
                    "role": src.get('role', 'Stakeholder'),
                    "timestamp": src.get('timestamp', 'unknown'),
                    "channel": src.get('source', 'Unknown'),
                    "original_quote": src.get('content', ''),
                    "value": req.get('confidence', 0.5)
                })

    # ── Conflict Nodes ────────────────────────────────────────────────────────
    for conflict in conflicts:
        c_id = conflict.get('id', f"CONF-{id(conflict)}")
        G.add_node(c_id, **{
            "id": c_id,
            "type": "conflict",
            "label": conflict.get('topic', 'Conflict')[:60],
            "conflict_type": conflict.get('conflict_type', 'scope'),
            "severity": conflict.get('severity', 'Medium'),
            "recommendation": conflict.get('recommendation', ''),
            "group": 3
        })

        # Connect conflict to both source stakeholder nodes
        for side in ('source_a', 'source_b'):
            sender = conflict.get(side, {}).get('sender', '')
            if sender and sender in source_ids:
                G.add_edge(source_ids[sender], c_id, type="conflicts_on")

    # ── Serialize to D3 format ────────────────────────────────────────────────
    nodes = [dict(G.nodes[n]) for n in G.nodes()]
    links = [{
        **dict(data),
        "source": u,
        "target": v
    } for u, v, data in G.edges(data=True)]

    print(f"   ✅ Graph: {len(nodes)} nodes, {len(links)} edges.")
    return {
        "nodes": nodes,
        "links": links,
        "stats": {
            "source_nodes": len(source_ids),
            "requirement_nodes": len(requirements),
            "conflict_nodes": len(conflicts),
            "total_edges": len(links)
        }
    }


def get_citation_trail(graph: dict, req_id: str) -> list:
    """
    Given a requirement ID, return all source edges (citation trail).
    Used by the citations page to show full provenance.
    """
    citations = []
    for link in graph.get('links', []):
        if link.get('target') == req_id and link.get('type') == 'contributes':
            citations.append({
                "sender": link.get('sender', 'Unknown'),
                "role": link.get('role', 'Stakeholder'),
                "channel": link.get('channel', 'Unknown'),
                "timestamp": link.get('timestamp', 'N/A'),
                "original_quote": link.get('original_quote', ''),
                "source_node_id": link.get('source', '')
            })
    return citations
