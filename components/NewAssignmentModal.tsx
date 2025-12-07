'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { X, Clock, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';

interface NewAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    subjectId: string;
    initialData?: any;
}

export default function NewAssignmentModal({
                                               isOpen,
                                               onClose,
                                               onSuccess,
                                               subjectId,
                                               initialData
                                           }: NewAssignmentModalProps) {
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('medium');
    const [estimate, setEstimate] = useState(30);
    const [loading, setLoading] = useState(false);

    // When the modal opens, check if we are editing or creating
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // EDIT MODE: Pre-fill the form
                setTitle(initialData.title);
                setPriority(initialData.priority);
                setEstimate(initialData.estimated_minutes);

                // Convert ISO DB timestamp to input format (YYYY-MM-DDThh:mm)
                if (initialData.due_date) {
                    const date = new Date(initialData.due_date);
                    // Adjust for timezone offset to show correct local time in input
                    const offset = date.getTimezoneOffset() * 60000;
                    const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
                    setDueDate(localISOTime);
                }
            } else {
                // CREATE MODE: Reset form
                setTitle('');
                setPriority('medium');
                setEstimate(30);
                setDueDate('');
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const payload = {
                title,
                user_id: user.id,
                subject_id: subjectId,
                due_date: new Date(dueDate).toISOString(),
                priority,
                estimated_minutes: estimate,
                // Don't overwrite status during edit
                status: initialData ? initialData.status : 'todo'
            };

            let error;

            if (initialData) {
                // UPDATE existing assignment
                const { error: updateError } = await supabase
                    .from('assignments')
                    .update(payload)
                    .eq('id', initialData.id);
                error = updateError;
            } else {
                // INSERT new assignment
                const { error: insertError } = await supabase
                    .from('assignments')
                    .insert([payload]);
                error = insertError;
            }

            if (!error) {
                onSuccess();
                onClose();
            } else {
                console.error(error);
                alert('Error saving assignment');
            }
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {initialData ? 'Edit Assignment' : 'Add New Assignment'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Title</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Due Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4" /> Due Date
                                </div>
                            </label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>

                        {/* Time Estimate */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Est. Time (Min)
                                </div>
                            </label>
                            <input
                                type="number"
                                min="5"
                                step="5"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={estimate}
                                onChange={(e) => setEstimate(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> Priority Level
                            </div>
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {['low', 'medium', 'high', 'urgent'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPriority(p)}
                                    className={`py-2 text-sm font-medium rounded-lg border capitalize transition-all ${
                                        priority === p
                                            ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-md"
                    >
                        {loading ? 'Saving...' : (initialData ? 'Update Assignment' : 'Add Assignment')}
                    </button>
                </form>
            </div>
        </div>
    );
}