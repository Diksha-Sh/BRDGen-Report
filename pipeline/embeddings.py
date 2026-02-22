"""
BRDGen — Stage 5: Semantic Deduplication via MiniLM + ChromaDB
Input:  list of classified+topic-tagged sentence dicts
Output: list of canonical requirements — each represents a unique requirement
        with all source mentions merged and stored

Process:
  1. Generate embeddings using sentence-transformers all-MiniLM-L6-v2
  2. Cosine similarity matrix — cluster sentences with similarity > 0.85
  3. Merge cluster → one canonical requirement (best phrasing = longest)
  4. Store in ChromaDB for persistent natural-language search
  5. Return list of canonical {id, canonical_text, label, priority, confidence, sources, corroboration_count}
"""
import os
import uuid

# Module-level cache
_embed_model = None


def _load_embed_model():
    global _embed_model
    if _embed_model is not None:
        return _embed_model
    try:
        from sentence_transformers import SentenceTransformer
        print("   ⏳ Loading all-MiniLM-L6-v2 embeddings model...")
        _embed_model = SentenceTransformer('all-MiniLM-L6-v2')
        print("   ✅ Embeddings model ready.")
        return _embed_model
    except Exception as e:
        print(f"   ⚠️ SentenceTransformer unavailable: {e}. Using heuristic dedup.")
        return None


def _priority_from_label_confidence(label: str, confidence: float) -> str:
    if label == 'hard_requirement' and confidence >= 0.80:
        return 'High'
    elif label == 'hard_requirement':
        return 'Medium'
    elif label == 'soft_requirement' and confidence >= 0.75:
        return 'Medium'
    return 'Low'


def _heuristic_dedup(sentences: list) -> list:
    """Simple text-overlap dedup when embeddings are unavailable."""
    seen_texts = {}
    canonical = []

    for s in sentences:
        text = s.get('text', '').strip().lower()
        # Simple: check if 60%+ words overlap with any existing canonical
        words = set(text.split())
        matched = None
        for cid, cwords in seen_texts.items():
            if len(words) == 0 or len(cwords) == 0:
                continue
            overlap = len(words & cwords) / max(len(words), len(cwords))
            if overlap > 0.60:
                matched = cid
                break

        if matched:
            # Add as additional source to existing canonical
            for c in canonical:
                if c['id'] == matched:
                    c['sources'].append({
                        "sender": s.get('sender', 'Unknown'),
                        "role": s.get('role', 'Stakeholder'),
                        "source": s.get('source', 'Document'),
                        "timestamp": s.get('timestamp', 'unknown'),
                        "content": s.get('text', '')
                    })
                    c['corroboration_count'] += 1
                    break
        else:
            req_id = f"REQ-{len(canonical)+1:03d}"
            seen_texts[req_id] = words
            canonical.append({
                "id": req_id,
                "canonical_text": s.get('text', ''),
                "label": s.get('label', 'soft_requirement'),
                "priority": _priority_from_label_confidence(s.get('label', ''), s.get('confidence', 0.6)),
                "confidence": round(s.get('confidence', 0.6), 4),
                "topic_id": s.get('topic_id', 0),
                "topic_label": s.get('topic_label', 'General'),
                "corroboration_count": 1,
                "sources": [{
                    "sender": s.get('sender', 'Unknown'),
                    "role": s.get('role', 'Stakeholder'),
                    "source": s.get('source', 'Document'),
                    "timestamp": s.get('timestamp', 'unknown'),
                    "content": s.get('text', '')
                }]
            })
    return canonical


def run_embeddings(classified_sentences: list, db_path: str = './data/chromadb/') -> list:
    """
    Deduplicate and canonicalize requirements using MiniLM embeddings.
    Args:
        classified_sentences: output from run_classifier (and run_topic_model)
        db_path: path for ChromaDB persistence
    Returns:
        list of canonical requirement dicts
    """
    if not classified_sentences:
        return []

    print(f"🔗 Stage 5: Deduplicating {len(classified_sentences)} requirements via embeddings...")

    model = _load_embed_model()

    if model is None:
        print("   → Using heuristic deduplication (no embeddings).")
        canonical = _heuristic_dedup(classified_sentences)
    else:
        import numpy as np
        from sklearn.metrics.pairwise import cosine_similarity

        texts = [s.get('text', '') for s in classified_sentences]
        print(f"   → Generating embeddings for {len(texts)} sentences...")
        embeddings = model.encode(texts, show_progress_bar=False)

        print("   → Computing cosine similarity matrix...")
        sim_matrix = cosine_similarity(embeddings)

        # Greedy clustering at 0.85 threshold
        visited = set()
        clusters = []

        for i in range(len(classified_sentences)):
            if i in visited:
                continue
            cluster = [i]
            visited.add(i)
            for j in range(i + 1, len(classified_sentences)):
                if j not in visited and sim_matrix[i][j] > 0.85:
                    cluster.append(j)
                    visited.add(j)
            clusters.append(cluster)

        # Merge each cluster → one canonical requirement
        canonical = []
        for cluster_indices in clusters:
            items = [classified_sentences[idx] for idx in cluster_indices]
            embs = [embeddings[idx] for idx in cluster_indices]

            # Best phrasing = longest text (most complete statement)
            best = max(items, key=lambda x: len(x.get('text', '')))

            sources = [{
                "sender": s.get('sender', 'Unknown'),
                "role": s.get('role', 'Stakeholder'),
                "source": s.get('source', 'Document'),
                "timestamp": s.get('timestamp', 'unknown'),
                "content": s.get('text', '')
            } for s in items]

            avg_conf = round(sum(s.get('confidence', 0.6) for s in items) / len(items), 4)
            label = best.get('label', 'soft_requirement')

            canonical.append({
                "id": f"REQ-{len(canonical)+1:03d}",
                "canonical_text": best.get('text', ''),
                "label": label,
                "priority": _priority_from_label_confidence(label, avg_conf),
                "confidence": avg_conf,
                "topic_id": best.get('topic_id', 0),
                "topic_label": best.get('topic_label', 'General'),
                "corroboration_count": len(items),
                "sources": sources,
                "embedding": np.mean(embs, axis=0).tolist()
            })

    print(f"   ✅ Dedup: {len(classified_sentences)} sentences → {len(canonical)} canonical requirements.")

    # Store in ChromaDB for persistent search
    try:
        import chromadb
        os.makedirs(db_path, exist_ok=True)
        client = chromadb.PersistentClient(path=db_path)
        collection = client.get_or_create_collection(name="requirements")

        # Clear previous run
        try:
            collection.delete(where={"source": {"$ne": "__nonexistent__"}})
        except Exception:
            pass

        ids = [r['id'] for r in canonical]
        docs = [r['canonical_text'] for r in canonical]
        metas = [{
            "label": r['label'],
            "priority": r['priority'],
            "corroboration": r['corroboration_count'],
            "topic": r['topic_label']
        } for r in canonical]

        if ids:
            emb_list = [r.get('embedding', [0.0] * 384) for r in canonical]
            collection.add(ids=ids, documents=docs, metadatas=metas, embeddings=emb_list)
            print(f"   ✅ ChromaDB: {len(ids)} requirements stored.")
    except Exception as e:
        print(f"   ⚠️ ChromaDB storage skipped: {e}")

    return canonical
