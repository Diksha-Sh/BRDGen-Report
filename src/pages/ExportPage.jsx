import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Clipboard, Mail, FileText, Code, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ExportPage = () => {
    const navigate = useNavigate();
    const [sessionData, setSessionData] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const raw = sessionStorage.getItem('brd_data');
        if (raw) setSessionData(JSON.parse(raw));
    }, []);

    const projectName = sessionData?.project_name || 'BRD Export';
    const brd_sections = sessionData?.brd_sections || {};
    const requirements = sessionData?.requirements || [];
    const conflicts = sessionData?.conflicts || [];

    // ── Build full BRD text ──────────────────────────────────────────────────
    const buildBrdText = () => {
        const lines = [
            `BUSINESS REQUIREMENTS DOCUMENT`,
            `Project: ${projectName}`,
            `Generated: ${new Date().toLocaleDateString()}`,
            `Health Score: ${sessionData?.health_score ?? 'N/A'}%`,
            ``,
            `${'='.repeat(60)}`,
            ``
        ];

        for (const [section, content] of Object.entries(brd_sections)) {
            lines.push(`## ${section.toUpperCase()}`);
            lines.push('');
            lines.push(content || 'No content.');
            lines.push('');
            lines.push(`${'-'.repeat(40)}`);
            lines.push('');
        }

        lines.push('## REQUIREMENTS INDEX');
        lines.push('');
        requirements.forEach(req => {
            lines.push(`[${req.id}] [${req.label?.replace('_', ' ').toUpperCase() || 'REQUIREMENT'}] ${req.canonical_text}`);
            lines.push(`   Sources: ${(req.sources || []).map(s => `${s.sender} (${s.source})`).join(', ')}`);
            lines.push('');
        });

        if (conflicts.length > 0) {
            lines.push('## CONFLICTS');
            lines.push('');
            conflicts.forEach(c => {
                lines.push(`[${c.id}] [${(c.conflict_type || '').toUpperCase()}] ${c.topic}`);
                lines.push(`   ${c.source_a?.sender} vs ${c.source_b?.sender}`);
                lines.push(`   Recommendation: ${c.recommendation}`);
                lines.push('');
            });
        }

        return lines.join('\n');
    };

    const buildPrintHtml = () => {
        const sectionHtml = Object.entries(brd_sections).map(([section, content]) => `
            <h2 style="font-size:14pt;font-weight:bold;margin-top:28px;border-bottom:1px solid #eee;padding-bottom:8px;">${section}</h2>
            <div style="font-size:10pt;line-height:1.8;color:#333;">${(content || '').replace(/\n/g, '<br/>')}</div>
        `).join('');

        return `<!DOCTYPE html>
<html><head>
<title>${projectName} — BRD</title>
<style>
  body { font-family: 'Georgia', serif; max-width: 800px; margin: 40px auto; color: #1a1a1a; }
  h1 { font-size: 22pt; margin-bottom: 4px; }
  .meta { color: #666; font-size: 9pt; margin-bottom: 32px; }
  @media print { body { margin: 20mm; } }
</style>
</head><body>
<h1>${projectName}</h1>
<div class="meta">
  Business Requirements Document · Generated ${new Date().toLocaleDateString()} · 
  Health Score: ${sessionData?.health_score ?? 'N/A'}% · ${requirements.length} Requirements · ${conflicts.length} Conflicts
</div>
${sectionHtml}
</body></html>`;
    };

    // ── Export Handlers ───────────────────────────────────────────────────────
    const exportPDF = () => {
        const win = window.open('', '_blank');
        win.document.write(buildPrintHtml());
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); }, 500);
    };

    const exportText = () => {
        const text = buildBrdText();
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName.replace(/\s+/g, '_')}_BRD.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportJSON = () => {
        const data = JSON.stringify(sessionData, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName.replace(/\s+/g, '_')}_BRD.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(buildBrdText());
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = buildBrdText();
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const emailShare = () => {
        const subject = encodeURIComponent(`BRD: ${projectName}`);
        const topReqs = requirements.slice(0, 5).map(r => `• ${r.canonical_text}`).join('\n');
        const body = encodeURIComponent(
            `Hi,\n\nPlease find the BRD summary for ${projectName} below.\n\n` +
            `Health Score: ${sessionData?.health_score ?? 'N/A'}%\n` +
            `Requirements: ${requirements.length}\nConflicts: ${conflicts.length}\n\n` +
            `TOP REQUIREMENTS:\n${topReqs}\n\n` +
            `(Full BRD available via BRDGen — generated on ${new Date().toLocaleDateString()})`
        );
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    };

    const exportOptions = [
        {
            id: 'pdf',
            label: 'Export PDF',
            desc: 'Opens browser print dialog — save as PDF',
            icon: FileText,
            color: 'text-red-400',
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            action: exportPDF,
            cta: 'Open Print Dialog'
        },
        {
            id: 'word',
            label: 'Export Text / Word',
            desc: 'Plain text — import into Word or Google Docs',
            icon: Download,
            color: 'text-accent',
            bg: 'bg-accent/10',
            border: 'border-accent/20',
            action: exportText,
            cta: 'Download .txt'
        },
        {
            id: 'json',
            label: 'Export JSON',
            desc: 'Full structured data with citations & conflicts',
            icon: Code,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20',
            action: exportJSON,
            cta: 'Download .json'
        },
        {
            id: 'clipboard',
            label: 'Copy to Clipboard',
            desc: 'Paste into Notion, Confluence, or any editor',
            icon: copied ? CheckCircle2 : Clipboard,
            color: copied ? 'text-emerald-400' : 'text-slate-400',
            bg: copied ? 'bg-emerald-500/10' : 'bg-white/5',
            border: copied ? 'border-emerald-500/20' : 'border-white/10',
            action: copyToClipboard,
            cta: copied ? 'Copied!' : 'Copy Text'
        },
        {
            id: 'email',
            label: 'Email Summary',
            desc: 'Opens your email client with BRD summary',
            icon: Mail,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/20',
            action: emailShare,
            cta: 'Open Email Client'
        },
    ];

    return (
        <div className="max-w-3xl mx-auto py-10 px-6 space-y-8">
            {/* Header */}
            <div>
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs font-black uppercase tracking-widest mb-3 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
                </button>
                <h1 className="text-4xl font-black tracking-tighter text-white italic">Export & Share</h1>
                <p className="text-slate-400 text-sm mt-1">
                    {sessionData ? `${projectName} · ${Object.keys(brd_sections).length} sections · ${requirements.length} requirements` : 'No BRD loaded'}
                </p>
            </div>

            {!sessionData && (
                <div className="text-center py-16">
                    <p className="text-slate-500 mb-4">Generate a BRD first before exporting.</p>
                    <button onClick={() => navigate('/upload')} className="px-6 py-3 bg-accent text-white rounded-xl font-black uppercase tracking-wider text-sm">
                        ← Upload Documents
                    </button>
                </div>
            )}

            {sessionData && (
                <div className="space-y-4">
                    {exportOptions.map((opt, i) => {
                        const Icon = opt.icon;
                        return (
                            <motion.div
                                key={opt.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.07 }}
                                className={`p-6 rounded-2xl border ${opt.border} ${opt.bg} flex items-center justify-between gap-6`}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${opt.bg} border ${opt.border}`}>
                                        <Icon className={`w-5 h-5 ${opt.color}`} />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-black ${opt.color}`}>{opt.label}</p>
                                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{opt.desc}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={opt.action}
                                    className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 ${opt.bg} ${opt.border} ${opt.color}`}
                                >
                                    {opt.cta}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ExportPage;
