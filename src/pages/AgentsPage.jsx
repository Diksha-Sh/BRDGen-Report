import React from 'react';
import { Cpu, Database, Network, Zap, Shield, Search, BookOpen, Layers } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { motion } from 'framer-motion';

const AgentsPage = () => {
    const agents = [
        {
            name: "BART Zero-Shot Classifier",
            id: "facebook/bart-large-mnli",
            job: "Classifies every sentence from emails and meetings into 8 labels (REQUIREMENT, CONSTRAINT, etc.)",
            tech: "Pre-trained Natural Language Inference (NLI)",
            stage: "Stage 4",
            dataset: "BooksCorpus, English Wikipedia, MultiNLI (433k sentence pairs), CNN/DailyMail",
            icon: Cpu,
            color: "text-blue-400"
        },
        {
            name: "MiniLM Sentence Transformer",
            id: "all-MiniLM-L6-v2",
            job: "Converts sentences into 384-dimensional vectors to capture mathematical meaning.",
            tech: "Semantic Equivalence Detection",
            stage: "Stage 5",
            dataset: "1 Billion sentence pairs, MS MARCO (8.8M passages), Reddit, Wikipedia",
            icon: Network,
            color: "text-accent"
        },
        {
            name: "BERTopic Clustering",
            id: "BERTopic + HDBSCAN",
            job: "Discovers topic clusters (Auth, UI, Performance) automatically without predefined counts.",
            tech: "Hierarchical Density-Based Clustering",
            stage: "Stage 5",
            dataset: "Uses MiniLM embeddings as raw input features",
            icon: Layers,
            color: "text-purple-400"
        },
        {
            name: "GPT-4o Intelligence Core",
            id: "OpenAI GPT-4o",
            job: "Semantic equivalence classification, conflict analysis, and professional BRD prose synthesis.",
            tech: "Large Language Model (LLM)",
            stage: "Stages 6, 7, 9",
            dataset: "Internet Scale Data (Books, Wiki, Code) + Human Feedback (RLHF)",
            icon: Zap,
            color: "text-orange-400"
        },
        {
            name: "rapidfuzz Entity Resolver",
            id: "Levenshtein Distance Engine",
            job: "Matches 'John K.' in email to 'John' in Slack to resolve canonical stakeholder identities.",
            tech: "Fuzzy String Similarity Algorithm",
            stage: "Stage 3",
            dataset: "Pure mathematical algorithm - no training required",
            icon: Search,
            color: "text-green-400"
        }
    ];

    const datasets = [
        { name: "Enron Email Dataset", source: "Kaggle", usage: "Email channel simulation (500,000 corporate emails)", icon: BookOpen },
        { name: "Meeting Transcripts", source: "Kaggle", usage: "Meeting channel simulation (6,892 transcripts)", icon: BookOpen },
        { name: "AMI Meeting Corpus", source: "HuggingFace", usage: "Evaluation data for precision/recall benchmarking", icon: BookOpen }
    ];

    return (
        <div className="space-y-12 max-w-7xl mx-auto pb-20">
            <div>
                <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Intelligence <span className="text-accent not-italic">Portfolio</span></h1>
                <p className="text-slate-500 uppercase tracking-[0.3em] text-[10px] font-bold mt-1">Underlying AI Agents & Dataset Architecture</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {agents.map((agent, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <GlassCard className="h-full border-white/5 hover:border-accent/20 transition-all flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 ${agent.color}`}>
                                    <agent.icon className="w-8 h-8" />
                                </div>
                                <span className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-black text-accent uppercase tracking-widest">{agent.stage}</span>
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{agent.name}</h3>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{agent.id}</p>
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed font-medium">"{agent.job}"</p>

                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Architecture</p>
                                        <p className="text-[11px] text-white font-bold">{agent.tech}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Pre-trained on</p>
                                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{agent.dataset}</p>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            <div className="pt-12 border-t border-white/5">
                <h2 className="text-xs font-black text-white uppercase tracking-[0.4em] mb-10 text-center">Inertial Signal Datasets</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {datasets.map((db, i) => (
                        <GlassCard key={i} className="bg-white/[0.01] border-white/5 group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-accent transition-colors">
                                    <db.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white transition-colors group-hover:text-accent">{db.name}</h4>
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{db.source}</span>
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{db.usage}</p>
                        </GlassCard>
                    ))}
                </div>
            </div>

            <GlassCard className="bg-accent/5 border-accent/20">
                <div className="flex gap-6 items-center">
                    <div className="bg-accent p-4 rounded-2xl shadow-xl shadow-accent/20">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-tight">Original Pipeline Contribution</h3>
                        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
                            The innovation lies in the <span className="text-white font-bold italic">Architecture of Provenance</span> — choreographing data flow from ingestion through NLI classification and semantic mapping while maintaining 100% traceability to the original corporate signal.
                        </p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default AgentsPage;
