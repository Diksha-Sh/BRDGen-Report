"""
BRDGen Parser — Layer 1 (Signal Ingestion)
Handles: PDF, TXT, DOCX, EML, MSG (email), XML (meeting transcripts), JSON (Slack)
All outputs unified schema: {source, sender, role, timestamp, content}
"""
import os
import json
import re
import xml.etree.ElementTree as ET

# Optional imports — degrade gracefully if not installed
try:
    import mailparser
except ImportError:
    mailparser = None

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

try:
    from docx import Document as DocxDocument
except ImportError:
    DocxDocument = None


def _extract_text_from_file(filepath: str) -> str:
    """Universal text extractor — handles PDF, DOCX, TXT."""
    ext = os.path.splitext(filepath)[1].lower()
    
    if ext == '.pdf':
        if pdfplumber:
            try:
                with pdfplumber.open(filepath) as pdf:
                    return '\n'.join(p.extract_text() or '' for p in pdf.pages)
            except Exception as e:
                print(f"   PDF read error ({filepath}): {e}")
                return ''
        else:
            # Fallback: raw byte read
            try:
                with open(filepath, 'rb') as f:
                    raw = f.read().decode('latin-1', errors='ignore')
                    # crude extraction: grab readable text between stream/endstream
                    return re.sub(r'[^\x20-\x7E\n]', ' ', raw)
            except:
                return ''
    
    elif ext == '.docx':
        if DocxDocument:
            try:
                doc = DocxDocument(filepath)
                return '\n'.join(p.text for p in doc.paragraphs if p.text.strip())
            except Exception as e:
                print(f"   DOCX read error ({filepath}): {e}")
                return ''
        else:
            return ''
    
    else:
        # Plain text / markdown / csv fallback
        for enc in ('utf-8', 'latin-1', 'cp1252'):
            try:
                with open(filepath, 'r', encoding=enc) as f:
                    return f.read()
            except:
                continue
        return ''


def _infer_sender_from_filename(filename: str) -> str:
    """Tries to guess a sender name from the filename."""
    name = os.path.splitext(filename)[0]
    name = re.sub(r'[_\-\.]+', ' ', name).strip()
    return name.title() if name else 'Document Author'


def parse_emails(folder_path: str) -> list:
    """Parse .eml, .msg, and fallback .txt email files."""
    signals = []
    if not os.path.exists(folder_path):
        return []
    
    for filename in os.listdir(folder_path):
        filepath = os.path.join(folder_path, filename)
        ext = os.path.splitext(filename)[1].lower()
        
        if ext in ('.eml', '.msg') and mailparser:
            try:
                mail = mailparser.parse_from_file(filepath)
                content = mail.body or mail.text_plain or ''
                if isinstance(content, list):
                    content = ' '.join(content)
                signals.append({
                    "source": "Email",
                    "sender": mail.from_[0][1] if mail.from_ else _infer_sender_from_filename(filename),
                    "role": "Stakeholder",
                    "timestamp": mail.date.isoformat() if mail.date else "unknown",
                    "content": str(content)
                })
            except Exception as e:
                print(f"   Email parse error ({filename}): {e}")
        
        elif ext in ('.pdf', '.docx', '.txt', '.md'):
            # Generic document treated as email-channel signal
            text = _extract_text_from_file(filepath)
            if text.strip():
                signals.append({
                    "source": "Email",
                    "sender": _infer_sender_from_filename(filename),
                    "role": "Document Author",
                    "timestamp": "unknown",
                    "content": text
                })
    
    return signals


