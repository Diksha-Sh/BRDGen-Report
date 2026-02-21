import React, { useState } from 'react';
import { Search, Filter, Mail, MessageSquare, Video, ExternalLink, ShieldCheck, Download, ChevronRight, Clock, Hash, Zap } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { brdSections, citations as allCitations } from '../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';

const TraceabilityMatrixPage = () => {
    const [selectedCite, setSelectedCite] = useState(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ALL');

    const allReqs = brdSections.flatMap(s => s.requirements || [])
        .filter(r => r.text.toLowerCase().includes(search.toLowerCase()))
        .filter(r => filter === 'ALL' || r.label === filter);

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20 relative">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Traceability <span className="text-accent not-italic">Matrix</span></h1>
                    <p className="text-slate-500 uppercase tracking-[0.3em] text-[10px] font-bold mt-1">Derived from networkx Provenance Graph Traversal</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-accent transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter by keyword..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-3 text-sm text-white focus:outline-none focus:border-accent w-80 transition-all font-medium"
                        />
                    </div>
                    <select
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 focus:outline-none focus:border-accent"
                    >
                        <option value="ALL">All Categories</option>
                        <option value="REQUIREMENT">Functional</option>
                        <option value="CONSTRAINT">Constraints</option>
                        <option value="TIMELINE">Timeline</option>
                    </select>
                </div>
            </div>

            {/* The Matrix Table */}
            <GlassCard padding={false} className="border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5 uppercase tracking-[0.2em] text-[10px] font-black text-slate-500">
                                <th className="px-8 py-6">ID</th>
                                <th className="px-8 py-6">Synthesized Requirement</th>
                                <th className="px-8 py-6">Engine Label</th>
                                <th className="px-8 py-6 text-center">Confidence</th>
                                <th className="px-8 py-6">Original Signal</th>
                                <th className="px-8 py-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {allReqs.map((req, i) => (
                                <motion.tr
                                    key={req.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="group hover:bg-accent/[0.02] transition-colors"
                                >
                                    <td className="px-8 py-7">
                                        <span className="text-[10px] font-black text-accent px-2 py-1 bg-accent/10 rounded border border-accent/20">{req.id}</span>
                                    </td>
                                    <td className="px-8 py-7">
                                        <p className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{req.text.slice(0, 80)}{req.text.length > 80 ? '...' : ''}</p>
                                    </td>
                                    <td className="px-8 py-7">
                                        <span className={`text-[9px] font-black px-2 py-1 rounded-sm uppercase tracking-widest ${req.label === 'CONSTRAINT' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/10' :
                                                req.label === 'TIMELINE' ? 'bg-accent/10 text-accent border border-accent/10' :
                                                    'bg-blue-500/10 text-blue-400 border border-blue-400/10'
                                            }`}>
                                            {req.label}
                                        </span>
                                    </td>
                                    <td className="px-8 py-7 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-12 bg-white/5 h-1 rounded-full overflow-hidden">
                                                <div className="bg-accent h-full" style={{ width: `${Math.round(req.confidence * 100)}%` }} />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 font-mono">{Math.round(req.confidence * 100)}%</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <button
                                            onClick={() => setSelectedCite(allCitations[i % allCitations.length])}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 hover:border-accent transition-all group/btn"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{allCitations[i % allCitations.length].sender.split(' ')[0]}</span>
                                        </button>
                                    </td>
                                    <td className="px-8 py-7 text-right">
                                        <button className="text-slate-600 hover:text-white transition-colors">
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Citation Popup (Page 6) */}
            <AnimatePresence>
                {selectedCite && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedCite(null)}
                            className="absolute inset-0 bg-background/90 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative w-full max-w-2xl"
                        >
                            <GlassCard className="p-0 border-white/10 shadow-[0_0_100px_rgba(6,182,212,0.15)] overflow-hidden">
                                <header className="p-10 border-b border-white/5 bg-accent/5 flex justify-between items-center">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-accent/10 rounded-2xl border border-accent/20 flex items-center justify-center text-accent shadow-lg shadow-accent/10">
                                            {selectedCite.channel.includes('Email') ? <Mail className="w-7 h-7" /> : selectedCite.channel.includes('Slack') ? <MessageSquare className="w-7 h-7" /> : <Video className="w-7 h-7" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Source Provenance</span>
                                                <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                                <span className="text-[10px] font-black text-accent uppercase tracking-widest">{selectedCite.id}</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-white italic tracking-tighter">{selectedCite.channel}</h3>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedCite(null)} className="p-3 hover:bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all">
                                        <Zap className="w-5 h-5" />
                                    </button>
                                </header>

                                <div className="p-12 space-y-10">
                                    <div className="p-10 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                                        <div className="absolute top-6 left-6 text-accent opacity-10 group-hover:opacity-30 transition-opacity"><QuoteLargeIcon className="w-16 h-16" /></div>
                                        <p className="text-xl text-slate-200 leading-relaxed relative z-10 italic font-medium">"{selectedCite.content}"</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] block ml-1">Attribution</label>
                                            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5">
                                                <div className="w-12 h-12 bg-accent/20 border border-accent/30 rounded-xl flex items-center justify-center text-accent font-black italic">{selectedCite.sender?.[0]}</div>
                                                <div>
                                                    <p className="text-sm font-black text-white leading-none mb-1 uppercase tracking-tight">{selectedCite.sender}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black italic">{selectedCite.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] block ml-1">Graph Metadata</label>
                                            <div className="space-y-4 p-5 rounded-2xl bg-white/[0.01] border border-white/5">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                        <Clock className="w-3.5 h-3.5 text-accent" />
                                                        <span>Timestamp</span>
                                                    </div>
                                                    <span className="text-[10px] font-black text-white uppercase">{selectedCite.timestamp.split(' ')[0]}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                        <ShieldCheck className="w-3.5 h-3.5 text-success" />
                                                        <span>Corroboration</span>
                                                    </div>
                                                    <span className="text-[10px] font-black text-success uppercase">{selectedCite.corroboration} Sources</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <footer className="p-10 bg-white/[0.01] border-t border-white/5 flex justify-end gap-4">
                                    <button className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-xl transition-all">Export Trace</button>
                                    <button onClick={() => setSelectedCite(null)} className="px-10 py-3 bg-accent text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl shadow-xl shadow-accent/30 hover:scale-105 transition-all">Close Trace</button>
                                </footer>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const QuoteLargeIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V3L20.017 3C21.1216 3 22.017 3.89543 22.017 5V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM3.983 21L3.983 18C3.983 16.8954 4.87843 16 5.983 16H8.983C9.53528 16 9.983 15.5523 9.983 15V9C9.983 8.44772 9.53528 8 8.983 8H5.983C4.87843 8 3.983 7.10457 3.983 6V3L9.983 3C11.0876 3 11.983 3.89543 11.983 5V15C11.983 18.3137 9.29672 21 5.983 21H3.983Z" /></svg>
);

export default TraceabilityMatrixPage;
