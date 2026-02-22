import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Mail, MessageSquare, Video, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CHANNEL_ICONS = { Email: Mail, Slack: MessageSquare, Meeting: Video };
const AUTHORITY_COLORS = {
    Critical: 'text-red-400 bg-red-500/10 border-red-500/20',
    High: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    Medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    Low: 'text-slate-400 bg-slate-700/30 border-slate-600/20',
};

function deriveAuthority(role) {
    const r = (role || '').toLowerCase();
    if (['ceo', 'cto', 'coo', 'cfo', 'founder', 'board', 'investor'].some(t => r.includes(t))) return 'Critical';
    if (['vp', 'director', 'vice president'].some(t => r.includes(t))) return 'High';
    if (['manager', 'lead', 'senior', 'principal'].some(t => r.includes(t))) return 'Medium';
    return 'Low';
}

function deriveChannels(sources) {
    const channels = new Set();
    sources.forEach(s => {
        const src = (s.source || '').toLowerCase();
        if (src.includes('email') || src.includes('eml') || src.includes('mail')) channels.add('Email');
        else if (src.includes('slack') || src.includes('json')) channels.add('Slack');
        else if (src.includes('meeting') || src.includes('xml') || src.includes('transcript')) channels.add('Meeting');
        else channels.add('Document');
    });
    return Array.from(channels);
}

const StakeholderCard = ({ person, requirements, idx }) => {
    const [expanded, setExpanded] = useState(false);
    const authClass = AUTHORITY_COLORS[person.authority] || AUTHORITY_COLORS.Low;
    const initials = person.sender.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const relatedReqs = requirements.filter(req =>
        (req.sources || []).some(s => s.sender === person.sender)
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden"
        >
            <button
                className="w-full text-left p-5 flex items-center gap-5 hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpanded(e => !e)}
            >
                <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-accent font-black text-sm">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-white">{person.sender}</p>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${authClass}`}>
                            {person.authority}
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{person.role} · {person.channels.join(', ')}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                        <p className="text-lg font-black text-white">{relatedReqs.length}</p>
                        <p className="text-[9px] text-slate-500 uppercase font-bold">reqs</p>
                    </div>
                    {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </div>
            </button>

            <AnimatePresence>
                {expanded && relatedReqs.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 px-5 pb-5"
                    >
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-4 mb-3">Raised Requirements</p>
                        <div className="space-y-2">
                            {relatedReqs.slice(0, 5).map((req, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <span className="text-[9px] text-accent/60 font-mono flex-shrink-0 mt-0.5">{req.id}</span>
                                    <p className="text-[11px] text-slate-400 leading-relaxed">{(req.canonical_text || '').slice(0, 100)}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const StakeholdersPage = () => {
    const navigate = useNavigate();
    const [sessionData, setSessionData] = useState(null);

    useEffect(() => {
        const raw = sessionStorage.getItem('brd_data');
        if (raw) setSessionData(JSON.parse(raw));
    }, []);

    const requirements = sessionData?.requirements || [];

    // Derive stakeholders from requirements sources
    const stakeholderMap = {};
    requirements.forEach(req => {
        (req.sources || []).forEach(src => {
            const name = src.sender;
            if (!name) return;
            if (!stakeholderMap[name]) {
                stakeholderMap[name] = {
                    sender: name,
                    role: src.role || 'Stakeholder',
                    channels: [],
                    allSources: []
                };
            }
            const ch = deriveChannels([src]);
            ch.forEach(c => {
                if (!stakeholderMap[name].channels.includes(c)) stakeholderMap[name].channels.push(c);
            });
            stakeholderMap[name].allSources.push(src);
        });
    });

    const stakeholders = Object.values(stakeholderMap).map(s => ({
        ...s,
        authority: deriveAuthority(s.role),
    })).sort((a, b) => {
        const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        return (order[a.authority] || 3) - (order[b.authority] || 3);
    });

    if (!sessionData) {
        return (
            <div className="max-w-3xl mx-auto py-24 px-6 text-center">
                <p className="text-slate-400 text-xl mb-4">No analysis loaded.</p>
                <button onClick={() => navigate('/upload')} className="px-6 py-3 bg-accent text-white rounded-xl font-black uppercase tracking-wider text-sm">← Upload Documents</button>
            </div>
        );
    }

    const criticalCount = stakeholders.filter(s => s.authority === 'Critical').length;
    const highCount = stakeholders.filter(s => s.authority === 'High').length;

    return (
        <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
            <div>
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs font-black uppercase tracking-widest mb-3 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
                </button>
                <h1 className="text-4xl font-black tracking-tighter text-white italic">Stakeholder Map</h1>
                <p className="text-slate-400 text-sm mt-1">
                    {sessionData.project_name} · {stakeholders.length} identified stakeholders
                </p>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: stakeholders.length, color: 'text-white' },
                    { label: 'Critical', value: criticalCount, color: 'text-red-400' },
                    { label: 'High Authority', value: highCount, color: 'text-orange-400' },
                    { label: 'Requirements', value: requirements.length, color: 'text-accent' },
                ].map((item, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/8 rounded-xl p-4 text-center">
                        <p className={`text-3xl font-black ${item.color}`}>{item.value}</p>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">{item.label}</p>
                    </div>
                ))}
            </div>

            {/* Cards */}
            <div className="space-y-3">
                {stakeholders.length > 0 ? stakeholders.map((person, idx) => (
                    <StakeholderCard key={person.sender} person={person} requirements={requirements} idx={idx} />
                )) : (
                    <div className="text-center py-16 text-slate-500">
                        <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>No stakeholders found in uploaded documents.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StakeholdersPage;