def parse_meeting_transcripts(folder_path: str) -> list:
    """Parse .xml (AMI), .txt, .pdf meeting transcripts."""
    signals = []
    if not os.path.exists(folder_path):
        return []
    
    for filename in os.listdir(folder_path):
        filepath = os.path.join(folder_path, filename)
        ext = os.path.splitext(filename)[1].lower()
        
        if ext == '.xml':
            try:
                tree = ET.parse(filepath)
                root = tree.getroot()
                # AMI format: <turn speaker="..." time="...">text</turn>
                for turn in root.findall('.//turn'):
                    text = turn.text or ''
                    if text.strip():
                        signals.append({
                            "source": "Meeting",
                            "sender": turn.get('speaker', 'Participant'),
                            "role": "Meeting Participant",
                            "timestamp": turn.get('time', 'unknown'),
                            "content": text.strip()
                        })
                # Generic: any tag with text content if no turns found
                if not signals:
                    for elem in root.iter():
                        if elem.text and elem.text.strip() and len(elem.text.strip()) > 20:
                            signals.append({
                                "source": "Meeting",
                                "sender": elem.get('speaker', elem.get('name', 'Participant')),
                                "role": "Meeting Participant",
                                "timestamp": elem.get('time', 'unknown'),
                                "content": elem.text.strip()
                            })
            except Exception as e:
                print(f"   Meeting XML parse error ({filename}): {e}")
        
        elif ext in ('.pdf', '.docx', '.txt', '.md'):
            text = _extract_text_from_file(filepath)
            if not text.strip():
                continue
            # Try to split by speaker patterns like "SPEAKER: text" or "Name: text"
            turns = re.split(r'\n(?=[A-Z][A-Za-z ]+:)', text)
            if len(turns) > 2:
                for turn in turns:
                    match = re.match(r'^([A-Z][A-Za-z ]+):\s*(.*)', turn.strip(), re.DOTALL)
                    if match and len(match.group(2).strip()) > 10:
                        signals.append({
                            "source": "Meeting",
                            "sender": match.group(1).strip(),
                            "role": "Meeting Participant",
                            "timestamp": "unknown",
                            "content": match.group(2).strip()
                        })
            else:
                signals.append({
                    "source": "Meeting",
                    "sender": _infer_sender_from_filename(filename),
                    "role": "Meeting Transcript",
                    "timestamp": "unknown",
                    "content": text
                })
    
    return signals


def parse_slack_json(folder_path: str) -> list:
    """Parse Slack JSON exports."""
    signals = []
    if not os.path.exists(folder_path):
        return []
    
    for filename in os.listdir(folder_path):
        filepath = os.path.join(folder_path, filename)
        ext = os.path.splitext(filename)[1].lower()
        
        if ext == '.json':
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    messages = data if isinstance(data, list) else [data]
                    for msg in messages:
                        content = msg.get('content', msg.get('text', msg.get('message', '')))
                        if not content or not str(content).strip():
                            continue
                        signals.append({
                            "source": "Slack",
                            "sender": msg.get('sender', msg.get('user', msg.get('username', 'Team Member'))),
                            "role": msg.get('role', 'Team Member'),
                            "timestamp": msg.get('timestamp', msg.get('ts', 'unknown')),
                            "content": str(content)
                        })
            except Exception as e:
                print(f"   Slack JSON parse error ({filename}): {e}")
        
        elif ext in ('.txt', '.md'):
            text = _extract_text_from_file(filepath)
            if text.strip():
                signals.append({
                    "source": "Slack",
                    "sender": _infer_sender_from_filename(filename),
                    "role": "Team Member",
                    "timestamp": "unknown",
                    "content": text
                })
    
    return signals


def run_parser(email_dir: str, meeting_dir: str, slack_dir: str) -> list:
    """Entry point: runs all 3 parsers and returns combined signals list."""
    all_signals = []
    
    emails = parse_emails(email_dir)
    meetings = parse_meeting_transcripts(meeting_dir)
    slack = parse_slack_json(slack_dir)
    
    all_signals.extend(emails)
    all_signals.extend(meetings)
    all_signals.extend(slack)
    
    print(f"✅ Parser Complete: {len(emails)} email signals, {len(meetings)} meeting signals, {len(slack)} slack signals → {len(all_signals)} total")
    
    if not all_signals:
        print("⚠️  WARNING: No signals parsed from uploaded files. Check file formats.")
    
    return all_signals
