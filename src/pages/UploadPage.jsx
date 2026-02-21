import { useState } from 'react';
import { Upload, File, Slack, Mail, Trash2, Plus } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

const UploadPage = () => {
    const [projectName, setProjectName] = useState('New BRD Project');
    const [sources, setSources] = useState([
        { id: 1, type: 'mail', name: 'Q3_Strategy_Meeting.msg', size: '1.2 MB', status: 'ready' },
        { id: 2, type: 'slack', name: '#product-roadmap-threads.json', size: '450 KB', status: 'ready' },
    ]);

    const addSource = (type) => {
        const names = {
            mail: 'Email_Thread_Archive.pst',
            slack: 'Slack_Export_General.json',
            file: 'Business_Requirements_V1.docx'
        };
        setSources([...sources, {
            id: Date.now(),
            type,
            name: names[type],
            size: '2.1 MB',
            status: 'pending'
        }]);
    };

    const removeSource = (id) => {
        setSources(sources.filter(s => s.id !== id));
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Initialize Project</h1>
                <p className="text-slate-400">Identify project scope and ingest communication sources for AI analysis.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Project Info */}
                <div className="lg:col-span-1">
                    <GlassCard className="h-full">
                        <h3 className="text-lg font-semibold text-white mb-6">Project Metadata</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Project Name</label>
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="w-full mt-2 bg-white/5 border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Industry Vertical</label>
                                <select className="w-full mt-2 bg-white/5 border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none">
                                    <option>Fintech / Banking</option>
                                    <option>Healthcare</option>
                                    <option>E-commerce</option>
                                    <option>SaaS / Tech</option>
                                </select>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Source Ingestion */}
                <div className="lg:col-span-2">
                    <GlassCard className="h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-white">Source Ingestion</h3>
                            <div className="flex gap-2">
                                <button onClick={() => addSource('mail')} className="p-2 bg-white/5 hover:bg-white/10 border border-border rounded-lg text-slate-300 transition-colors" title="Add Email Source">
                                    <Mail className="w-4 h-4" />
                                </button>
                                <button onClick={() => addSource('slack')} className="p-2 bg-white/5 hover:bg-white/10 border border-border rounded-lg text-slate-300 transition-colors" title="Add Slack Source">
                                    <Slack className="w-4 h-4" />
                                </button>
                                <button onClick={() => addSource('file')} className="p-2 bg-white/5 hover:bg-white/10 border border-border rounded-lg text-slate-300 transition-colors" title="Add File Source">
                                    <File className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-colors cursor-pointer mb-8">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-primary" />
                            </div>
                            <p className="text-white font-medium">Drop requirement sources here</p>
                            <p className="text-sm text-slate-500 mt-1">Accepts .pst, .json, .pdf, .docx, .msg</p>
                        </div>

                        <div className="space-y-3">
                            <AnimatePresence>
                                {sources.map((source) => (
                                    <motion.div
                                        key={source.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-border"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-surface border border-border rounded-lg flex items-center justify-center">
                                                {source.type === 'mail' && <Mail className="w-5 h-5 text-blue-400" />}
                                                {source.type === 'slack' && <Slack className="w-5 h-5 text-purple-400" />}
                                                {source.type === 'file' && <File className="w-5 h-5 text-teal-400" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{source.name}</p>
                                                <p className="text-xs text-slate-500">{source.size}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => removeSource(source.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => window.location.href = '/processing'}
                                className="btn-primary flex items-center gap-2 px-8 py-3"
                            >
                                Start Analysis Pipeline
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default UploadPage;
