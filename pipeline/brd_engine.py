import json
import os
import re
import sys
from collections import defaultdict

def detect_conflicts(requirements):
    print("🚀 Stage 7: High-Speed Conflict Audit (O(N) Parameter Scan)...")
    conflicts = []
    
    # Map (topic_id, label, parameter_value) -> first_requirement_with_this_param
    # If we see a different parameter_value for the same (topic, label), it's a conflict
    param_map = {}
    
    for r in requirements:
        topic = r.get('topic_id')
        label = r.get('label')
        nums = re.findall(r'\d+', r['text'])
        
        if not nums: continue
        val = nums[0]
        
        # Key is just topic and label
        key = (topic, label)
        
        if key not in param_map:
            param_map[key] = (val, r)
        else:
            prev_val, prev_r = param_map[key]
            if prev_val != val:
                # Potential conflict found
                conflict_id = f"CF-{len(conflicts)+1:03}"
                conflicts.append({
                    "id": conflict_id,
                    "title": f"Parameter Contradiction: {label}",
                    "type": "Numerical",
                    "owner": r.get('sender_canonical', 'Stakeholder'),
                    "recommendation": f"Verify discrepant values ({prev_val} vs {val}) across communication channels.",
                    "sourceA": { "author": prev_r.get('sender_canonical', 'Stakeholder'), "text": prev_r['text'], "date": prev_r.get('timestamp', 'N/A'), "channel": prev_r.get('channel', 'N/A') },
                    "sourceB": { "author": r.get('sender_canonical', 'Stakeholder'), "text": r['text'], "date": r.get('timestamp', 'N/A'), "channel": r.get('channel', 'N/A') }
                })
                # Once a conflict is found for a topic/label, we might stop or continue
                # We overwrite the map to detect the NEXT discrepancy or just keep the first
                if len(conflicts) > 20: break 
                
    return conflicts

def perform_provenance_mapping(requirements):
    print("🚀 Stage 8: High-Speed Provenance Attribution...")
    for r in requirements:
        r['corroboration_count'] = 1 + len(r.get('aliases', []))
    return requirements

def generate_brd_prose(requirements):
    print("🚀 Stage 9: Final BRD Prose Synthesis (O(N) Template Mode)...")
    sections = [
        {
            "id": "sec-exec",
            "title": "Executive Summary",
            "description": f"This document synthesizes corporate intelligence from {len(requirements)} unique requirements. Analysis cross-references multi-channel signal streams."
        }
    ]
    
    mapping = {
        "Functional Requirement": "Functional Intelligence Matrix",
        "Constraint": "Design & Technical Constraints",
        "Timeline": "Strategic Roadmap",
        "Security": "Security Protocols",
        "UI/UX": "Interface & Experience"
    }
    
    for label, title in mapping.items():
        items = [r for r in requirements if r['label'] == label]
        if items:
            sections.append({
                "id": f"sec-{label.lower().replace(' ', '-')}",
                "title": title,
                "description": f"Consolidated {label} items.",
                "items": items[:25]
            })
            
    return {"sections": sections}

if __name__ == "__main__":
    req_path = 'data/parsed/unique_requirements.json'
    if not os.path.exists(req_path):
        print("❌ Engine Phase Aborted: No requirements found.")
        sys.exit(0)

    with open(req_path, 'r', encoding='utf-8') as f:
        reqs = json.load(f)

    stage = sys.argv[1] if len(sys.argv) > 1 else "ALL"

    if stage in ["7", "ALL"]:
        conflicts = detect_conflicts(reqs)
        with open('data/parsed/conflicts.json', 'w', encoding='utf-8') as f:
            json.dump(conflicts, f, indent=2)

    if stage in ["8", "ALL"]:
        reqs = perform_provenance_mapping(reqs)
        with open('data/parsed/unique_requirements.json', 'w', encoding='utf-8') as f:
            json.dump(reqs, f, indent=2)

    if stage in ["9", "ALL"]:
        brd = generate_brd_prose(reqs)
        with open('data/parsed/brd_v1.json', 'w', encoding='utf-8') as f:
            json.dump(brd, f, indent=2)
            
    print(f"✅ BRD Engine Phase {stage} Complete.")
