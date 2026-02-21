import React from 'react';
import { AlertCircle, ArrowRight, User, Clock, Shield, CheckCircle2, Zap, MessageSquare, Info } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { conflicts } from '../data/mockData';
import { motion } from 'framer-motion';

const ConflictReportPage = () => {
    return (
        <div className="space-y-10 max-w-6xl mx-auto pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tighter">Conflict <span className="text-orange-500 not-italic">Audit</span></h1>
                    <p className="text-slate-500 uppercase tracking-[0.3em] text-[10px] font-bold mt-1">Found via Rule Engine & GPT-4o Multi-Source Reconciliation</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Open Conflicts</span>
                        <span className="text-lg font-bold text-orange-500">{conflicts.length}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {conflicts.map((conflict, i) => (
                    <motion.div
                        key={conflict.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <GlassCard padding={false} className="border-white/5 overflow-hidden shadow-2xl">
                            {/* Card Header */}
                            <div className="bg-white/[0.02] border-b border-white/5 px-8 py-5 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <span className="px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded text-[10px] font-black text-orange-500 uppercase tracking-widest">{conflict.id}</span>
                                    <h3 className="text-lg font-bold text-white uppercase tracking-tight italic">{conflict.title}</h3>
                                    <span className={`ml-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${conflict.type === 'Timeline' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                            conflict.type === 'Numerical' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                        }`}>
                                        {conflict.type === 'Timeline' ? 'TIMELINE CONFLICT' :
                                            conflict.type === 'Numerical' ? 'NUMERICAL MISMATCH' :
                                                'SCOPE CONTRADICTION'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-slate-500" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Owner: {conflict.owner} (Level 5)</span>
                                </div>
                            </div>

                            {/* Two-Column Comparison */}
                            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-white/5 bg-gradient-to-b from-transparent to-white/[0.01]">
                                {[conflict.sourceA, conflict.sourceB].map((source, j) => (
                                    <div key={j} className="p-8 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-black text-accent border border-accent/20 uppercase">
                                                    {source.author.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-white uppercase tracking-wider">{source.author}</p>
                                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic">{j === 0 ? 'Project Lead' : 'Stakeholder'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-[10px] font-bold">{source.date}</span>
                                            </div>
                                        </div>
                                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 relative">
                                            <div className="absolute top-4 right-4 text-white/5"><MessageSquare className="w-10 h-10" /></div>
                                            <p className="text-slate-300 text-sm leading-relaxed italic relative z-10">"{source.text}"</p>
                                            <div className="mt-4 flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-black text-slate-500 uppercase tracking-widest border border-white/5">{source.channel}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recommendation Bar */}
                            <div className="p-8 bg-orange-500/5 border-t border-orange-500/10 flex flex-col md:flex-row gap-8 items-center">
                                <div className="flex-1 flex gap-4">
                                    <div className="bg-orange-500/20 p-3 rounded-xl border border-orange-500/30 shrink-0 self-start">
                                        <Zap className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-2">AI Recommendation (GPT-4o)</h4>
                                        <p className="text-sm font-medium text-slate-200 leading-relaxed italic">{conflict.recommendation}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 shrink-0">
                                    <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all">Ignore</button>
                                    <button className="px-8 py-3 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 hover:scale-105 transition-all">Mark Resolved</button>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ConflictReportPage;
