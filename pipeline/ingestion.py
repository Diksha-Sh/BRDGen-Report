import os
import json
import re
import xml.etree.ElementTree as ET
try:
    import mailparser
except ImportError:
    mailparser = None

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

def parse_emails(folder_path):
    print("🚀 Stage 1: Parsing Emails...")
    emails = []
    if not os.path.exists(folder_path): return []
    for filename in os.listdir(folder_path):
        if filename.endswith('.eml') or filename.endswith('.msg'):
            filepath = os.path.join(folder_path, filename)
            if mailparser:
                try:
                    mail = mailparser.parse_from_file(filepath)
                    emails.append({
                        "id": f"mail_{len(emails)}",
                        "sender": mail.from_[0][1] if mail.from_ else "Unknown",
                        "timestamp": mail.date.isoformat() if mail.date else "2023-11-20",
                        "body": mail.body,
                        "channel": "Corporate Email"
                    })
                except: pass
    return emails

def parse_xml_transcripts(folder_path):
    print("🚀 Stage 1: Parsing XML Transcripts...")
    transcripts = []
    if not os.path.exists(folder_path): return []
    for filename in os.listdir(folder_path):
        if filename.endswith('.xml'):
            filepath = os.path.join(folder_path, filename)
            try:
                tree = ET.parse(filepath)
                root = tree.getroot()
                for turn in root.findall('.//turn'):
                    transcripts.append({
                        "id": f"xml_{len(transcripts)}",
                        "sender": turn.get('speaker', 'Unknown'),
                        "timestamp": turn.get('time', '2023-11-20'),
                        "body": turn.text or "",
                        "channel": "Meeting Transcript"
                    })
            except: pass
    return transcripts

def parse_pdfs(folder_path):
    print("🚀 Stage 1: Parsing PDF Documents (Idea Logs/Briefs)...")
    docs = []
    if not os.path.exists(folder_path): return []
    if not PdfReader:
        print("pypdf not installed, skipping PDF parsing.")
        return []

    for filename in os.listdir(folder_path):
        if filename.endswith('.pdf'):
            filepath = os.path.join(folder_path, filename)
            try:
                reader = PdfReader(filepath)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                
                docs.append({
                    "id": f"pdf_{len(docs)}",
                    "sender": "Document Archive",
                    "timestamp": "2024-01-01",
                    "body": text,
                    "channel": "PDF Brief Case"
                })
            except Exception as e:
                print(f"Error parsing PDF {filename}: {e}")
    return docs

if __name__ == "__main__":
    emails = parse_emails('data/raw/emails')
    xmls = parse_xml_transcripts('data/raw/meetings')
    pdfs = parse_pdfs('data/raw/pdfs')
    
    all_signals = emails + xmls + pdfs
    os.makedirs('data/parsed', exist_ok=True)
    with open('data/parsed/all_signals.json', 'w', encoding='utf-8') as f:
        json.dump(all_signals, f, indent=2)
    
    print(f"Ingested {len(all_signals)} signals total (including {len(pdfs)} PDFs).")