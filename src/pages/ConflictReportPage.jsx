import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ChevronDown, ChevronUp, TrendingUp, Clock, Crosshair, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_CONFIG = {
    numerical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Numerical', icon: TrendingUp },
    scope: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'Scope', icon: Crosshair },
    authority: { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', label: 'Authority', icon: Users },
    timeline: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Timeline', icon: Clock },
    general: { color: 'text-slate-400', bg: 'bg-slate-700/30', border: 'border-slate-600/20', label: 'General', icon: AlertTriangle },
};

const SEVERITY_COLORS = { High: 'text-red-400', Medium: 'text-orange-400', Low: 'text-yellow-400' };

const ConflictCard = ({ conflict, idx }) => {
    const [expanded, setExpanded] = useState(false);
    const type = TYPE_CONFIG[conflict.conflict_type] || TYPE_CONFIG.general;
    const Icon = type.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className={`rounded-2xl border ${type.border} ${type.bg} overflow-hidden`}
        >
            {/* Card Header */}
            <button
                className="w-full text-left p-6 hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpanded(e => !e)}
            >
                <div className="flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${type.bg} border ${type.border}`}>
                        <Icon className={`w-4.5 h-4.5 ${type.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${type.bg} ${type.border} ${type.color}`}>
                                {type.label}
                            </span>
                            {conflict.severity && (
                                <span className={`text-[9px] font-black uppercase ${SEVERITY_COLORS[conflict.severity] || 'text-slate-500'}`}>
                                    {conflict.severity} Severity
                                </span>
                            )}
                            <span className="text-[9px] text-slate-600 font-mono ml-auto">{conflict.id}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-200 leading-snug">
                            {conflict.topic?.slice(0, 120)}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 font-medium">
                            {conflict.source_a?.sender || 'Stakeholder A'} vs {conflict.source_b?.sender || 'Stakeholder B'}
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </div>
                </div>
            </button>

            {/* Expanded Detail */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="px-6 pb-6 space-y-4 border-t border-white/5">
                            {/* Side by Side */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {[
                                    { label: 'Position A', data: conflict.source_a },
                                    { label: 'Position B', data: conflict.source_b },
                                ].map(({ label, data }) => (
                                    <div key={label} className="p-4 rounded-xl bg-black/20 border border-white/5">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</span>
                                            <span className="text-[9px] text-slate-600">{data?.source || 'Unknown'}</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-200 mb-1">{data?.sender || 'Stakeholder'}</p>
                                        <p className="text-[9px] text-slate-500 italic mb-2">{data?.role || 'Role unknown'}</p>
                                        {data?.content && (
                                            <p className="text-[11px] text-slate-400 leading-relaxed border-l-2 border-white/10 pl-3 italic">
                                                "{data.content.slice(0, 180)}"
                                            </p>
                                        )}
                                        {data?.date_mentioned && (
                                            <p className="text-[10px] text-yellow-400/70 mt-2 font-mono">Date: {data.date_mentioned}</p>
                                        )}
                                        {data?.value && (
                                            <p className="text-[10px] text-red-400/70 mt-2 font-mono">Value: {data.value}</p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Recommendation */}
                            <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                                <p className="text-[9px] font-black text-accent uppercase tracking-widest mb-2">AI Recommendation</p>
                                <p className="text-xs text-slate-300 leading-relaxed">{conflict.recommendation}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const ConflictReportPage = () => {
    const navigate = useNavigate();
    const [sessionData, setSessionData] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const raw = sessionStorage.getItem('brd_data');
        if (raw) setSessionData(JSON.parse(raw));
    }, []);

    const allConflicts = sessionData?.conflicts || [];
    const types = ['all', ...new Set(allConflicts.map(c => c.conflict_type).filter(Boolean))];
    const filtered = filter === 'all' ? allConflicts : allConflicts.filter(c => c.conflict_type === filter);

    if (!sessionData) {
        return (
            <div className="max-w-3xl mx-auto py-24 px-6 text-center">
                <p className="text-slate-400 text-xl mb-4">No analysis loaded.</p>
                <button onClick={() => navigate('/upload')} className="px-6 py-3 bg-accent text-white rounded-xl font-black uppercase tracking-wider text-sm">← Upload Documents</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
            {/* Header */}
            <div>
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs font-black uppercase tracking-widest mb-3 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
                </button>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-white italic">Conflict Report</h1>
                        <p className="text-slate-400 text-sm mt-1">
                            {sessionData.project_name} · {allConflicts.length} conflict{allConflicts.length !== 1 ? 's' : ''} detected
                        </p>
                    </div>
                    {allConflicts.length === 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">No Conflicts</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Type Filter */}
            {allConflicts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {types.map(t => {
                        const cfg = TYPE_CONFIG[t];
                        return (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === t
                                        ? `${cfg?.bg || 'bg-accent/10'} ${cfg?.color || 'text-accent'} border ${cfg?.border || 'border-accent/20'}`
                                        : 'bg-white/5 text-slate-500 border border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                {t === 'all' ? `All (${allConflicts.length})` : `${t} (${allConflicts.filter(c => c.conflict_type === t).length})`}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Conflict Cards */}
            <div className="space-y-4">
                {filtered.length > 0 ? (
                    filtered.map((conflict, i) => (
                        <ConflictCard key={conflict.id || i} conflict={conflict} idx={i} />
                    ))
                ) : (
                    <div className="text-center py-20">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-7 h-7 text-emerald-400" />
                        </div>
                        <p className="text-slate-400 text-lg font-bold">No conflicts detected</p>
                        <p className="text-slate-600 text-sm mt-2">All stakeholder signals are aligned for this project.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConflictReportPage;
