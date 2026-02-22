"""
BRDGen — Stage 3: Noise Filtering via BART Zero-Shot Classification
Input:  list of sentence dicts {text, sender, role, source, timestamp}
Output: filtered list with only hard_requirement / soft_requirement, adds 'label' and 'confidence'

Two modes:
  BART mode   — facebook/bart-large-mnli (~1.6GB download on first use, high accuracy)
  Heuristic   — keyword rules (instant, no download, used as fallback)
"""
import re

# ── Keyword Heuristic Classifier ─────────────────────────────────────────────

HARD_REQ_PATTERNS = [
    r'\b(must|shall|required|mandatory|need to|has to|will need|critical|essential|'
    r'non-negotiable|have to|needs to|requires|necessary)\b',
]

SOFT_REQ_PATTERNS = [
    r'\b(should|could|recommend|prefer|ideally|nice to have|would like|consider|'
    r'suggest|optional|may|might want|it would be good|best if)\b',
]

NOISE_PATTERNS = [
    r'^(hi|hello|thanks|thank you|dear|regards|best|cheers|noted|okay|ok|sure|yes|no)\W*$',
    r'^(see you|talk later|sent from|get outlook|forwarded message)',
]


def _heuristic_classify(text: str) -> tuple:
    """Returns (label, confidence) using keyword rules."""
    text_lower = text.lower()

    for p in NOISE_PATTERNS:
        if re.search(p, text_lower):
            return 'noise', 0.95

    for p in HARD_REQ_PATTERNS:
        if re.search(p, text_lower):
            return 'hard_requirement', 0.75

    for p in SOFT_REQ_PATTERNS:
        if re.search(p, text_lower):
            return 'soft_requirement', 0.68

    # Check length — very short sentences are usually noise
    if len(text.split()) < 5:
        return 'noise', 0.80

    # Default: treat as soft requirement (might still be useful)
    return 'soft_requirement', 0.55


# ── BART Classifier ───────────────────────────────────────────────────────────

_bart_pipeline = None  # Module-level cache


def _load_bart():
    global _bart_pipeline
    if _bart_pipeline is not None:
        return _bart_pipeline
    try:
        from transformers import pipeline as hf_pipeline
        print("   ⏳ Loading facebook/bart-large-mnli (first run only — ~1.6GB)...")
        _bart_pipeline = hf_pipeline(
            "zero-shot-classification",
            model="facebook/bart-large-mnli",
            device=-1  # CPU
        )
        print("   ✅ BART model loaded.")
        return _bart_pipeline
    except Exception as e:
        print(f"   ⚠️ BART load failed: {e}. Using heuristic fallback.")
        return None


def run_classifier(sentences: list, use_bart: bool = False) -> list:
    """
    Filter and classify sentences.
    Args:
        sentences: list of {text, sender, role, source, timestamp}
        use_bart:  if True, tries BART first (downloads model on first run)
    Returns:
        filtered list with 'label' and 'confidence' added — only requirements kept
    """
    print(f"🔬 Stage 3: Classifying {len(sentences)} sentences...")

    classifier_fn = None
    mode = "heuristic"

    if use_bart:
        bart = _load_bart()
        if bart:
            mode = "bart"
            LABELS = ["hard_requirement", "soft_requirement", "opinion", "noise"]

            def classifier_fn(text):
                try:
                    result = bart(text[:512], LABELS, multi_label=False)
                    return result['labels'][0], result['scores'][0]
                except Exception:
                    return _heuristic_classify(text)

    if classifier_fn is None:
        classifier_fn = _heuristic_classify

    kept = []
    for i, sentence in enumerate(sentences):
        text = sentence.get('text', '')
        if not text or not text.strip():
            continue

        label, confidence = classifier_fn(text)

        if label in ('hard_requirement', 'soft_requirement'):
            sentence['label'] = label
            sentence['confidence'] = round(confidence, 4)
            kept.append(sentence)

        if (i + 1) % 25 == 0:
            print(f"   ... classified {i+1}/{len(sentences)}")

    print(f"   ✅ Classifier [{mode}]: Kept {len(kept)} requirements from {len(sentences)} sentences.")
    return kept
