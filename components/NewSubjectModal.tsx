'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { X } from 'lucide-react';

interface NewSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Trigger refresh after adding
}

const COLORS = [
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Red', hex: '#EF4444' },
    { name: 'Green', hex: '#10B981' },
    { name: 'Purple', hex: '#8B5CF6' },
    { name: 'Orange', hex: '#F59E0B' },
    { name: 'Pink', hex: '#EC4899' },
];

export default function NewSubjectModal({ isOpen, onClose, onSuccess }: NewSubjectModalProps) {
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0].hex);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { error } = await supabase
                .from('subjects')
                .insert([{
                    name,
                    color: selectedColor,
                    user_id: user.id
                }]);

            if (!error) {
                setName('');
                onSuccess();
                onClose();
            } else {
                alert('Error creating subject');
            }
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Add New Subject</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. CS101: Intro to CS"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Color Tag</label>
                        <div className="flex gap-3">
                            {COLORS.map((color) => (
                                <button
                                    key={color.hex}
                                    type="button"
                                    onClick={() => setSelectedColor(color.hex)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                                        selectedColor === color.hex
                                            ? 'border-gray-900 scale-110'
                                            : 'border-transparent hover:scale-105'
                                    }`}
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Subject'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}