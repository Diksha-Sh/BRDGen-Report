"""
BRDGen — Stage 4: Topic Boundary Detection via BERTopic
Input:  list of classified sentence dicts
Output: same list with 'topic_id' and 'topic_label' added

Prevents requirements from different product areas being merged together.
Falls back to keyword-based topic assignment if BERTopic unavailable.
"""


# ── BERTopic Topic Modeler ────────────────────────────────────────────────────

_topic_model = None  # Module-level cache


def _load_bertopic():
    global _topic_model
    if _topic_model is not None:
        return _topic_model
    try:
        from bertopic import BERTopic
        _topic_model = BERTopic(
            language="english",
            min_topic_size=2,
            verbose=False
        )
        print("   ✅ BERTopic model initialized.")
        return _topic_model
    except Exception as e:
        print(f"   ⚠️ BERTopic unavailable: {e}. Using keyword fallback.")
        return None


# ── Keyword-Based Topic Fallback ──────────────────────────────────────────────

TOPIC_KEYWORDS = {
    "Authentication & Security":    ["login", "auth", "password", "security", "token", "oauth", "sso", "2fa", "encrypt"],
    "Performance & Scalability":    ["performance", "latency", "scale", "throughput", "response time", "uptime", "load"],
    "User Interface & UX":          ["ui", "ux", "design", "interface", "layout", "responsive", "mobile", "dashboard"],
    "Data & Storage":               ["database", "data", "storage", "backup", "schema", "migration", "sql", "nosql"],
    "Payments & Finance":           ["payment", "billing", "invoice", "checkout", "stripe", "refund", "price", "cost"],
    "API & Integration":            ["api", "integration", "webhook", "endpoint", "rest", "graphql", "third-party"],
    "Notifications & Messaging":    ["notification", "email", "sms", "alert", "message", "push", "slack"],
    "Timeline & Milestones":        ["deadline", "launch", "milestone", "q1", "q2", "q3", "q4", "sprint", "release"],
    "Compliance & Legal":           ["gdpr", "compliance", "regulation", "legal", "audit", "privacy", "policy"],
}


def _keyword_topic(text: str) -> tuple:
    """Assigns topic by keyword matching. Returns (topic_id, topic_label)."""
    text_lower = text.lower()
    for idx, (label, keywords) in enumerate(TOPIC_KEYWORDS.items()):
        if any(kw in text_lower for kw in keywords):
            return idx, label
    return len(TOPIC_KEYWORDS), "General Requirements"


def run_topic_model(classified_sentences: list, use_bertopic: bool = True) -> list:
    """
    Assign topic IDs to sentences.
    Args:
        classified_sentences: list from classifier output
        use_bertopic: attempt BERTopic (requires package + sentence-transformers)
    Returns:
        same list with 'topic_id' and 'topic_label' added
    """
    if not classified_sentences:
        return []

    print(f"🗂️  Stage 4: Topic modeling {len(classified_sentences)} requirements...")

    if use_bertopic:
        model = _load_bertopic()
        if model:
            try:
                texts = [s.get('text', '') for s in classified_sentences]
                topics, _ = model.fit_transform(texts)
                topic_info = model.get_topic_info()

                for sentence, topic_id in zip(classified_sentences, topics):
                    sentence['topic_id'] = int(topic_id)
                    # Get human-readable label from top words
                    if topic_id >= 0:
                        try:
                            words = model.get_topic(topic_id)
                            label = " / ".join([w for w, _ in words[:3]]) if words else f"Topic {topic_id}"
                        except Exception:
                            label = f"Topic {topic_id}"
                    else:
                        label = "Outlier"
                    sentence['topic_label'] = label

                print(f"   ✅ BERTopic: Discovered {len(set(topics))} topics.")
                return classified_sentences
            except Exception as e:
                print(f"   ⚠️ BERTopic fit failed: {e}. Using keyword fallback.")

    # Keyword fallback
    for sentence in classified_sentences:
        tid, tlabel = _keyword_topic(sentence.get('text', ''))
        sentence['topic_id'] = tid
        sentence['topic_label'] = tlabel

    unique_topics = set(s['topic_id'] for s in classified_sentences)
    print(f"   ✅ Keyword topic model: {len(unique_topics)} topics assigned.")
    return classified_sentences
