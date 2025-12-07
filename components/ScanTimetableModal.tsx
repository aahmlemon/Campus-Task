'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { X, Upload, Loader2, Check, RefreshCw } from 'lucide-react';

interface ScanTimetableModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'];

export default function ScanTimetableModal({ isOpen, onClose, onSuccess }: ScanTimetableModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [detectedSubjects, setDetectedSubjects] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setAnalyzing(true);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch('/api/analyze-timetable', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.subjects) {
                const subjectsWithColors = data.subjects.map((s: any, i: number) => ({
                    ...s,
                    color: COLORS[i % COLORS.length]
                }));
                setDetectedSubjects(subjectsWithColors);
            }
        } catch (error) {
            alert('Failed to analyze image. Ensure your API key is set.');
        }
        setAnalyzing(false);
    };

    const handleSaveAll = async () => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const rows = detectedSubjects.map(s => ({
                user_id: user.id,
                name: `${s.code}: ${s.name}`,
                color: s.color
            }));

            const { error } = await supabase.from('subjects').insert(rows);

            if (!error) {
                onSuccess();
                onClose();
                handleRedo(); // Reset after success
            } else {
                alert('Error saving subjects');
            }
        }
        setSaving(false);
    };

    // NEW: Reset state to scan again
    const handleRedo = () => {
        setFile(null);
        setPreview(null);
        setDetectedSubjects([]);
        setAnalyzing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scan Timetable</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">

                    {/* 1. Upload Section */}
                    {!detectedSubjects.length && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all text-center group"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            {preview ? (
                                <div className="relative">
                                    <img src={preview} alt="Preview" className="max-h-64 rounded-lg shadow-sm" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRedo(); }}
                                        className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-200 font-medium text-lg">Click to upload your timetable</p>
                                    <p className="text-gray-400 text-sm mt-2">Supports PNG, JPG, JPEG</p>
                                </>
                            )}
                        </div>
                    )}

                    {/* 2. Action Button */}
                    {file && !detectedSubjects.length && (
                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                        >
                            {analyzing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Analyzing with AI...
                                </>
                            ) : (
                                'Extract Subjects'
                            )}
                        </button>
                    )}

                    {/* 3. Results Preview */}
                    {detectedSubjects.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
                                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                    <Check className="w-5 h-5" />
                                    <span className="font-medium">Found {detectedSubjects.length} subjects!</span>
                                </div>

                                {/* NEW: Redo Button */}
                                <button
                                    onClick={handleRedo}
                                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white flex items-center gap-1 underline decoration-gray-300 underline-offset-2"
                                >
                                    <RefreshCw className="w-3 h-3" /> Scan Again
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
                                {detectedSubjects.map((s, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                                        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{s.code}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{s.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleRedo}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveAll}
                                    disabled={saving}
                                    className="flex-[2] py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 shadow-lg shadow-green-500/20"
                                >
                                    {saving ? 'Saving...' : 'Add All to My Dashboard'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}