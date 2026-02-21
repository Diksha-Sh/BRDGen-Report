import subprocess
import os
import sys
import time

def run_stage(name, script, stage_idx):
    print(f"\n{'='*40}")
    print(f"🚀 STAGE {stage_idx}/9: {name}")
    print(f"{'='*40}")
    
    # 10% progress update to show it started
    subprocess.run([sys.executable, "pipeline/update_frontend.py", str(stage_idx), "10"])

    try:
        # Prepare cmd
        cmd = [sys.executable, script]
        if "brd_engine.py" in script:
            cmd.append(str(stage_idx))
            
        # Run the actual analyst script
        subprocess.run(cmd, check=True)
        
        # 100% complete for this stage
        subprocess.run([sys.executable, "pipeline/update_frontend.py", str(stage_idx), "100"])
        print(f"✅ {name} SUCCESS.")
        return True
    except Exception as e:
        print(f"❌ Error in {name}: {e}")
        return False

if __name__ == "__main__":
    # Ensure environment is ready
    os.makedirs('data/raw/emails', exist_ok=True)
    os.makedirs('data/raw/meetings', exist_ok=True)
    os.makedirs('data/raw/pdfs', exist_ok=True)
    os.makedirs('data/raw/slack', exist_ok=True)
    os.makedirs('data/parsed', exist_ok=True)

    # All 9 Specific Intelligence Stages
    stages = [
        ("Signal Ingestion", "pipeline/ingestion.py"),         # 1
        ("Linguistic Cleaning", "pipeline/cleaner.py"),        # 2
        ("Entity Resolution", "pipeline/entity_resolver.py"),   # 3
        ("Requirement Labeling", "pipeline/classifier.py"),    # 4
        ("Topic Clustering", "pipeline/topic_modeler.py"),     # 5
        ("Semantic Deduplication", "pipeline/semantic_analyzer.py"), # 6
        ("Conflict Detection", "pipeline/brd_engine.py"),      # 7
        ("Provenance Mapping", "pipeline/brd_engine.py"),      # 8
        ("Prose Generation", "pipeline/brd_engine.py"),        # 9
    ]
    
    for i, (name, script) in enumerate(stages):
        if not run_stage(name, script, i+1):
            print(f"\n❌ Pipeline Terminated at Stage {i+1}.")
            # Even if it fails, try to sync current state
            subprocess.run([sys.executable, "pipeline/update_frontend.py", str(i+1), "0"])
            sys.exit(1)
            
    # Final sync
    subprocess.run([sys.executable, "pipeline/update_frontend.py", "DONE", "100"])
    print("\n🎉 BRDGEN INTELLIGENCE SUITE FULLY SYNCHRONIZED.")
