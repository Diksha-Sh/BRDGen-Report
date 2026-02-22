"""
BRDGen — Stage 6: Conflict Detection (4 Types)
Input:  list of canonical requirement dicts from embeddings stage
Output: list of conflict objects

Detects:
  1. Numerical  — same topic, different numbers (e.g. "3 seconds" vs "5 seconds")
  2. Scope      — include vs exclude keywords in same requirement cluster
  3. Authority  — CEO/CTO contradicts developer/junior on same requirement
  4. Timeline   — different dates/quarters for same deadline
"""
import re

# Authority hierarchy — higher index = higher authority
AUTHORITY_HIERARCHY = [
    'developer', 'engineer', 'analyst', 'qa', 'tester',
    'lead', 'senior', 'tech lead',
    'manager', 'project manager', 'product manager',
    'director', 'vp', 'vice president',
    'cto', 'coo', 'cfo', 'cso',
    'ceo', 'founder', 'owner', 'executive',
    'board', 'investor', 'client', 'customer'
]


def _authority_level(role: str) -> int:
    """Returns authority level (higher = more authority)."""
    role_lower = (role or '').lower()
    for idx, title in enumerate(AUTHORITY_HIERARCHY):
        if title in role_lower:
            return idx
    return 0


def _extract_numbers(text: str) -> list:
    return re.findall(r'\b\d+(?:\.\d+)?\b', text)


def _extract_dates(text: str) -> list:
    patterns = [
        r'\b(Q[1-4]\s*(?:20\d{2})?)',
        r'\b(January|February|March|April|May|June|July|August|September|October|November|December)\s*\d{4}',
        r'\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*\d{4}',
        r'\b(20\d{2})\b',
        r'\b(H[12]\s*20\d{2})',
    ]
    dates = []
    for p in patterns:
        dates.extend(re.findall(p, text, re.IGNORECASE))
    return [str(d).strip() for d in dates if d]


SCOPE_INCLUDE = ['include', 'must have', 'shall have', 'required', 'need to', 'will have']
SCOPE_EXCLUDE = ['exclude', 'not include', "don't include", 'remove', 'omit', 'out of scope', 'won\'t have']


