import React, { useState, useRef } from 'react';
import { Mail, Video, MessageSquare, Hexagon, ArrowRight, CheckCircle2, FileText, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

const UploadPage = () => {
    const [projectName, setProjectName] = useState('');
    const [files, setFiles] = useState({
        emails: null,
        transcripts: null,
        slack: null,
        pdf: null
    });
    const [isUploading, setIsUploading] = useState(false);

    const emailInputRef = useRef(null);
    const transcriptInputRef = useRef(null);
    const slackInputRef = useRef(null);
    const pdfInputRef = useRef(null);

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [type]: file }));
        }
    };

    const handleGenerate = async () => {
        if (!projectName) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append('project_name', projectName);
        if (files.emails) formData.append('email_file', files.emails);
        if (files.transcripts) formData.append('transcript_file', files.transcripts);
        if (files.slack) formData.append('slack_file', files.slack);
        if (files.pdf) formData.append('pdf_file', files.pdf);

        try {
            const uploadRes = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formData
            });

            if (uploadRes.ok) {
                await fetch('http://localhost:8000/run-pipeline', { method: 'POST' });
                window.location.href = '/processing';
            }
        } catch (error) {
            console.error('Pipeline error:', error);
            window.location.href = '/processing';
        } finally {
            setIsUploading(false);
        }
    };

    const isReady = projectName && (files.emails || files.transcripts || files.slack || files.pdf);

    return (
        <div className="max-w-7xl mx-auto py-12 px-6">
            <header className="text-center mb-16 space-y-4">
                <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-2xl shadow-accent/30 rotate-3">
                        <Hexagon className="text-white w-10 h-10" />
                    </div>
                    <div className="text-left">
                        <h1 className="text-5xl font-black tracking-tighter text-white italic leading-none">BRD<span className="text-accent not-italic">Gen</span></h1>
                        <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold mt-1">Enterprise Requirements Intelligence</p>
                    </div>
                </div>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
                    Upload corporate signal streams & PDF idea logs for autonomous synthesis.
                </p>
            </header>

            <div className="max-w-lg mx-auto mb-16 relative">
                <label className="absolute -top-2.5 left-4 bg-background px-2 text-[10px] font-black uppercase tracking-widest text-accent z-10">Project Identity</label>
                <input
                    type="text"
                    placeholder="Enter project name..."
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-lg focus:outline-none focus:border-accent transition-all shadow-inner font-bold"
                />
            </div>

            {/* Hidden Inputs */}
            <input type="file" ref={emailInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'emails')} />
            <input type="file" ref={transcriptInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'transcripts')} />
            <input type="file" ref={slackInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'slack')} />
            <input type="file" ref={pdfInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'pdf')} accept=".pdf" />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                    { id: 'emails', label: 'Emails', icon: Mail, desc: 'EML/MSG Stream', ref: emailInputRef },
                    { id: 'transcripts', label: 'Meetings', icon: Video, desc: 'XML Transcripts', ref: transcriptInputRef },
                    { id: 'slack', label: 'Slack', icon: MessageSquare, desc: 'JSON Workspace', ref: slackInputRef },
                    { id: 'pdf', label: 'PDF Ideas', icon: FileText, desc: 'PDF Project Logs', ref: pdfInputRef }
                ].map((box) => (
                    <motion.div
                        key={box.id}
                        whileHover={{ y: -5 }}
                        className="relative group cursor-pointer"
                        onClick={() => box.ref.current.click()}
                    >
                        <div className={`h-full border-2 border-dashed rounded-3xl p-8 flex flex-col items-center text-center transition-all ${files[box.id] ? 'border-accent bg-accent/5' : 'border-white/10 group-hover:border-accent/40 group-hover:bg-white/[0.02]'}`}>
                            <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 ${files[box.id] ? 'text-accent' : 'text-slate-600'}`}>
                                {files[box.id] ? <CheckCircle2 className="w-7 h-7" /> : <box.icon className="w-7 h-7" />}
                            </div>
                            <h3 className="text-sm font-black text-white mb-2 uppercase tracking-widest">{box.label}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate max-w-full italic px-4">
                                {files[box.id] ? files[box.id].name : box.desc}
                            </p>

                            <div className="mt-8 pt-6 border-t border-white/5 w-full">
                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${files[box.id] ? 'text-accent' : 'text-slate-700'}`}>
                                    {files[box.id] ? 'File Linked' : 'Select Local'}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-20 flex flex-col items-center">
                <button
                    onClick={handleGenerate}
                    disabled={!isReady || isUploading}
                    className={`group relative px-20 py-6 rounded-2xl font-black text-xl italic uppercase tracking-tighter transition-all flex items-center gap-4 ${isReady && !isUploading ? 'bg-accent text-white shadow-[0_20px_50px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95' : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'}`}
                >
                    {isUploading ? 'Starting Engines...' : 'Synthesize BRD'}
                    <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
                </button>
                <div className="mt-6 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Multi-Source Hybrid Mode Active</span>
                </div>
            </div>
        </div>
    );
};

export default UploadPage;
