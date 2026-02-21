import { FileText, Search, AlertCircle, CheckCircle, ChevronRight, Bookmark } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { brdSections } from '../data/mockData';

const BRDViewerPage = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Navigation Outline */}
            <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-4">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-2">Document Outline</h3>
                    <nav className="space-y-1">
                        {brdSections.map((section) => (
                            <button
                                key={section.id}
                                className="w-full text-left px-4 py-2 rounded-lg text-sm transition-colors text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-2 group"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-primary transition-colors" />
                                {section.title}
                            </button>
                        ))}
                    </nav>

                    <GlassCard className="mt-8 bg-primary/5 border-primary/20">
                        <div className="flex items-center gap-2 text-primary mb-2">
                            <Bookmark className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">AI Insight</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            This document was synthesized from 12 separate communication threads with 94% confidence.
                        </p>
                    </GlassCard>
                </div>
            </div>

            {/* Document Content */}
            <div className="lg:col-span-3 space-y-8">
                <GlassCard padding={false} className="overflow-visible">
                    <div className="p-8 border-b border-border flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <FileText className="text-primary w-6 h-6" />
                            Business Requirements Document
                        </h1>
                        <div className="flex gap-3">
                            <span className="px-3 py-1 bg-success/10 text-success text-[10px] font-bold rounded-full border border-success/20 uppercase">Version 1.2</span>
                            <span className="px-3 py-1 bg-white/5 text-slate-400 text-[10px] font-bold rounded-full border border-border uppercase">Draft</span>
                        </div>
                    </div>

                    <div className="p-8 space-y-12">
                        {brdSections.map((section) => (
                            <section key={section.id} id={section.id} className="space-y-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="text-primary opacity-50 font-mono text-sm">0{section.id.split('-')[1]}.</span>
                                    {section.title}
                                </h2>

                                {section.content && (
                                    <p className="text-slate-400 leading-relaxed text-lg">
                                        {section.content}
                                    </p>
                                )}

                                {section.requirements && (
                                    <div className="space-y-4">
                                        {section.requirements.map((req) => (
                                            <div key={req.id} className="group relative p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] font-bold font-mono text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                                        {req.id}
                                                    </span>
                                                    {req.status === 'verified' && <CheckCircle className="w-4 h-4 text-success" />}
                                                    {req.status === 'processing' && <LoaderPulse />}
                                                    {req.status === 'conflict' && <AlertCircle className="w-4 h-4 text-conflict" />}
                                                </div>
                                                <p className="text-slate-200 pr-24">{req.text}</p>

                                                {/* Inline Citations */}
                                                <button className="mt-3 flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-widest">
                                                    <Search className="w-3 h-3" />
                                                    Source: {req.source}
                                                </button>

                                                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-1.5 hover:bg-white/10 rounded-md text-slate-400" title="Add Note">
                                                        <FileText className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

const LoaderPulse = () => (
    <div className="flex gap-1">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
    </div>
);

export default BRDViewerPage;