def detect_conflicts(canonical_requirements: list) -> list:
    """
    Detect conflicts in canonical requirements.
    Args:
        canonical_requirements: list from run_embeddings
    Returns:
        list of conflict dicts with full source attribution
    """
    print(f"⚔️  Stage 6: Conflict detection across {len(canonical_requirements)} requirements...")

    conflicts = []
    conflict_id = 0

    for req in canonical_requirements:
        sources = req.get('sources', [])
        if len(sources) < 2:
            continue  # Need at least 2 sources to have a conflict

        req_text = req.get('canonical_text', '')

        # ── 1. Numerical Conflict ─────────────────────────────────────────────
        nums_by_source = []
        for src in sources:
            nums = _extract_numbers(src.get('content', ''))
            if nums:
                nums_by_source.append((src, nums[0]))

        unique_nums = set(v for _, v in nums_by_source)
        if len(unique_nums) > 1:
            s1, v1 = nums_by_source[0]
            s2, v2 = next((s, v) for s, v in nums_by_source if v != v1)
            conflict_id += 1
            conflicts.append({
                "id": f"C-{conflict_id:03d}",
                "topic": req_text[:80],
                "conflict_type": "numerical",
                "severity": "High",
                "recommendation": (
                    f"Numerical discrepancy: {s1.get('sender','?')} states {v1} while "
                    f"{s2.get('sender','?')} states {v2}. "
                    f"Defer to higher-authority stakeholder or request measurement clarification."
                ),
                "source_a": {
                    "sender": s1.get('sender', 'Stakeholder A'),
                    "role": s1.get('role', 'Stakeholder'),
                    "source": s1.get('source', 'Unknown'),
                    "timestamp": s1.get('timestamp', 'N/A'),
                    "content": s1.get('content', ''),
                    "value": v1
                },
                "source_b": {
                    "sender": s2.get('sender', 'Stakeholder B'),
                    "role": s2.get('role', 'Stakeholder'),
                    "source": s2.get('source', 'Unknown'),
                    "timestamp": s2.get('timestamp', 'N/A'),
                    "content": s2.get('content', ''),
                    "value": v2
                }
            })

        # ── 2. Scope Conflict ─────────────────────────────────────────────────
        include_srcs = [s for s in sources if any(kw in s.get('content','').lower() for kw in SCOPE_INCLUDE)]
        exclude_srcs = [s for s in sources if any(kw in s.get('content','').lower() for kw in SCOPE_EXCLUDE)]

        if include_srcs and exclude_srcs:
            s1, s2 = include_srcs[0], exclude_srcs[0]
            if s1.get('sender') != s2.get('sender'):
                conflict_id += 1
                conflicts.append({
                    "id": f"C-{conflict_id:03d}",
                    "topic": req_text[:80],
                    "conflict_type": "scope",
                    "severity": "High",
                    "recommendation": (
                        f"Scope dispute between {s1.get('sender','?')} (includes) and "
                        f"{s2.get('sender','?')} (excludes). "
                        f"Escalate to Project Manager for decision. Check authority level."
                    ),
                    "source_a": {
                        "sender": s1.get('sender', 'Stakeholder A'),
                        "role": s1.get('role', 'Stakeholder'),
                        "source": s1.get('source', 'Unknown'),
                        "timestamp": s1.get('timestamp', 'N/A'),
                        "content": s1.get('content', '')
                    },
                    "source_b": {
                        "sender": s2.get('sender', 'Stakeholder B'),
                        "role": s2.get('role', 'Stakeholder'),
                        "source": s2.get('source', 'Unknown'),
                        "timestamp": s2.get('timestamp', 'N/A'),
                        "content": s2.get('content', '')
                    }
                })

        # ── 3. Authority Conflict ─────────────────────────────────────────────
        if len(sources) >= 2:
            authority_pairs = [(s, _authority_level(s.get('role', ''))) for s in sources]
            authority_pairs.sort(key=lambda x: x[1], reverse=True)
            high_auth = authority_pairs[0]
            low_auth = authority_pairs[-1]

            if (high_auth[1] - low_auth[1] >= 3 and  # Meaningful authority gap
                    high_auth[0].get('sender') != low_auth[0].get('sender')):

                # Check if they actually say different things (content differs meaningfully)
                text_a = high_auth[0].get('content', '').lower()
                text_b = low_auth[0].get('content', '').lower()
                words_a = set(text_a.split())
                words_b = set(text_b.split())
                overlap = len(words_a & words_b) / max(len(words_a), len(words_b), 1)

                if overlap < 0.6:  # Sufficiently different
                    conflict_id += 1
                    conflicts.append({
                        "id": f"C-{conflict_id:03d}",
                        "topic": req_text[:80],
                        "conflict_type": "authority",
                        "severity": "Medium",
                        "recommendation": (
                            f"Authority conflict: {high_auth[0].get('sender','?')} "
                            f"({high_auth[0].get('role','?')}) and "
                            f"{low_auth[0].get('sender','?')} ({low_auth[0].get('role','?')}) "
                            f"have differing inputs. Defer to {high_auth[0].get('sender','?')} per authority."
                        ),
                        "source_a": {
                            "sender": high_auth[0].get('sender', 'Authority A'),
                            "role": high_auth[0].get('role', 'Senior'),
                            "source": high_auth[0].get('source', 'Unknown'),
                            "timestamp": high_auth[0].get('timestamp', 'N/A'),
                            "content": high_auth[0].get('content', '')
                        },
                        "source_b": {
                            "sender": low_auth[0].get('sender', 'Authority B'),
                            "role": low_auth[0].get('role', 'Junior'),
                            "source": low_auth[0].get('source', 'Unknown'),
                            "timestamp": low_auth[0].get('timestamp', 'N/A'),
                            "content": low_auth[0].get('content', '')
                        }
                    })

        # ── 4. Timeline Conflict ──────────────────────────────────────────────
        dates_by_source = []
        for src in sources:
            dates = _extract_dates(src.get('content', ''))
            if dates:
                dates_by_source.append((src, dates[0]))

        unique_dates = set(d for _, d in dates_by_source)
        if len(unique_dates) > 1:
            s1, d1 = dates_by_source[0]
            s2, d2 = next((s, d) for s, d in dates_by_source if d != d1)
            conflict_id += 1
            conflicts.append({
                "id": f"C-{conflict_id:03d}",
                "topic": req_text[:80],
                "conflict_type": "timeline",
                "severity": "Medium",
                "recommendation": (
                    f"Timeline conflict: {s1.get('sender','?')} references {d1} while "
                    f"{s2.get('sender','?')} references {d2}. "
                    f"Align on single milestone date. Prefer most recent communication."
                ),
                "source_a": {
                    "sender": s1.get('sender', 'Stakeholder A'),
                    "role": s1.get('role', 'Stakeholder'),
                    "source": s1.get('source', 'Unknown'),
                    "timestamp": s1.get('timestamp', 'N/A'),
                    "content": s1.get('content', ''),
                    "date_mentioned": d1
                },
                "source_b": {
                    "sender": s2.get('sender', 'Stakeholder B'),
                    "role": s2.get('role', 'Stakeholder'),
                    "source": s2.get('source', 'Unknown'),
                    "timestamp": s2.get('timestamp', 'N/A'),
                    "content": s2.get('content', ''),
                    "date_mentioned": d2
                }
            })

    print(f"   ✅ Conflict detection: {len(conflicts)} conflicts found.")
    return conflicts
