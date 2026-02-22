import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, ExternalLink, Tag, AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BRD_SECTION_ORDER = [
    'Executive Summary',
    'Project Scope & Objectives',
    'Stakeholder Analysis',
    'Functional Requirements',
    'Non-Functional Requirements',
    'Data & Security Compliance',
    'Timeline & Milestones',
    'Identified Risks & Conflicts',
];

const LABEL_COLORS = {
    hard_requirement: 'bg-accent/10 text-accent border-accent/30',
    soft_requirement: 'bg-slate-700/60 text-slate-400 border-slate-600/30',
};

const CitationBadge = ({ req, onSelect }) => (
    <button
        onClick={() => onSelect(req)}
        className="inline-flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-accent/15 text-accent border border-accent/20 hover:bg-accent/25 transition-all"
    >
        [{req.id}] {req.corroboration_count > 1 ? `×${req.corroboration_count}` : ''}
    </button>
);

const CitationDrawer = ({ req, onClose }) => {
    if (!req) return null;
    return (
        <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-96 bg-[#0d1117] border-l border-white/10 z-50 flex flex-col shadow-2xl"
        >
            <div className="p-6 border-b border-white/10 flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest">{req.id}</p>
                    <p className="text-white font-bold text-sm mt-1 leading-snug line-clamp-2">{req.canonical_text}</p>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors ml-4 mt-1 flex-shrink-0">
                    ✕
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded border ${LABEL_COLORS[req.label] || LABEL_COLORS.soft_requirement}`}>
                        {req.label?.replace('_', ' ')}
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium">
                        {Math.round((req.confidence || 0) * 100)}% confidence
                    </span>
                    {req.priority && (
                        <span className="text-[9px] font-black text-slate-400 uppercase">{req.priority} priority</span>
                    )}
                </div>

                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Source Trail</p>
                    <div className="space-y-3">
                        {(req.sources || []).map((src, i) => (
                            <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/8">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-white">{src.sender || 'Unknown'}</span>
                                    <span className="text-[9px] text-slate-500">{src.source || 'Unknown'}</span>
                                </div>
                                <p className="text-[9px] text-slate-400 italic leading-relaxed">"{src.content?.slice(0, 200)}"</p>
                                {src.timestamp && src.timestamp !== 'unknown' && (
                                    <p className="text-[9px] text-slate-600 mt-1">{src.timestamp}</p>
                                )}
                            </div>
                        ))}
                        {(!req.sources || req.sources.length === 0) && (
                            <p className="text-slate-600 text-sm">No source details available.</p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const BRDSection = ({ title, content, requirements, conflictIds, onCitationClick }) => {
    const [collapsed, setCollapsed] = useState(false);
    const paragraphs = content ? content.split('\n').filter(p => p.trim()) : [];

    return (
        <div className="bg-white/[0.02] border border-white/8 rounded-2xl overflow-hidden">
            <button
                onClick={() => setCollapsed(c => !c)}
                className="w-full flex items-center justify-between p-6 hover:bg-white/[0.03] transition-colors"
            >
                <span className="text-sm font-black uppercase tracking-widest text-white">{title}</span>
                {collapsed ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronUp className="w-4 h-4 text-slate-500" />}
            </button>

            <AnimatePresence>
                {!collapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-6 pb-6"
                    >
                        {paragraphs.length > 0 ? (
                            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                                {paragraphs.map((para, i) => {
                                    // Highlight REQ-IDs with clickable badges
                                    const parts = para.split(/(\[REQ-\d+\])/g);
                                    return (
                                        <p key={i}>
                                            {parts.map((part, j) => {
                                                const match = part.match(/\[REQ-(\d+)\]/);
                                                if (match) {
                                                    const reqId = `REQ-${match[1]}`;
                                                    const req = requirements.find(r => r.id === reqId);
                                                    if (req) return <CitationBadge key={j} req={req} onSelect={onCitationClick} />;
                                                    return <span key={j} className="text-accent/60 text-[10px] font-mono">{part}</span>;
                                                }
                                                return <span key={j}>{part}</span>;
                                            })}
                                        </p>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-slate-600 text-sm italic">No content generated for this section.</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const BRDViewerPage = () => {
    const navigate = useNavigate();
    const [sessionData, setSessionData] = useState(null);
    const [search, setSearch] = useState('');
    const [selectedReq, setSelectedReq] = useState(null);

    useEffect(() => {
        const raw = sessionStorage.getItem('brd_data');
        if (raw) setSessionData(JSON.parse(raw));
    }, []);

    if (!sessionData) {
        return (
            <div className="max-w-3xl mx-auto py-24 px-6 text-center">
                <p className="text-slate-400 text-xl mb-4">No BRD data found.</p>
                <button onClick={() => navigate('/upload')} className="px-6 py-3 bg-accent text-white rounded-xl font-black uppercase tracking-wider text-sm">
                    ← Upload Documents
                </button>
            </div>
        );
    }

    const brd_sections = sessionData.brd_sections || {};
    const requirements = sessionData.requirements || [];
    const conflicts = sessionData.conflicts || [];
    const parking_lot = sessionData.parking_lot || [];

    const conflictReqIds = new Set(
        conflicts.flatMap(c => [
            c.source_a?.content, c.source_b?.content
        ]).filter(Boolean)
    );

    const sections = BRD_SECTION_ORDER
        .filter(s => brd_sections[s])
        .filter(s => !search || s.toLowerCase().includes(search.toLowerCase()) || brd_sections[s]?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="max-w-5xl mx-auto py-10 px-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
                <div>
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs font-black uppercase tracking-widest mb-3 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
                    </button>
                    <h1 className="text-4xl font-black tracking-tighter text-white italic">BRD Document</h1>
                    <p className="text-slate-400 text-sm mt-1">{sessionData.project_name} · {requirements.length} requirements · {Object.keys(brd_sections).length} sections</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <button onClick={() => navigate('/export')} className="px-4 py-2.5 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all">
                        Export BRD
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search BRD sections..."
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-accent transition-colors"
                />
            </div>

            {/* Sections */}
            <div className="space-y-4 mb-10">
                {sections.length > 0 ? sections.map((title, i) => (
                    <motion.div
                        key={title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                    >
                        <BRDSection
                            title={title}
                            content={brd_sections[title]}
                            requirements={requirements}
                            conflictIds={conflictReqIds}
                            onCitationClick={setSelectedReq}
                        />
                    </motion.div>
                )) : (
                    <div className="text-center py-16 text-slate-500">
                        {search ? 'No sections match your search.' : 'No BRD sections generated yet.'}
                    </div>
                )}
            </div>

            {/* Requirements Index */}
            {requirements.length > 0 && (
                <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6 mb-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Requirements Index</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {requirements.map((req, i) => (
                            <div
                                key={i}
                                onClick={() => setSelectedReq(req)}
                                className="flex items-center gap-3 py-2 px-2 rounded-lg cursor-pointer hover:bg-white/[0.04] transition-colors group"
                            >
                                <span className="text-[9px] font-black text-accent/70 w-16 flex-shrink-0">{req.id}</span>
                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border flex-shrink-0 ${LABEL_COLORS[req.label] || LABEL_COLORS.soft_requirement}`}>
                                    {req.label === 'hard_requirement' ? 'Hard' : 'Soft'}
                                </span>
                                <span className="text-[11px] text-slate-400 group-hover:text-slate-200 truncate transition-colors">
                                    {(req.canonical_text || '').slice(0, 90)}
                                </span>
                                <ExternalLink className="w-3 h-3 text-slate-700 group-hover:text-accent flex-shrink-0 ml-auto transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Parking Lot */}
            {parking_lot.length > 0 && (
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-6">
                    <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5" /> Parking Lot — Low Confidence ({parking_lot.length})
                    </p>
                    <div className="space-y-2">
                        {parking_lot.map((req, i) => (
                            <div key={i} className="flex items-center gap-3 text-[11px] text-slate-400">
                                <span className="text-yellow-400/60 font-mono text-[9px] w-16 flex-shrink-0">{req.id}</span>
                                <span className="truncate">{(req.canonical_text || '').slice(0, 80)}</span>
                                <span className="text-[9px] text-yellow-600 ml-auto flex-shrink-0">
                                    {Math.round((req.confidence || 0) * 100)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Citation Drawer */}
            <AnimatePresence>
                {selectedReq && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                            onClick={() => setSelectedReq(null)}
                        />
                        <CitationDrawer req={selectedReq} onClose={() => setSelectedReq(null)} />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BRDViewerPage;
