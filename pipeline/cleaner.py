"""
BRDGen Cleaner — Layer 2 (Linguistic Cleaning & Sentence Splitting)
Input:  list of signal dicts {source, sender, role, timestamp, content}
Output: list of sentence dicts {text, sender, role, source, timestamp}
"""
import re


def _clean_text(text: str) -> str:
    """Strip email boilerplate, HTML tags, and excessive whitespace."""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Remove email headers/forwarding chains
    text = re.sub(r'-----+\s*Original Message\s*-----+.*', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'^(From|Sent|To|Subject|Cc|Bcc|Date):\s*.*$', '', text, flags=re.MULTILINE | re.IGNORECASE)
    text = re.sub(r'^>.*$', '', text, flags=re.MULTILINE)  # Quoted replies
    # Remove URLs
    text = re.sub(r'https?://\S+', '', text)
    # Remove excessive whitespace / blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]{2,}', ' ', text)
    return text.strip()


def _split_sentences(text: str) -> list:
    """Split text into sentences using regex."""
    # Split on sentence-ending punctuation followed by whitespace/newline
    parts = re.split(r'(?<=[.!?])\s+|\n{2,}', text)
    return [s.strip() for s in parts if s.strip()]


def clean_and_split(signals: list) -> list:
    """Main cleaner: clean each signal and split into sentence-level units."""
    print(f"🧹 Stage 2: Cleaning & splitting {len(signals)} signals...")
    sentences = []

    for signal in signals:
        # FIXED: parser outputs 'content', not 'body'
        raw_text = signal.get('content') or signal.get('body') or signal.get('text') or ''
        
        if not raw_text or not str(raw_text).strip():
            continue

        cleaned = _clean_text(str(raw_text))
        parts = _split_sentences(cleaned)

        for sentence in parts:
            # Filter out noise: too short, just numbers, boilerplate phrases
            if len(sentence) < 15:
                continue
            if re.fullmatch(r'[\d\s\W]+', sentence):
                continue
            boilerplate_patterns = [
                r'^(thanks|regards|best|cheers|sincerely|hi|hello|dear|hey)\b',
                r'^(sent from|get outlook)',
                r'^\s*(yes|no|ok|okay|sure|noted)\s*[.!]?\s*$'
            ]
            if any(re.match(p, sentence.lower()) for p in boilerplate_patterns):
                continue

            sentences.append({
                "text": sentence,
                "sender": signal.get('sender', 'Unknown'),
                "role": signal.get('role', 'Stakeholder'),
                "source": signal.get('source', 'Unknown'),
                "timestamp": signal.get('timestamp', 'unknown')
            })

    print(f"✅ Cleaner: {len(sentences)} clean sentences extracted from {len(signals)} signals.")
    return sentences
