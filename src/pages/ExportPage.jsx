import React, { useState } from 'react';
import { Download, FileText, Share2, Database, Rocket, ExternalLink, Check, Mail, Send, CheckCircle2 } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { motion } from 'framer-motion';

const ExportPage = () => {
    const [email, setEmail] = useState('');
    const [isSent, setIsSent] = useState(false);

    const exportOptions = [
        { id: 'pdf', title: 'PDF Document', description: 'Corporate formatted BRD with full traceability index and digital signatures.', icon: FileText, color: 'text-red-400' },
        { id: 'word', title: 'Microsoft Word', description: 'Editable .docx format optimized for legacy review workflows.', icon: FileText, color: 'text-blue-400' },
        { id: 'jira', title: 'JIRA Integration', description: 'Push requirements as stories/epics directly to your project backlog.', icon: Database, color: 'text-blue-500' },
        { id: 'notion', title: 'Notion Sync', description: 'Export to dynamic Notion database with linked citation properties.', icon: Share2, color: 'text-slate-300' },
    ];

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <div className="mb-12">
                <h1 className="text-3xl font-black text-white italic tracking-tighter">Export <span className="text-accent not-italic">& Handoff</span></h1>
                <p className="text-slate-500 uppercase tracking-[0.3em] text-[10px] font-bold mt-1">Deploy Synthesized Intelligence to Your Stakeholders</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left: Preview Thumbnail */}
                <div className="lg:col-span-5">
                    <div className="sticky top-8 space-y-8">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-accent/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="aspect-[3/4] bg-[#1a1a1f] rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl">
                                <div className="absolute top-0 w-full h-1 bg-accent shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
                                <div className="p-12 space-y-8 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <div className="flex justify-between items-center opacity-40">
                                        <div className="w-8 h-8 bg-white/10 rounded" />
                                        <div className="w-24 h-2 bg-white/10 rounded" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="w-full h-8 bg-white/10 rounded-lg" />
                                        <div className="w-2/3 h-8 bg-white/10 rounded-lg" />
                                    </div>
                                    <div className="space-y-3 pt-12">
                                        {[1, 2, 3, 4, 5, 6].map(i => (
                                            <div key={i} className="flex gap-4 items-center">
                                                <div className="w-4 h-4 rounded-sm bg-accent/20 border border-accent/30" />
                                                <div className={`h-2 bg-white/5 rounded-full ${i % 2 === 0 ? 'w-full' : 'w-4/5'}`} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end opacity-20">
                                        <div className="w-16 h-16 border-2 border-white/10 rounded-lg" />
                                        <div className="text-right space-y-1">
                                            <div className="w-20 h-2 bg-white/10 rounded ml-auto" />
                                            <div className="w-12 h-2 bg-white/10 rounded ml-auto" />
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] via-transparent to-transparent" />
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Document Preview</span>
                                </div>
                            </div>
                        </div>

                        <GlassCard className="border-accent/20 bg-accent/[0.02]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center text-accent">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-tight italic">Quality Guaranteed</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Cross-referenced against 1,240 signal nodes.</p>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>

                {/* Right: Export Options */}
                <div className="lg:col-span-7 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {exportOptions.map((opt, i) => (
                            <motion.div key={opt.id} whileHover={{ y: -5 }}>
                                <GlassCard className="group cursor-pointer border-white/5 hover:border-accent/40 h-full flex flex-col transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-accent/10 group-hover:border-accent/20 group-hover:text-accent transition-all ${opt.color}`}>
                                            <opt.icon className="w-8 h-8" />
                                        </div>
                                        <Download className="w-5 h-5 text-slate-700 group-hover:text-accent transition-colors" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-3 italic tracking-tight">{opt.title}</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium mb-8 flex-1">{opt.description}</p>
                                    <button className="w-full py-3 bg-white/5 group-hover:bg-accent group-hover:text-white border border-white/10 group-hover:border-accent text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 rounded-xl transition-all">
                                        Export Now
                                    </button>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>

                    {/* Email Input Column (Bottom) */}
                    <div className="pt-8 space-y-6">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Collaborative Handoff</label>
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                                <input
                                    type="email"
                                    placeholder="Enter colleague's email address..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-8 py-5 text-white font-medium focus:outline-none focus:border-accent transition-all"
                                />
                            </div>
                            <button
                                onClick={() => { setIsSent(true); setTimeout(() => setIsSent(false), 3000) }}
                                className={`px-10 py-5 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-[0.2em] transition-all ${isSent ? 'bg-success text-white' : 'bg-accent text-white shadow-xl shadow-accent/20 hover:scale-105 active:scale-95'}`}
                            >
                                {isSent ? 'Sent!' : 'Send Access'}
                                {isSent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportPage;
