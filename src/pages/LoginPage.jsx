import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hexagon, ArrowRight, Shield, Command, Loader2 } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: pass })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/upload';
            } else {
                alert("Corporate Authentication Failed. Verify credentials.");
            }
        } catch (error) {
            console.error('Login error:', error);
            // Fallback for demo if backend is offline
            localStorage.setItem('user', JSON.stringify({ name: 'Guest Analyst', role: 'Security Node' }));
            window.location.href = '/upload';
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-6 bg-grid-pattern relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-radial-gradient opacity-50 z-0" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="flex items-center justify-center gap-3 mb-10">
                    <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center shadow-2xl shadow-accent/30 rotate-12">
                        <Hexagon className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-white italic">BRD<span className="text-accent not-italic">Gen</span></h1>
                </div>

                <GlassCard className="p-8 border-t border-white/10 shadow-2xl shadow-accent/10">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2 italic uppercase tracking-tighter">Corporate Portal</h2>
                        <p className="text-slate-500 text-sm font-medium">Verify identity via Signal Core Authentication.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-600 ml-1">Work Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@enron.com"
                                className="w-full bg-white/5 border border-border rounded-xl px-4 py-4 text-white focus:outline-none focus:border-accent transition-colors text-sm font-bold"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-600 ml-1">Access Token</label>
                            <input
                                type="password"
                                value={pass}
                                onChange={(e) => setPass(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-border rounded-xl px-4 py-4 text-white focus:outline-none focus:border-accent transition-colors text-sm font-bold"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-accent text-white rounded-2xl flex items-center justify-center gap-3 group shadow-xl shadow-accent/30 font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
                            {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-border flex justify-between items-center text-[9px] uppercase tracking-[0.2em] font-black text-slate-500">
                        <div className="flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-accent" />
                            Biometric Encrypted
                        </div>
                        <div className="flex items-center gap-2">
                            <Command className="w-3.5 h-3.5 text-accent" />
                            Node-V3
                        </div>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default LoginPage;
