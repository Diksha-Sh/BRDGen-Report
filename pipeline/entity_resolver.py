import json
import os
try:
    from rapidfuzz import process, fuzz
except ImportError:
    process = None
    import difflib

def resolve_entities(sentences):
    print("🚀 Stage 3: Entity Resolution via rapidfuzz...")
    if not sentences:
        return [], {}
    unique_names = list(set(s.get('sender', 'Unknown') for s in sentences if s.get('sender')))
    canonical_map = {}
    
    # Simple cluster
    for name in unique_names:
        if name in canonical_map: continue
        
        if process:
            matches = process.extract(name, unique_names, scorer=fuzz.WRatio, score_cutoff=85)
            # Take the longest name as canonical
            cluster = [m[0] for m in matches]
        else:
            matches = difflib.get_close_matches(name, unique_names, n=10, cutoff=0.8)
            cluster = matches
            
        canonical = max(cluster, key=len)
        for c in cluster:
            canonical_map[c] = canonical
            
    # Apply resolution
    for s in sentences:
        s['sender_canonical'] = canonical_map.get(s['sender'], s['sender'])
        
    return sentences, canonical_map

if __name__ == "__main__":
    if os.path.exists('data/parsed/all_sentences.json'):
        with open('data/parsed/all_sentences.json', 'r', encoding='utf-8') as f:
            sentences = json.load(f)
            
        resolved, identity_table = resolve_entities(sentences)
        with open('data/parsed/resolved_sentences.json', 'w', encoding='utf-8') as f:
            json.dump(resolved, f, indent=2)
        with open('data/parsed/identity_table.json', 'w', encoding='utf-8') as f:
            json.dump(identity_table, f, indent=2)
        print("Entity resolution complete.")