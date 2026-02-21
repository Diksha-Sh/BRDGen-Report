import { Search, Filter, Mail, Slack, FileText, ChevronRight, ExternalLink, User, Clock } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const CitationsExplorerPage = () => {
    const citations = [
        { id: 'CIT-1', source: 'Email_Thread_CEO.msg', sender: 'Sarah Connor', channel: 'Executive Management', timestamp: '2023-11-20 09:42', content: 'Our primary goal for the Q3 strategy must be the integration of decentralized auth...' },
        { id: 'CIT-2', source: 'Slack_Log_#dev-ops.json', sender: 'John Smith', channel: '#dev-ops', timestamp: '2023-11-21 14:15', content: 'We should probably stick to OAuth2.1 for the new service to ensure future-proofing.' },
        { id: 'CIT-3', source: 'Meeting_Notes_Architecture.docx', sender: 'Mike Ross', channel: 'Tech Review Board', timestamp: '2023-11-18 11:00', content: 'The scalability requirement is at least 100k concurrent users.' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Citations Explorer</h1>
                    <p className="text-slate-400">Trace every requirement back to its specific source node and author.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search citations..."
                            className="bg-white/5 border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary w-64"
                        />
                    </div>
                    <button className="p-2 bg-white/5 border border-border rounded-xl text-slate-400 hover:text-white transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {citations.map((cite, i) => (
                    <GlassCard key={i} padding={false} className="group">
                        <div className="flex flex-col lg:flex-row">
                            <div className="p-6 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-border bg-white/[0.01]">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center">
                                        {cite.source.includes('Email') && <Mail className="w-4 h-4 text-blue-400" />}
                                        {cite.source.includes('Slack') && <Slack className="w-4 h-4 text-purple-400" />}
                                        {cite.source.includes('Meeting') && <FileText className="w-4 h-4 text-teal-400" />}
                                    </div>
                                    <span className="text-xs font-bold text-white truncate max-w-[150px]">{cite.source}</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <User className="w-3.5 h-3.5 text-slate-500" />
                                        <span className="text-xs text-slate-400">{cite.sender}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-3.5 h-3.5 text-slate-500" />
                                        <span className="text-xs text-slate-400">{cite.channel}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                                        <span className="text-xs text-slate-400">{cite.timestamp}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded uppercase tracking-wider">{cite.id}</span>
                                        <button className="text-[10px] font-bold text-slate-500 hover:text-white flex items-center gap-1 uppercase tracking-widest">
                                            View Source Node
                                            <ExternalLink className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <p className="text-slate-300 italic leading-relaxed">"{cite.content}"</p>
                                </div>

                                <div className="mt-6 flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Linked to:</span>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-0.5 bg-white/5 border border-border rounded text-[10px] font-mono text-slate-400">REQ-101</span>
                                        <span className="px-2 py-0.5 bg-white/5 border border-border rounded text-[10px] font-mono text-slate-400">REQ-402</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};

const Shield = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
);

export default CitationsExplorerPage;
