import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, Database, Terminal, Activity, ArrowRight } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { pipelineStages } from '../data/mockData';

const ProcessingPage = () => {
    const [logs, setLogs] = useState([
        "Initializing NLP High-Speed Core...",
        "Attaching corporate signal buffers...",
        "Loading 113 identity profiles for resolution...",
    ]);

    // Count completed stages
    const completedCount = pipelineStages.filter(s => s.status === 'complete').length;
    const currentIdx = pipelineStages.findIndex(s => s.status === 'processing');
    const isFinished = completedCount === 9;

    useEffect(() => {
        const timer = setInterval(() => {
            const randomID = Math.floor(Math.random() * 9000) + 1000;
            const statusMsgs = [
                `Completed trace for node ${randomID}...`,
                `Analyzing semantic cluster ${randomID}...`,
                "Synchronizing local state with provenance graph...",
                "Running BART entropy validation...",
            ];
            setLogs(prev => [
                ...prev.slice(-4),
                statusMsgs[Math.floor(Math.random() * statusMsgs.length)]
            ]);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="space-y-12 max-w-7xl mx-auto py-10 px-6">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Intelligence <span className="text-accent not-italic">Engine</span></h1>
                <div className="flex items-center justify-center gap-3">
                    <Activity className="w-4 h-4 text-accent animate-pulse" />
                    <p className="text-slate-500 uppercase tracking-[0.3em] text-[10px] font-black">Synthesizing Signal Streams into BRD Structure</p>
                </div>
            </div>

            {/* Horizontal Pipeline Steps */}
            <div className="relative pt-10 pb-28">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -translate-y-1/2" />
                <div className="flex justify-between items-center relative z-10">
                    {pipelineStages.map((stage, i) => (
                        <div key={stage.id} className="flex flex-col items-center gap-6 relative">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: stage.status === 'processing' ? 1.1 : 1,
                                    borderColor: stage.status === 'complete' ? '#06b6d4' : stage.status === 'processing' ? '#06b6d4' : 'rgba(255,255,255,0.05)'
                                }}
                                className={`w-14 h-14 rounded-2xl border-2 bg-[#1a1a1f] flex items-center justify-center shadow-2xl transition-all duration-500 ${stage.status === 'complete' ? 'text-accent shadow-accent/20 border-accent' : stage.status === 'processing' ? 'text-white shadow-white/10 border-white animate-pulse' : 'text-slate-800'}`}
                            >
                                {stage.status === 'complete' ? <CheckCircle2 className="w-7 h-7" /> :
                                    stage.status === 'processing' ? <Loader2 className="w-7 h-7 animate-spin" /> :
                                        <Circle className="w-6 h-6" />}
                            </motion.div>
                            <div className="absolute top-24 text-center w-36">
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${stage.status === 'complete' ? 'text-accent' : stage.status === 'processing' ? 'text-white' : 'text-slate-700'}`}>Stage {stage.id}</p>
                                <p className={`text-[10px] font-black leading-tight uppercase tracking-widest ${stage.status === 'waiting' ? 'text-slate-800' : 'text-slate-400'}`}>{stage.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-5xl mx-auto">
                {/* Live Terminal Log */}
                <div className="lg:col-span-8">
                    <GlassCard padding={false} className="border-white/5 overflow-hidden shadow-2xl bg-black/40">
                        <div className="bg-white/[0.03] px-6 py-4 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Terminal className="w-4 h-4 text-accent" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Pipeline Execution Feed</span>
                            </div>
                            <div className="flex gap-1.5 opacity-50">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <div className="w-2 h-2 rounded-full bg-accent" />
                            </div>
                        </div>
                        <div className="p-8 font-mono text-[11px] space-y-3 h-64 flex flex-col justify-end">
                            <AnimatePresence mode="popLayout">
                                {logs.map((log, i) => (
                                    <motion.div
                                        key={log + i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-4 text-slate-500"
                                    >
                                        <span className="text-accent/40 italic">[{new Date().toLocaleTimeString()}]</span>
                                        <span className="text-slate-400 font-bold tracking-tighter">SYNTH:</span>
                                        <span className="text-slate-300">{log}</span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <div className="flex items-center gap-2 text-accent font-black animate-pulse mt-4">
                                <span>{'>'}</span>
                                <span className="w-2 h-4 bg-accent" />
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Status Indicator */}
                <div className="lg:col-span-4 flex flex-col justify-center gap-8">
                    <div className="p-8 rounded-3xl bg-accent/5 border border-accent/20 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 text-accent/5 group-hover:text-accent/10 transition-colors"><Database className="w-24 h-24 rotate-12" /></div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6">Current Progress</h3>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-6xl font-black text-white italic tracking-tighter">{completedCount}</span>
                            <span className="text-2xl font-black text-accent mb-2">/ 9</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Stages Synchronized</p>
                    </div>

                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        className={`w-full py-5 rounded-2xl flex items-center justify-center gap-4 font-black text-xs uppercase tracking-[0.3em] transition-all ${isFinished ? 'bg-accent text-white shadow-2xl shadow-accent/20 hover:scale-105 active:scale-95' : 'bg-white/5 text-slate-700 cursor-not-allowed border border-white/5'}`}
                    >
                        {isFinished ? 'Enter Intelligence Center' : 'Synthesizing...'}
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProcessingPage;
