import React from 'react';
import { FileText, AlertTriangle, Clock, Users, Shield, Cpu, Zap, Network } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { metricsData, healthScore } from '../data/mockData';
import { motion } from 'framer-motion';

const DashboardPage = () => {
    return (
        <div className="space-y-12 max-w-7xl mx-auto pb-20 px-6">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Intelligence <span className="text-accent not-italic">Center</span></h1>
                    <p className="text-slate-500 uppercase tracking-[0.4em] text-[10px] font-black mt-2">Real-time Requirements Extraction & Conflict Audit</p>
                </div>
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-accent uppercase tracking-widest">Active Core: GPT-4o</span>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricsData.map((stat, i) => {
                    const Icon = { FileText, AlertTriangle, Clock, Users }[stat.icon] || FileText;
                    const isConflict = stat.label.toLowerCase().includes('conflict');
                    return (
                        <GlassCard key={i} delay={i * 0.1} className="group overflow-hidden border-white/5 hover:border-white/10 transition-all">
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                                    <p className={`text-4xl font-black leading-none italic ${isConflict ? 'text-orange-500' : 'text-white'}`}>{stat.value}</p>
                                </div>
                                <div className={`p-4 rounded-2xl border transition-all ${isConflict ? 'bg-orange-500/10 border-orange-500/20 text-orange-500 group-hover:bg-orange-500/20' : 'bg-accent/10 border-accent/20 text-accent group-hover:bg-accent/20'}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                            <div className={`absolute -bottom-4 -right-4 w-24 h-24 opacity-[0.03] ${isConflict ? 'bg-orange-500' : 'bg-accent'} blur-3xl group-hover:opacity-10 transition-opacity`} />
                        </GlassCard>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Health Score Panel (Left) */}
                <div className="lg:col-span-4 space-y-8">
                    <GlassCard className="flex flex-col items-center justify-center py-16 border-accent/20 shadow-2xl shadow-accent/5">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-12 text-center">BRD Health Score</h3>
                        <div className="relative w-72 h-72 mb-12">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-[-15px] border border-dashed border-accent/10 rounded-full"
                            />

                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="144" cy="144" r="130" stroke="currentColor" strokeWidth="1" fill="transparent" className="text-white/5" />
                                <motion.circle
                                    cx="144" cy="144" r="130"
                                    stroke="currentColor" strokeWidth="16" fill="transparent"
                                    strokeDasharray={816}
                                    initial={{ strokeDashoffset: 816 }}
                                    animate={{ strokeDashoffset: 816 - (816 * healthScore) / 100 }}
                                    transition={{ duration: 2.5, ease: "circOut" }}
                                    className="text-accent shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-8xl font-black text-white italic tracking-tighter leading-none">{healthScore}<span className="text-2xl not-italic text-accent ml-1">%</span></span>
                                <span className="text-[10px] text-slate-500 font-black mt-4 tracking-[0.5em] uppercase">Synthesized</span>
                            </div>
                        </div>

                        <div className="w-full space-y-8 px-6">
                            {[
                                { label: 'BART Extraction Precision', value: 92, color: 'bg-accent' },
                                { label: 'MiniLM Semantic Coverage', value: 88, color: 'bg-accent/60' },
                                { label: 'GPT-4o Conflict Resolution', value: 74, color: 'bg-orange-500' }
                            ].map((bar, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                        <span>{bar.label}</span>
                                        <span className="text-white">{bar.value}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${bar.value}%` }}
                                            transition={{ duration: 1.5, delay: 0.5 + i * 0.2 }}
                                            className={`h-full ${bar.color} rounded-full`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* Agent Distribution (Right) */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <GlassCard className="border-white/5">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Signal Clustering</h3>
                                <Network className="w-4 h-4 text-accent" />
                            </div>
                            <div className="space-y-6">
                                {[
                                    { label: 'Functional Requirements', count: '42%', progress: 85, color: 'bg-accent' },
                                    { label: 'Technical Constraints', count: '18%', progress: 45, color: 'bg-blue-400' },
                                    { label: 'Timeline Decisions', count: '12%', progress: 30, color: 'bg-purple-400' },
                                    { label: 'Stakeholder Concerns', count: '28%', progress: 65, color: 'bg-orange-400' }
                                ].map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                                            <span className="text-white opacity-80">{item.label}</span>
                                            <span className="text-slate-500">{item.count}</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.progress}%` }}
                                                className={`h-full ${item.color}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                        <GlassCard className="border-accent/10 bg-accent/[0.01]">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Active Agent Portfolio</h3>
                                <Cpu className="w-4 h-4 text-accent" />
                            </div>
                            <div className="space-y-4">
                                {[
                                    { name: 'BART-large-mnli', role: 'NLI Classifier', status: 'Online', color: 'text-success' },
                                    { name: 'all-MiniLM-L6-v2', role: 'Embeddings Engine', status: 'Online', color: 'text-success' },
                                    { name: 'BERTopic + HDBSCAN', role: 'Topic Discovery', status: 'Online', color: 'text-success' },
                                    { name: 'GPT-4o Synthesis', role: 'Reasoning Core', status: 'Standby', color: 'text-accent' }
                                ].map((agent, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all cursor-pointer" onClick={() => window.location.href = '/agents'}>
                                        <div>
                                            <h4 className="text-xs font-black text-white italic">{agent.name}</h4>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{agent.role}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${agent.color === 'text-success' ? 'bg-success' : 'bg-accent'} animate-pulse`} />
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${agent.color}`}>{agent.status}</span>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => window.location.href = '/agents'} className="w-full mt-4 py-3 border border-dashed border-white/10 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white hover:border-accent/40 transition-all">View Architecture</button>
                            </div>
                        </GlassCard>
                    </div>

                    <GlassCard className="bg-white/[0.01] border-white/5">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Pipeline Synthesis Log</h3>
                            <button onClick={() => window.location.href = '/processing'} className="text-[9px] font-black text-accent uppercase tracking-widest hover:underline">Full Trace</button>
                        </div>
                        <div className="space-y-4">
                            {[
                                "Extracted 52 atomic functional requirements from Enron Signal Stream.",
                                "Resolved 14 contradictory launch dates between Jeff Skilling (Email) and Kenneth Lay (Slack).",
                                "Traceability links established for all 509 identified nodes via networkx graph.",
                                "GPT-4o generating professional prose for section 'Design & Technical Constraints'."
                            ].map((log, i) => (
                                <div key={i} className="flex gap-4 items-start group">
                                    <div className="mt-1.5 w-1 h-1 rounded-full bg-accent group-hover:scale-150 transition-transform" />
                                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed group-hover:text-slate-200 transition-colors uppercase tracking-tight">{log}</p>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
