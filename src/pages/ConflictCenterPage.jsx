import { AlertTriangle, GitPullRequest, ChevronRight, Check, X, ArrowRight } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { conflicts } from '../data/mockData';
import { motion } from 'framer-motion';

const ConflictCenterPage = () => {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Conflict Center</h1>
                    <p className="text-slate-400">AI-detected logical contradictions between communication sources.</p>
                </div>
                <div className="bg-white/5 border border-border px-4 py-2 rounded-xl flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 uppercase">Detection Engine</span>
                    <span className="text-xs font-bold text-success flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Active
                    </span>
                </div>
            </div>

            <div className="space-y-6">
                {conflicts.map((conflict, idx) => (
                    <GlassCard key={idx} padding={false} hover={false}>
                        <div className="p-6 border-b border-border bg-white/[0.01] flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${conflict.severity === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{conflict.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">{conflict.id}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                        <span className={`text-[10px] font-bold uppercase ${conflict.severity === 'High' ? 'text-red-500' : 'text-orange-500'}`}>
                                            {conflict.severity} Severity
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="btn-secondary py-2 text-xs">Ignore</button>
                                <button className="btn-primary py-2 text-xs">Resolve Now</button>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Contradicting Points */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Conflicting Statements</label>
                                <div className="space-y-3">
                                    <div className="p-4 rounded-xl bg-red-500/[0.03] border border-red-500/10 relative overflow-hidden group">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                                        <p className="text-sm text-slate-300 leading-relaxed italic">"...we definitely need a 7-year retention period to comply with the new digital services act requirements."</p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-[10px] text-slate-500">Source: Meeting_Transcript_Q3.docx</span>
                                            <span className="text-[10px] text-red-400 font-bold uppercase">Option A</span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-blue-500/[0.03] border border-blue-500/10 relative overflow-hidden group">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                                        <p className="text-sm text-slate-300 leading-relaxed italic">"Double checked with Legal, it is actually a 5-year limit for this specific data class. Please update docs."</p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-[10px] text-slate-500">Source: Slack_Compliance_Thread.json</span>
                                            <span className="text-[10px] text-blue-400 font-bold uppercase">Option B</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Resolution Controls */}
                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Proposed Resolution</label>
                                <div className="flex-1 p-6 rounded-2xl bg-white/[0.03] border border-border flex flex-col items-center justify-center text-center">
                                    <GitPullRequest className="w-12 h-12 text-primary opacity-30 mb-4" />
                                    <p className="text-slate-400 text-sm mb-6 max-w-xs">
                                        Apply the most recent statement (Option B) as the primary requirement while archiving Option A for traceability.
                                    </p>
                                    <button className="bg-primary hover:bg-primary-hover text-white w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                                        Accept AI Recommendation
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};

export default ConflictCenterPage;
