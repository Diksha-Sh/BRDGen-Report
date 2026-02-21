import React, { useState } from 'react';
import { FileText, Search, AlertCircle, CheckCircle, ChevronRight, Bookmark, Edit3, MessageSquare, Clock, Users, Hash, Zap, Sparkles, Filter } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { brdSections, parkingLot } from '../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';

const BRDViewerPage = () => {
    const [query, setQuery] = useState('');
    const [isRegenerating, setIsRegenerating] = useState(false);

    const handleRegen = () => {
        setIsRegenerating(true);
        setTimeout(() => setIsRegenerating(false), 2000);
    };

    const getLabelStyles = (label) => {
        const uLabel = label.toUpperCase();
        if (uLabel.includes('REQUIREMENT')) return 'text-accent bg-accent/10 border-accent/20';
        if (uLabel.includes('CONSTRAINT')) return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
        if (uLabel.includes('TIMELINE')) return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
        if (uLabel.includes('SECURITY')) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
        if (uLabel.includes('NEGATION')) return 'text-red-400 bg-red-400/10 border-red-400/20';
        if (uLabel.includes('STAKEHOLDER')) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
        return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    };

    return (
        <div className="flex gap-8 max-w-[1600px] mx-auto pb-20 px-6">
            {/* Sidebar Outlines */}
            <div className="w-64 shrink-0 hidden xl:block">
                <div className="sticky top-8 space-y-6">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-4">Intelligence Outline</h3>
                    <nav className="space-y-1">
                        {brdSections.map((section) => (
                            <button
                                key={section.id}
                                className="w-full text-left px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all text-slate-500 hover:text-white hover:bg-white/5 flex items-center gap-3 group border border-transparent hover:border-white/10"
                            >
                                <div className="h-1 w-1 rounded-full bg-slate-800 group-hover:bg-accent transition-colors" />
                                {section.title}
                            </button>
                        ))}
                    </nav>

                    <div className="p-6 rounded-2xl bg-accent/5 border border-accent/20 space-y-4">
                        <div className="flex items-center gap-2 text-accent">
                            <Zap className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Model Audit</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-tight">
                            Synthesized by GPT-4o with BART-large-mnli validation. 100% Traceability active.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Document Area */}
            <div className="flex-1 space-y-8 min-w-0">
                <GlassCard className="p-2 border-accent/20 shadow-2xl shadow-accent/10 relative overflow-hidden">
                    <AnimatePresence>
                        {isRegenerating && (
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/20 to-transparent pointer-events-none"
                            />
                        )}
                    </AnimatePresence>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="bg-accent/10 p-3 rounded-xl border border-accent/20 text-accent">
                            <Sparkles className={`w-5 h-5 ${isRegenerating ? 'animate-spin' : ''}`} />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask GPT-4o to refine sections (e.g. 'Strengthen the technical constraints')..."
                            className="flex-1 bg-transparent border-none focus:outline-none text-white font-bold text-sm placeholder:text-slate-600"
                        />
                        <button
                            onClick={handleRegen}
                            className="bg-accent hover:opacity-90 text-white py-3 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-accent/20"
                        >
                            {isRegenerating ? 'Processing...' : 'Refine'}
                        </button>
                    </div>
                </GlassCard>

                <GlassCard padding={false} className="overflow-hidden shadow-2xl border-white/5 bg-[#1a1a1f]">
                    <header className="p-12 border-b border-white/5 bg-white/[0.01]">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-5xl font-black text-white italic tracking-tighter mb-3">Enterprise <span className="text-accent not-italic">Synthesis</span></h1>
                                <p className="text-slate-500 text-[10px] uppercase tracking-[0.5em] font-black">Business Requirements Intelligence v3.4</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-accent uppercase tracking-widest bg-accent/10 px-3 py-1 rounded-full border border-accent/20 mb-2">Internal Draft</span>
                                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Confidence Score: 98.4%</span>
                            </div>
                        </div>
                    </header>

                    <div className="p-16 space-y-24">
                        {brdSections.map((section) => (
                            <section key={section.id} className="space-y-10">
                                <div className="flex items-center gap-6">
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">{section.title}</h2>
                                    <div className="h-[1px] flex-1 bg-white/5" />
                                </div>

                                {section.content && <p className="text-slate-400 text-lg leading-relaxed font-medium italic opacity-80 border-l-2 border-white/5 pl-8">{section.content}</p>}

                                {section.requirements && (
                                    <div className="space-y-6">
                                        {section.requirements.map((req) => (
                                            <motion.div
                                                key={req.id}
                                                whileHover={{ x: 5 }}
                                                className={`group p-8 rounded-3xl border transition-all ${req.status === 'conflict' ? 'bg-orange-500/5 border-orange-500/20' : 'bg-white/[0.02] border-white/5 hover:border-accent/40 hover:bg-white/[0.03]'}`}
                                            >
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[10px] font-black text-slate-600 tracking-[0.2em] uppercase">{req.id}</span>
                                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black border uppercase tracking-widest ${getLabelStyles(req.label)}`}>
                                                            {req.label}
                                                        </span>
                                                    </div>

                                                    <button className="flex items-center gap-2 px-3 py-1.5 bg-accent/5 rounded-lg border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-accent hover:border-accent/40 transition-all">
                                                        <Hash className="w-3 h-3" />
                                                        {req.citations} Signals
                                                    </button>
                                                </div>
                                                <p className="text-xl leading-relaxed text-slate-300 font-medium group-hover:text-white transition-colors">{req.text}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        ))}
                    </div>
                </GlassCard>
            </div>

            {/* Right Panel: Parking Lot */}
            <div className="w-80 shrink-0 hidden 2xl:block">
                <div className="sticky top-8 space-y-6">
                    <GlassCard className="border-orange-500/20 bg-orange-500/[0.02]">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Audit Hold</h3>
                            <Clock className="w-4 h-4 text-orange-500" />
                        </div>
                        <div className="space-y-8">
                            {parkingLot.map((item) => (
                                <div key={item.id} className="space-y-3 group pb-6 last:pb-0">
                                    <p className="text-xs text-slate-400 leading-relaxed font-bold transition-colors group-hover:text-white italic">"{item.text}"</p>
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-600">
                                        <span>{item.date}</span>
                                        <button className="text-accent hover:text-white transition-colors">Resolve</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default BRDViewerPage;
