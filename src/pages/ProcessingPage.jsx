import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Loader2, AlertTriangle, Zap, Database, GitBranch, Brain, Shield, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:8000';

const PIPELINE_STAGES = [
    { id: 1, name: 'Signal Ingestion', desc: 'Parsing EML / XML / JSON / PDF files', icon: Database, duration: 1200 },
    { id: 2, name: 'Linguistic Cleaning', desc: 'Noise removal & sentence extraction', icon: Zap, duration: 1000 },
    { id: 3, name: 'Requirement Filtering', desc: 'Classifying hard & soft requirements', icon: Shield, duration: 2000 },
    { id: 4, name: 'Semantic Clustering', desc: 'MiniLM deduplication → canonical reqs', icon: GitBranch, duration: 1800 },
    { id: 5, name: 'Conflict Detection', desc: 'Numerical / scope / authority / timeline', icon: AlertTriangle, duration: 1000 },
    { id: 6, name: 'Provenance Graph', desc: 'Building citation traceability graph', icon: GitBranch, duration: 800 },
    { id: 7, name: 'BRD Synthesis', desc: 'Gemini generating professional prose', icon: Brain, duration: 4000 },
    { id: 8, name: 'Intelligence Ready', desc: 'Pipeline complete — loading Intelligence Center', icon: Sparkles, duration: 500 },
];

const StageIcon = ({ icon: Icon, status }) => {
    if (status === 'complete') return <CheckCircle2 className="w-5 h-5 text-accent" />;
    if (status === 'active') return <Loader2 className="w-5 h-5 text-accent animate-spin" />;
    if (status === 'error') return <AlertTriangle className="w-5 h-5 text-red-400" />;
    return <Icon className="w-5 h-5 text-slate-600" />;
};

const ProcessingPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const projectName = state?.projectName || 'Your Project';
    const files = state?.files || {};

    const [stages, setStages] = useState(
        PIPELINE_STAGES.map(s => ({ ...s, status: 'pending' }))
    );
    const [currentLog, setCurrentLog] = useState('Initializing pipeline...');
    const [error, setError] = useState(null);
    const [done, setDone] = useState(false);
    const ran = useRef(false);

    const logs = useRef([]);
    const addLog = (msg) => {
        logs.current.push(msg);
        setCurrentLog(msg);
    };

    // Advance the animated stage display
    const activateStage = (idx) =>
        setStages(prev => prev.map((s, i) => ({
            ...s,
            status: i < idx ? 'complete' : i === idx ? 'active' : 'pending'
        })));

    const completeStage = (idx) =>
        setStages(prev => prev.map((s, i) => ({
            ...s,
            status: i <= idx ? 'complete' : 'pending'
        })));

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    useEffect(() => {
        if (ran.current) return;
        ran.current = true;

        const run = async () => {
            try {
                // Stage 1 — file ingestion animation
                activateStage(0);
                addLog('Parsing uploaded documents...');
                await sleep(PIPELINE_STAGES[0].duration);
                completeStage(0);

                // Stage 2 — cleaning animation (while API call is building up)
                activateStage(1);
                addLog('Stripping noise, splitting sentences...');
                await sleep(PIPELINE_STAGES[1].duration);
                completeStage(1);

                // Build FormData
                const formData = new FormData();
                formData.append('project_name', projectName);
                if (files.emails) formData.append('emails', files.emails);
                if (files.transcripts) formData.append('transcripts', files.transcripts);
                if (files.slack) formData.append('slack', files.slack);

                // Stage 3 — kick off the real API call
                activateStage(2);
                addLog('Classifying sentences as hard/soft requirements...');

                const fetchPromise = fetch(`${API_BASE}/generate`, {
                    method: 'POST',
                    body: formData,
                });

                // Animate stages 3–7 while API is running
                await sleep(PIPELINE_STAGES[2].duration);
                completeStage(2);

                activateStage(3);
                addLog('MiniLM embeddings: deduplicating via cosine similarity...');
                await sleep(PIPELINE_STAGES[3].duration);
                completeStage(3);

                activateStage(4);
                addLog('Scanning for numerical, scope & timeline conflicts...');
                await sleep(PIPELINE_STAGES[4].duration);
                completeStage(4);

                activateStage(5);
                addLog('Building provenance graph: source → requirement links...');
                await sleep(PIPELINE_STAGES[5].duration);
                completeStage(5);

                activateStage(6);
                addLog('Gemini 2.0 Flash synthesizing BRD prose with citations...');

                // Wait for actual API response
                const response = await fetchPromise;
                if (!response.ok) {
                    const detail = await response.json().catch(() => ({ detail: 'Unknown error' }));
                    throw new Error(detail.detail || `HTTP ${response.status}`);
                }
                const data = await response.json();

                await sleep(Math.max(0, PIPELINE_STAGES[6].duration - 2000));
                completeStage(6);

                activateStage(7);
                addLog('Pipeline complete! Intelligence Center ready.');

                // Store result in sessionStorage for all pages to read
                sessionStorage.setItem('brd_data', JSON.stringify(data));

                await sleep(PIPELINE_STAGES[7].duration);
                completeStage(7);
                setDone(true);

                setTimeout(() => navigate('/dashboard'), 1200);

            } catch (err) {
                setError(`Pipeline error: ${err.message}`);
                setStages(prev => prev.map(s =>
                    s.status === 'active' ? { ...s, status: 'error' } : s
                ));
            }
        };

        run();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="max-w-3xl mx-auto py-16 px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <div className="flex items-center justify-center gap-2 mb-4">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: done ? 0 : Infinity, ease: "linear" }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${done ? 'bg-accent' : 'bg-accent/20'}`}
                    >
                        {done ? <CheckCircle2 className="w-7 h-7 text-white" /> : <Brain className="w-7 h-7 text-accent" />}
                    </motion.div>
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-white italic">
                    {done ? 'Analysis Complete' : 'Processing Intelligence'}
                </h1>
                <p className="text-slate-400 mt-2 font-medium">
                    {done ? projectName + ' — BRD Generated' : 'Running 9-stage pipeline on ' + projectName}
                </p>
            </motion.div>

            {/* Pipeline Stages */}
            <div className="space-y-3 mb-12">
                {stages.map((stage, idx) => (
                    <motion.div
                        key={stage.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex items-center gap-5 p-4 rounded-2xl border transition-all ${stage.status === 'active' ? 'border-accent/40 bg-accent/5 shadow-lg shadow-accent/10' :
                                stage.status === 'complete' ? 'border-emerald-500/20 bg-emerald-500/5' :
                                    stage.status === 'error' ? 'border-red-500/30 bg-red-500/5' :
                                        'border-white/5 bg-white/[0.02]'
                            }`}
                    >
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                            <StageIcon icon={stage.icon} status={stage.status} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-black uppercase tracking-widest ${stage.status === 'active' ? 'text-white' :
                                    stage.status === 'complete' ? 'text-emerald-400' :
                                        stage.status === 'error' ? 'text-red-400' :
                                            'text-slate-600'
                                }`}>
                                {stage.name}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">{stage.desc}</p>
                        </div>
                        <div className="flex-shrink-0">
                            {stage.status === 'complete' && (
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/70 bg-emerald-500/10 px-2 py-1 rounded-full">
                                    Done
                                </span>
                            )}
                            {stage.status === 'active' && (
                                <span className="text-[9px] font-black uppercase tracking-widest text-accent/70 bg-accent/10 px-2 py-1 rounded-full animate-pulse">
                                    Running
                                </span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Live Log */}
            <AnimatePresence mode="wait">
                {!error && (
                    <motion.div
                        key={currentLog}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-center"
                    >
                        <p className="text-[11px] text-slate-500 font-mono uppercase tracking-widest">
                            ↳ {currentLog}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error State */}
            {error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 p-5 rounded-2xl border border-red-500/30 bg-red-500/10"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-red-400 font-black text-sm uppercase tracking-wide">Pipeline Error</p>
                    </div>
                    <p className="text-red-300/80 text-xs font-mono">{error}</p>
                    <p className="text-slate-500 text-xs mt-3">
                        Make sure the backend is running: <code className="text-accent">python main.py</code>
                    </p>
                    <button
                        onClick={() => navigate('/upload')}
                        className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500/30 transition-all"
                    >
                        ← Back to Upload
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default ProcessingPage;
