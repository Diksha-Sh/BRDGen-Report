import { Bell, User, ChevronRight, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
    const location = useLocation();
    const [user, setUser] = useState({ name: 'Guest User', role: 'Viewer' });
    const [showNotifications, setShowNotifications] = useState(false);

    const path = location.pathname.split('/').filter(Boolean)[0] || 'Dashboard';
    const formattedPath = path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const notifications = [
        { id: 1, title: 'Pipeline Phase Complete', desc: 'Signal Ingestion has successfully indexed 1.2M nodes.', time: '2m ago' },
        { id: 2, title: 'High Confidence Conflict', desc: 'GPT-4o identified a numerical mismatch in Westgate budget.', time: '15m ago' },
        { id: 3, title: 'New Stakeholder Found', desc: 'Identity Table updated with 4 new aliases for Phillip Allen.', time: '1h ago' },
    ];

    return (
        <header className="h-20 border-b border-border bg-background/50 backdrop-blur-md px-8 flex items-center justify-between z-[60] relative">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>Projects</span>
                    <ChevronRight className="w-3 h-3 text-slate-700" />
                    <span className="text-white">Q3_Business_Strategy</span>
                </div>
                <div className="h-4 w-[1px] bg-white/10" />
                <h2 className="text-lg font-black text-white italic tracking-tight">{formattedPath}</h2>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2 rounded-xl transition-all ${showNotifications ? 'bg-accent/10 text-accent' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-background shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="absolute right-0 mt-4 w-96 bg-[#1a1a1f] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden z-[70]"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Corporate Intelligence Alerts</h3>
                                    <button onClick={() => setShowNotifications(false)}><X className="w-4 h-4 text-slate-500" /></button>
                                </div>
                                <div className="space-y-4">
                                    {notifications.map((n) => (
                                        <div key={n.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group cursor-pointer">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-[11px] font-black text-accent uppercase tracking-widest">{n.title}</h4>
                                                <span className="text-[9px] text-slate-600 font-bold">{n.time}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed group-hover:text-slate-200">{n.desc}</p>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-slate-500 transition-all rounded-lg">Mark All as Read</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                    <div className="text-right">
                        <p className="text-sm font-black text-white italic leading-none mb-1">{user.name}</p>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">{user.role}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-black italic shadow-lg shadow-accent/10">
                        {user.name.charAt(0)}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
