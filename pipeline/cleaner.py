import json
import os
import re

def clean_and_split(signals):
    print("🚀 Stage 2: Linguistic Cleaning & Regex Splitting...")
    sentences = []
    
    for signal in signals:
        text = signal['body']
        # Clean boilerplate
        text = re.sub(r'-----Original Message-----.*', '', text, flags=re.DOTALL)
        text = re.sub(r'From:.*', '', text)
        text = re.sub(r'Sent:.*', '', text)
        text = re.sub(r'To:.*', '', text)
        text = re.sub(r'Subject:.*', '', text)
        
        # Split into sentences
        # Simple regex split on . ! ? followed by space or newline
        splits = re.split(r'(?<=[.!?])\s+', text)
        
        for s in splits:
            s = s.strip()
            if len(s) < 15: continue
            
            sentences.append({
                "text": s,
                "sender": signal['sender'],
                "timestamp": signal['timestamp'],
                "channel": signal['channel'],
                "source_id": signal['id']
            })
            
    return sentences

if __name__ == "__main__":
    if os.path.exists('data/parsed/all_signals.json'):
        with open('data/parsed/all_signals.json', 'r', encoding='utf-8') as f:
            signals = json.load(f)
        
        sentences = clean_and_split(signals)
        with open('data/parsed/all_sentences.json', 'w', encoding='utf-8') as f:
            json.dump(sentences, f, indent=2)
        print(f"Generated {len(sentences)} cleaned sentences.")
