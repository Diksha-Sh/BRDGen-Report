import React from 'react';
import { User, Shield, MessageSquare, Mail, Video, Zap, Activity, Filter, Search } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { stakeholders } from '../data/mockData';
import { motion } from 'framer-motion';

const StakeholdersPage = () => {
    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tighter">Stakeholder <span className="text-accent not-italic">Analysis</span></h1>
                    <p className="text-slate-500 uppercase tracking-[0.3em] text-[10px] font-bold mt-1">Identified via rapidfuzz Entity Resolution Engine</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Find stakeholder..."
                            className="bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-3 text-sm text-white focus:outline-none focus:border-accent w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stakeholders.map((person, i) => {
                    // Authority-based colors
                    const colorMap = {
                        'Critical': { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-500', role: 'Executive' },
                        'High': { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500', role: 'Manager' },
                        'Medium': { bg: 'bg-accent/10', border: 'border-accent/20', text: 'text-accent', role: 'Senior' },
                        'Low': { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-500', role: 'Developer' }
                    };
                    const style = colorMap[person.authority] || colorMap['Low'];

                    return (
                        <motion.div
                            key={person.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <GlassCard className={`relative group h-full flex flex-col ${style.border}`}>
                                <header className="flex justify-between items-start mb-6">
                                    <div className={`w-14 h-14 rounded-2xl ${style.bg} border ${style.border} flex items-center justify-center text-xl font-black ${style.text} italic`}>
                                        {person.initial}
                                    </div>
                                    <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${style.bg} ${style.text} border ${style.border}`}>
                                        Level {person.authority === 'Critical' ? 5 : person.authority === 'High' ? 4 : person.authority === 'Medium' ? 3 : 2}
                                    </div>
                                </header>

                                <div className="space-y-1 mb-6">
                                    <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors italic tracking-tighter">{person.name}</h3>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] font-mono ${style.text}`}>{person.role}</p>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Digital Footprint</p>
                                        <div className="flex gap-2">
                                            {person.channels.map((ch, idx) => (
                                                <div key={idx} className="p-2 bg-white/5 border border-white/5 rounded-lg text-slate-400 group-hover:text-white transition-colors">
                                                    {ch === 'Email' ? <Mail className="w-3 h-3" /> : ch === 'Slack' ? <MessageSquare className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Aliases / Handlers</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {[person.name.split(' ')[0], person.initial, person.name.toLowerCase().replace(' ', '.')].map((alias, idx) => (
                                                <span key={idx} className="px-2 py-0.5 bg-white/[0.03] rounded border border-white/5 text-[9px] font-bold text-slate-500 group-hover:text-slate-300 transition-colors">{alias}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <footer className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Activity className={`w-3 h-3 ${style.text}`} />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">42 Signals</span>
                                    </div>
                                    <button className="text-white hover:text-accent transition-colors">
                                        <Shield className="w-3.5 h-3.5" />
                                    </button>
                                </footer>

                                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 ${style.bg} blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                            </GlassCard>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default StakeholdersPage;
