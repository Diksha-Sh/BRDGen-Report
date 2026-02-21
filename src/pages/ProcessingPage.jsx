import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, Sparkles, Database, Search, GitBranch, FileText } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { pipelineStages } from '../data/mockData';

const iconMap = {
    ingestion: Database,
    extraction: Search,
    conflict: GitBranch,
    provenance: Sparkles,
    generation: FileText,
};

const ProcessingPage = () => {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Analysis Pipeline</h1>
                <p className="text-slate-400">Multi-stage NLP engine is synthesizing your business communication sources.</p>
            </div>

            <div className="relative">
                {/* Connection Line */}
                <div className="absolute left-[39px] top-10 bottom-10 w-0.5 bg-border z-0" />

                <div className="space-y-6 relative z-10">
                    {pipelineStages.map((stage, index) => {
                        const Icon = iconMap[stage.id];
                        return (
                            <GlassCard key={stage.id} delay={index * 0.1} padding={false} className="flex overflow-visible">
                                <div className="flex-1 flex gap-6 p-6">
                                    <div className="relative">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 ${stage.status === 'complete' ? 'bg-success/10 border-success/30 text-success' :
                                                stage.status === 'processing' ? 'bg-primary/10 border-primary/30 text-primary shadow-lg shadow-primary/20' :
                                                    'bg-surface border-border text-slate-500'
                                            }`}>
                                            {stage.status === 'complete' ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                                            {stage.status === 'processing' && (
                                                <motion.div
                                                    className="absolute inset-0 rounded-xl border border-primary"
                                                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold text-white flex items-center gap-2">
                                                    {stage.label}
                                                    {stage.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                                                </h3>
                                                <p className="text-sm text-slate-500">{stage.description}</p>
                                            </div>
                                            <span className={`text-xs font-bold uppercase tracking-widest ${stage.status === 'complete' ? 'text-success' :
                                                    stage.status === 'processing' ? 'text-primary' :
                                                        'text-slate-600'
                                                }`}>
                                                {stage.status === 'complete' ? 'Success' :
                                                    stage.status === 'processing' ? `${stage.progress}%` :
                                                        'Waiting'}
                                            </span>
                                        </div>

                                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${stage.progress}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className={`h-full rounded-full ${stage.status === 'complete' ? 'bg-success' : 'bg-primary'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-center pt-8">
                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className={`btn-primary px-12 py-4 flex items-center gap-2 group transition-all ${pipelineStages.some(s => s.status === 'processing') ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    View Generated Intelligence
                    <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        <GitBranch className="w-4 h-4" />
                    </motion.div>
                </button>
            </div>
        </div>
    );
};

export default ProcessingPage;
