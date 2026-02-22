import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, AlertTriangle, Users, Zap, ArrowRight, TrendingUp, Clock, CheckCircle2, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = 'http://localhost:8000';

const MOCK_METRICS = [
    { label: 'Total Requirements', value: '—', icon: 'FileText' },
    { label: 'Conflicts Detected', value: '—', icon: 'AlertTriangle' },
    { label: 'Signal Sources', value: '—', icon: 'Clock' },
    { label: 'Unique Stakeholders', value: '—', icon: 'Users' },
];

const IconMap = { FileText, AlertTriangle, Clock, Users, TrendingUp };

const Stat = ({ label, value, icon, warning }) => {
    const Icon = IconMap[icon] || Zap;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl border ${warning ? 'border-orange-500/20 bg-orange-500/5' : 'border-white/8 bg-white/[0.03]'}`}
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${warning ? 'bg-orange-500/10' : 'bg-accent/10'}`}>
                <Icon className={`w-5 h-5 ${warning ? 'text-orange-400' : 'text-accent'}`} />
            </div>
            <p className={`text-4xl font-black tracking-tighter ${warning ? 'text-orange-400' : 'text-white'}`}>{value}</p>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">{label}</p>
        </motion.div>
    );
};

const DashboardPage = () => {
    const navigate = useNavigate();
    const [sessionData, setSessionData] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const raw = sessionStorage.getItem('brd_data');
        if (raw) setSessionData(JSON.parse(raw));

        fetch(`${API_BASE}/projects`)
            .then(r => r.json())
            .then(data => setHistory(data))
            .catch(() => { });
    }, []);

    const reqs = sessionData?.requirements || [];
    const confs = sessionData?.conflicts || [];
    const stats = sessionData?.stats || {};

    const metrics = [
        { label: 'Total Requirements', value: stats.total_requirements ?? reqs.length, icon: 'FileText' },
        { label: 'Conflicts Detected', value: stats.conflicts_detected ?? confs.length, icon: 'AlertTriangle', warning: (stats.conflicts_detected ?? confs.length) > 0 },
        { label: 'Signals Processed', value: stats.signals_processed ?? '—', icon: 'Clock' },
        { label: 'Unique Stakeholders', value: stats.unique_stakeholders ?? '—', icon: 'Users' },
    ];

    const health = sessionData?.health_score ?? null;

    // Health ring math
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const healthDash = health !== null ? (health / 100) * circumference : 0;
    const healthColor = health >= 75 ? '#06b6d4' : health >= 50 ? '#f59e0b' : '#f87171';

    return (
        <div className="max-w-7xl mx-auto py-10 px-6 space-y-10">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white italic">Intelligence Center</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {sessionData ? sessionData.project_name : 'No analysis loaded yet — upload documents to begin.'}
                    </p>
                </div>

                {sessionData && (
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => navigate('/brd-viewer')}
                            className="flex items-center gap-2 px-5 py-3 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-accent/30 hover:scale-105 active:scale-95 transition-all"
                        >
                            <FileText className="w-3.5 h-3.5" /> View BRD <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        {confs.length > 0 && (
                            <button
                                onClick={() => navigate('/conflict-report')}
                                className="flex items-center gap-2 px-5 py-3 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-500/20 transition-all"
                            >
                                <AlertTriangle className="w-3.5 h-3.5" /> {confs.length} Conflicts
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/export')}
                            className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                        >
                            Export BRD
                        </button>
                    </div>
                )}
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {metrics.map((m, i) => (
                    <Stat key={i} {...m} />
                ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Health Score */}
                <div className="xl:col-span-1 bg-white/[0.03] border border-white/8 rounded-2xl p-8 flex flex-col items-center justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">BRD Health Score</p>
                    <div className="relative">
                        <svg width="100" height="100" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                            <circle
                                cx="50" cy="50" r={radius} fill="none"
                                stroke={health !== null ? healthColor : 'transparent'}
                                strokeWidth="8"
                                strokeDasharray={`${healthDash} ${circumference}`}
                                strokeLinecap="round"
                                transform="rotate(-90 50 50)"
                                style={{ transition: 'stroke-dasharray 1s ease' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-white">{health ?? '—'}</span>
                            {health !== null && <span className="text-[9px] text-slate-500 font-black uppercase">/100</span>}
                        </div>
                    </div>
                    <p className="text-xs mt-4 font-medium text-slate-400 text-center">
                        {health === null ? 'Upload documents to generate score' :
                            health >= 75 ? 'Strong — BRD ready for review' :
                                health >= 50 ? 'Moderate — resolve conflicts first' :
                                    'Weak — major conflicts need resolution'}
                    </p>
                </div>

                {/* Recent Requirements */}
                <div className="xl:col-span-2 bg-white/[0.03] border border-white/8 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Extracted Requirements</p>
                        {reqs.length > 0 && (
                            <button onClick={() => navigate('/brd-viewer')} className="text-[10px] text-accent font-black uppercase tracking-widest hover:text-accent/80">
                                View All →
                            </button>
                        )}
                    </div>
                    <div className="space-y-3">
                        {reqs.length > 0 ? reqs.slice(0, 5).map((req, i) => (
                            <div key={i} className="flex gap-4 items-start group">
                                <div className="flex-shrink-0 mt-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${req.label === 'hard_requirement' ? 'bg-accent' : 'bg-slate-600'}`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] text-slate-300 font-medium leading-relaxed group-hover:text-slate-100 transition-colors">
                                        <span className="text-accent/60 text-[9px] font-black uppercase mr-2">[{req.id}]</span>
                                        {(req.canonical_text || req.text || 'Requirement extracted.').slice(0, 100)}
                                        {(req.canonical_text || '').length > 100 ? '...' : ''}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${req.label === 'hard_requirement' ? 'bg-accent/10 text-accent' : 'bg-slate-700 text-slate-400'
                                            }`}>{req.label === 'hard_requirement' ? 'Hard Req' : 'Soft Req'}</span>
                                        {req.priority && <span className="text-[9px] text-slate-600 font-medium">{req.priority}</span>}
                                        <span className="text-[9px] text-slate-600">{req.corroboration_count > 1 ? `${req.corroboration_count} sources` : '1 source'}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-600 text-sm font-medium text-center py-8">
                                No analysis loaded. <button onClick={() => navigate('/upload')} className="text-accent hover:underline">Upload documents →</button>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Conflicts */}
            {confs.length > 0 && (
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5" /> Active Conflicts
                        </p>
                        <button onClick={() => navigate('/conflict-report')} className="text-[10px] text-orange-400 font-black uppercase tracking-widest hover:text-orange-300">
                            View All →
                        </button>
                    </div>
                    <div className="space-y-2">
                        {confs.slice(0, 3).map((c, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm">
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 w-20 text-center flex-shrink-0">
                                    {c.conflict_type || 'scope'}
                                </span>
                                <span className="text-slate-300 text-[11px] truncate">{c.topic?.slice(0, 80)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Project History */}
            {history.length > 0 && (
                <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Project History</p>
                    <div className="space-y-2">
                        {history.slice(0, 5).map((p, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                <div>
                                    <p className="text-sm font-bold text-slate-300">{p.name}</p>
                                    <p className="text-[10px] text-slate-600">{new Date(p.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{
                                        backgroundColor: p.health_score >= 75 ? '#06b6d4' : p.health_score >= 50 ? '#f59e0b' : '#f87171'
                                    }} />
                                    <span className="text-[11px] font-black text-slate-400">{p.health_score}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
