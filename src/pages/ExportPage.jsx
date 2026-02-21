import { Download, FileText, Share2, Database, Rocket, ExternalLink, Check } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { motion } from 'framer-motion';

const ExportPage = () => {
    const exportOptions = [
        { id: 'pdf', title: 'PDF Document', description: 'Professional BRD with table of contents and full citations.', icon: FileText, color: 'text-red-400' },
        { id: 'word', title: 'Microsoft Word', description: 'Fully editable .docx format with standard BRD styling.', icon: FileText, color: 'text-blue-400' },
        { id: 'notion', title: 'Notion Sync', description: 'Push requirements directly to your Notion workspace.', icon: Share2, color: 'text-slate-300' },
        { id: 'jira', title: 'JIRA Integration', description: 'Create stories and epics directly in your backlog.', icon: Database, color: 'text-blue-500' },
    ];

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Export & Integration</h1>
                <p className="text-slate-400">Distribute your AI-generated intelligence across your stack.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exportOptions.map((opt, i) => (
                    <GlassCard key={opt.id} delay={i * 0.1} className="group cursor-pointer">
                        <div className="flex gap-6">
                            <div className={`w-16 h-16 rounded-2xl bg-white/5 border border-border flex items-center justify-center group-hover:bg-white/10 transition-colors ${opt.color}`}>
                                <opt.icon className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-bold text-white">{opt.title}</h3>
                                    <Download className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
                                </div>
                                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{opt.description}</p>

                                <div className="mt-6 flex items-center gap-4">
                                    <button className="text-[10px] font-bold text-primary uppercase tracking-widest border-b border-primary/30 pb-0.5 hover:border-primary transition-colors">
                                        Standard Export
                                    </button>
                                    <button className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1">
                                        Advanced Settings
                                        <ExternalLink className="w-2.5 h-2.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <GlassCard className="mt-12 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none" />
                <div className="flex flex-col md:flex-row items-center gap-8 py-4">
                    <div className="w-24 h-24 bg-primary-gradient rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/20 shrink-0">
                        <Rocket className="w-12 h-12 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Ready to Finalize Q3_Business_Strategy?</h3>
                        <p className="text-slate-400">This will lock all resolved conflicts and generate a final provenance report for compliance audits.</p>
                    </div>
                    <div className="shrink-0 ml-auto">
                        <button className="btn-primary px-10 py-4 flex items-center gap-3 shadow-xl shadow-primary/30">
                            Finalize & Deploy
                            <Check className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default ExportPage;
