import { Bell, User, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation();
    const path = location.pathname.split('/').filter(Boolean)[0] || 'Dashboard';
    const formattedPath = path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return (
        <header className="h-20 border-b border-border bg-background/50 backdrop-blur-md px-8 flex items-center justify-between z-40">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">Projects</span>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                    <span className="text-white font-medium">Q3_Business_Strategy</span>
                </div>
                <div className="h-4 w-[1px] bg-border" />
                <h2 className="text-lg font-semibold text-white">{formattedPath}</h2>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-border">
                    <div className="text-right">
                        <p className="text-sm font-medium text-white">Alex Rivera</p>
                        <p className="text-[10px] text-slate-500">Project Manager</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-primary font-bold">
                        AR
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
