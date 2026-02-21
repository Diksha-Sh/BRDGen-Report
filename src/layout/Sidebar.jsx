import { NavLink } from 'react-router-dom';
import {
    FileUp,
    Activity,
    LayoutDashboard,
    FileText,
    AlertCircle,
    Search,
    Download,
    Hexagon
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const navItems = [
    { path: '/upload', icon: FileUp, label: 'Upload' },
    { path: '/processing', icon: Activity, label: 'Processing' },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/brd-viewer', icon: FileText, label: 'BRD Viewer' },
    { path: '/conflict-center', icon: AlertCircle, label: 'Conflict Center' },
    { path: '/citations', icon: Search, label: 'Citations' },
    { path: '/export', icon: Download, label: 'Export' },
];

const Sidebar = () => {
    return (
        <aside className="w-64 bg-surface backdrop-blur-xl border-r border-border flex flex-col z-50">
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-gradient rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Hexagon className="text-white w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-white">BRD<span className="text-primary">Gen</span></h1>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Intelligence Platform</p>
                </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                            isActive
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                        {/* Active Glow Effect */}
                        <NavLink to={item.path} className={({ isActive }) => cn(
                            "absolute left-0 w-1 h-6 bg-primary rounded-full opacity-0 transition-opacity",
                            isActive && "opacity-100"
                        )} />
                    </NavLink>
                ))}
            </nav>

            <div className="p-6 mt-auto">
                <div className="p-4 rounded-2xl bg-white/5 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                        <span className="text-xs font-semibold text-slate-300">System Status</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Pipeline active: 100% operational</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
