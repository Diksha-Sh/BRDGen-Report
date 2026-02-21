import json
import os

def find_duplicates(sentences):
    print("🚀 Stage 6: High-Speed Semantic Deduplication (O(N) Logic)...")
    if not sentences: return []
    
    unique_requirements = []
    # Map normalized_hash -> index_in_unique_requirements
    hash_to_index = {}
    
    for s in sentences:
        # Create a simplified "fingerprint"
        normalized = "".join(filter(str.isalnum, s['text'].lower()))
        
        if normalized not in hash_to_index:
            s['corroboration_count'] = 1
            s['aliases'] = []
            hash_to_index[normalized] = len(unique_requirements)
            unique_requirements.append(s)
        else:
            idx = hash_to_index[normalized]
            unique_requirements[idx]['corroboration_count'] += 1
            if s['text'] not in unique_requirements[idx]['aliases'] and s['text'] != unique_requirements[idx]['text']:
                unique_requirements[idx]['aliases'].append(s['text'])
                    
    return unique_requirements

if __name__ == "__main__":
    input_path = 'data/parsed/embedded_sentences.json'
    if os.path.exists(input_path):
        with open(input_path, 'r', encoding='utf-8') as f:
            sentences = json.load(f)
            
        unique = find_duplicates(sentences)
        with open('data/parsed/unique_requirements.json', 'w', encoding='utf-8') as f:
            json.dump(unique, f, indent=2)
        print(f"✅ Deduplication complete: {len(unique)} unique requirements found.")
