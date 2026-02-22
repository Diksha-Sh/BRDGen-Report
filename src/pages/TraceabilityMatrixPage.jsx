import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, ArrowLeft, Search, ExternalLink, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const PriorityColors = { High: 'text-red-400', Medium: 'text-orange-400', Low: 'text-slate-400' };
const LabelColors = {
    hard_requirement: 'bg-accent/10 text-accent border-accent/30',
    soft_requirement: 'bg-slate-700/50 text-slate-400 border-slate-600/30',
};

const TraceabilityMatrixPage = () => {
    const navigate = useNavigate();
    const [sessionData, setSessionData] = useState(null);
    const [search, setSearch] = useState('');
    const [filterLabel, setFilterLabel] = useState('all');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const raw = sessionStorage.getItem('brd_data');
        if (raw) setSessionData(JSON.parse(raw));
    }, []);

    const requirements = sessionData?.requirements || [];

    const filtered = requirements.filter(req => {
        const matchSearch = !search ||
            (req.canonical_text || '').toLowerCase().includes(search.toLowerCase()) ||
            (req.id || '').toLowerCase().includes(search.toLowerCase()) ||
            (req.sources || []).some(s => s.sender?.toLowerCase().includes(search.toLowerCase()));
        const matchLabel = filterLabel === 'all' || req.label === filterLabel;
        return matchSearch && matchLabel;
    });

    if (!sessionData) {
        return (
            <div className="max-w-3xl mx-auto py-24 px-6 text-center">
                <p className="text-slate-400 text-xl mb-4">No analysis loaded.</p>
                <button onClick={() => navigate('/upload')} className="px-6 py-3 bg-accent text-white rounded-xl font-black uppercase tracking-wider text-sm">← Upload Documents</button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-10 px-6 space-y-8">
            {/* Header */}
            <div>
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs font-black uppercase tracking-widest mb-3 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
                </button>
                <h1 className="text-4xl font-black tracking-tighter text-white italic">Traceability Matrix</h1>
                <p className="text-slate-400 text-sm mt-1">
                    {sessionData.project_name} · {requirements.length} requirements · full provenance
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search requirements, IDs, stakeholders..."
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-accent transition-colors"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'hard_requirement', 'soft_requirement'].map(l => (
                        <button
                            key={l}
                            onClick={() => setFilterLabel(l)}
                            className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterLabel === l
                                    ? 'bg-accent/10 text-accent border border-accent/30'
                                    : 'bg-white/5 text-slate-500 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            {l === 'all' ? 'All' : l === 'hard_requirement' ? 'Hard' : 'Soft'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results count */}
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                {filtered.length} of {requirements.length} requirements
            </p>

            {/* Table */}
            <div className="space-y-3">
                {filtered.map((req, idx) => {
                    const isExpanded = expandedId === req.id;
                    return (
                        <motion.div
                            key={req.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                            className="bg-white/[0.02] border border-white/8 rounded-2xl overflow-hidden"
                        >
                            <div
                                className="p-5 flex items-start gap-5 cursor-pointer hover:bg-white/[0.03] transition-colors"
                                onClick={() => setExpandedId(isExpanded ? null : req.id)}
                            >
                                {/* ID + label */}
                                <div className="flex flex-col items-start gap-2 flex-shrink-0 w-28">
                                    <span className="text-[10px] font-black text-accent/80 font-mono">{req.id}</span>
                                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${LabelColors[req.label] || LabelColors.soft_requirement}`}>
                                        {req.label === 'hard_requirement' ? 'Hard' : 'Soft'}
                                    </span>
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-200 font-medium leading-relaxed line-clamp-2">
                                        {req.canonical_text}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3 mt-2">
                                        {req.priority && (
                                            <span className={`text-[9px] font-black uppercase ${PriorityColors[req.priority] || 'text-slate-500'}`}>
                                                {req.priority} Priority
                                            </span>
                                        )}
                                        <span className="text-[9px] text-slate-500">
                                            {Math.round((req.confidence || 0) * 100)}% confidence
                                        </span>
                                        {req.topic_label && (
                                            <span className="text-[9px] text-slate-600 bg-white/5 px-1.5 py-0.5 rounded">
                                                {req.topic_label}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Source count */}
                                <div className="flex-shrink-0 text-right">
                                    <p className="text-lg font-black text-white">{(req.sources || []).length}</p>
                                    <p className="text-[9px] text-slate-500 uppercase font-bold">sources</p>
                                </div>
                            </div>

                            {/* Expanded: full source trail */}
                            {isExpanded && (req.sources || []).length > 0 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-white/5 px-5 pb-5"
                                >
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-4 mb-3">Source Trail</p>
                                    <div className="space-y-3">
                                        {req.sources.map((src, i) => (
                                            <div key={i} className="flex gap-5 items-start p-3 rounded-xl bg-black/20 border border-white/5">
                                                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-accent text-[10px] font-black">
                                                        {(src.sender || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 flex-wrap mb-1">
                                                        <span className="text-xs font-bold text-white">{src.sender || 'Unknown'}</span>
                                                        <span className="text-[9px] text-slate-500">{src.role || 'Stakeholder'}</span>
                                                        <span className="text-[9px] text-slate-600 bg-white/5 px-1.5 py-0.5 rounded">{src.source || 'Unknown'}</span>
                                                        {src.timestamp && src.timestamp !== 'unknown' && (
                                                            <span className="text-[9px] text-slate-600">{src.timestamp}</span>
                                                        )}
                                                    </div>
                                                    {src.content && (
                                                        <p className="text-[11px] text-slate-400 italic leading-relaxed border-l-2 border-white/10 pl-3 mt-2">
                                                            "{src.content.slice(0, 200)}{src.content.length > 200 ? '...' : ''}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="text-center py-16 text-slate-500">
                        <GitBranch className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>{search ? 'No matching requirements.' : 'No requirements found.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TraceabilityMatrixPage;
