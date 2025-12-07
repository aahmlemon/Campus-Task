'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { X, Upload, Loader2, Check, AlertCircle } from 'lucide-react';

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
                // Assign random colors locally
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
            // Prepare data for Supabase
            const rows = detectedSubjects.map(s => ({
                user_id: user.id,
                name: `${s.code}: ${s.name}`, // Combine Code + Name
                color: s.color
            }));

            const { error } = await supabase.from('subjects').insert(rows);

            if (!error) {
                onSuccess();
                onClose();
                // Reset state
                setFile(null);
                setPreview(null);
                setDetectedSubjects([]);
            } else {
                alert('Error saving subjects');
            }
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Scan Timetable</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">

                    {/* 1. Upload Section */}
                    {!detectedSubjects.length && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            {preview ? (
                                <img src={preview} alt="Preview" className="max-h-64 rounded-lg shadow-sm" />
                            ) : (
                                <>
                                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                                    <p className="text-gray-600 font-medium">Click to upload your timetable</p>
                                    <p className="text-gray-400 text-sm mt-1">Supports PNG, JPG</p>
                                </>
                            )}
                        </div>
                    )}

                    {/* 2. Action Button */}
                    {file && !detectedSubjects.length && (
                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
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
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg border border-green-100">
                                <Check className="w-5 h-5" />
                                <span className="font-medium">Found {detectedSubjects.length} subjects!</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {detectedSubjects.map((s, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50">
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: s.color }} />
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{s.code}</p>
                                            <p className="text-xs text-gray-500">{s.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleSaveAll}
                                disabled={saving}
                                className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Add All to My Dashboard'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}