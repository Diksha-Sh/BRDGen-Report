import { NavLink } from 'react-router-dom';
import {
    FileUp,
    Activity,
    LayoutDashboard,
    FileText,
    AlertCircle,
    Search,
    Download,
    Hexagon,
    Users,
    Cpu
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { pipelineStages } from '../data/mockData';

const cn = (...inputs) => twMerge(clsx(inputs));

const navItems = [
    { path: '/upload', icon: FileUp, label: 'Upload' },
    { path: '/processing', icon: Activity, label: 'Processing' },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/brd-viewer', icon: FileText, label: 'BRD Document' },
    { path: '/conflict-report', icon: AlertCircle, label: 'Conflict Report' },
    { path: '/stakeholders', icon: Users, label: 'Stakeholders' },
    { path: '/traceability', icon: Search, label: 'Traceability' },
    { path: '/agents', icon: Cpu, label: 'Agent Portfolio' },
    { path: '/export', icon: Download, label: 'Export' },
];

const Sidebar = () => {
    // Calculate real progress
    const activeStage = pipelineStages.find(s => s.status === 'processing');
    const completedCount = pipelineStages.filter(s => s.status === 'complete').length;
    const progress = Math.round(((completedCount + (activeStage ? 0.5 : 0)) / 9) * 100);

    return (
        <aside className="w-64 bg-surface backdrop-blur-xl border-r border-border flex flex-col z-50">
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                    <Hexagon className="text-white w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-white italic">BRD<span className="text-accent not-italic">Gen</span></h1>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Intelligence Platform</p>
                </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ml-1",
                            isActive
                                ? "bg-accent/10 text-accent border border-accent/20"
                                : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <div className={cn(
                                    "absolute -left-1 w-1 h-6 bg-accent rounded-full opacity-0 transition-opacity",
                                    isActive && "opacity-100"
                                )} />
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium text-sm">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-6 mt-auto space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-border">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pipeline Health</span>
                        <span className="text-[10px] font-black text-accent uppercase tracking-widest">Stage {activeStage ? activeStage.id : (completedCount === 9 ? '9' : '0')} / 9</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-2">
                        <div
                            className="bg-accent h-full transition-all duration-1000 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold italic truncate">
                        {activeStage ? activeStage.label : (completedCount === 9 ? 'Synthesis Finalized' : 'Ready for Signal Ingestion')}
                    </p>
                </div>

                <div className="flex items-center gap-3 pl-2">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Synchronized</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
