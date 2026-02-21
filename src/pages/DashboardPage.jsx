import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, AlertTriangle, CheckCircle, Activity, TrendingUp, Search } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { metricsData, healthScore } from '../data/mockData';
import { motion } from 'framer-motion';

const DashboardPage = () => {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Intelligence Dashboard</h1>
                <p className="text-slate-400">Real-time quality metrics and requirement synthesis status.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Health Score', value: `${healthScore}%`, icon: Shield, color: 'text-success' },
                    { label: 'Conflicts', value: '12', icon: AlertTriangle, color: 'text-conflict' },
                    { label: 'Citations', value: '142', icon: Search, color: 'text-primary' },
                    { label: 'Confidence', value: '94%', icon: TrendingUp, color: 'text-accent' },
                ].map((stat, i) => (
                    <GlassCard key={i} delay={i * 0.1}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl bg-white/5 border border-border ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2">
                    <GlassCard className="h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-white">Extraction Frequency</h3>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-border rounded-lg text-xs text-slate-400">
                                <Activity className="w-3 h-3" />
                                Live Feed
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={metricsData}>
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e1e24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                </div>

                {/* Health Indicator */}
                <div className="lg:col-span-1">
                    <GlassCard className="h-full flex flex-col items-center justify-center text-center">
                        <h3 className="text-lg font-semibold text-white mb-8">BRD Quality Index</h3>
                        <div className="relative w-48 h-48 mb-6">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="96" cy="96" r="80"
                                    stroke="currentColor" strokeWidth="12" fill="transparent"
                                    className="text-white/5"
                                />
                                <motion.circle
                                    cx="96" cy="96" r="80"
                                    stroke="currentColor" strokeWidth="12" fill="transparent"
                                    strokeDasharray={502.4}
                                    initial={{ strokeDashoffset: 502.4 }}
                                    animate={{ strokeDashoffset: 502.4 - (502.4 * healthScore) / 100 }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                    className="text-primary"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-white">{healthScore}%</span>
                                <span className="text-xs text-slate-500 font-medium">OPTIMAL</span>
                            </div>
                        </div>
                        <div className="space-y-3 w-full">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Consistency</span>
                                <span className="text-success font-medium">92%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Traceability</span>
                                <span className="text-primary font-medium">85%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Conflict Resol.</span>
                                <span className="text-warning font-medium">74%</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
