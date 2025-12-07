'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Save, User, Clock, Hourglass } from 'lucide-react';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState('');
    const [startHour, setStartHour] = useState(9);
    const [studyHours, setStudyHours] = useState(4); // New State: Default 4 hours

    useEffect(() => {
        const loadProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setFullName(profile.full_name || '');
                    setStartHour(profile.preferred_start_hour || 9);
                    setStudyHours(profile.study_goal_hours || 4); // Load saved goal
                }
            }
            setLoading(false);
        };

        loadProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: fullName,
                    preferred_start_hour: startHour,
                    study_goal_hours: studyHours, // Save new goal
                    updated_at: new Date().toISOString()
                });

            if (!error) {
                alert('Settings saved successfully!');
            } else {
                console.error(error);
                alert('Error saving settings.');
            }
        }
        setSaving(false);
    };

    if (loading) return <div className="p-8">Loading settings...</div>;

    const formatTimeOption = (hour: number) => {
        if (hour === 0) return '12:00 AM (Midnight)';
        if (hour === 12) return '12:00 PM (Noon)';
        return hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
                <p className="text-gray-500">Manage your preferences and profile.</p>
            </div>

            <div className="bg-[var(--card)] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <form onSubmit={handleSave} className="p-6 space-y-8">

                    {/*Profile Name */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                            <User className="w-4 h-4" /> Display Name
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-[var(--foreground)] focus:ring-2 focus:ring-green-500 outline-none transition-all"
                            placeholder="Your Name"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/*Start Time */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                                <Clock className="w-4 h-4" /> Preferred Start Time
                            </label>
                            <select
                                value={startHour}
                                onChange={(e) => setStartHour(Number(e.target.value))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-[var(--foreground)] focus:ring-2 focus:ring-green-500 outline-none"
                            >
                                {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                                    <option key={hour} value={hour}>
                                        {formatTimeOption(hour)}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500">When do you usually start working?</p>
                        </div>

                        {/*Study Goal Hours */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                                <Hourglass className="w-4 h-4" /> Daily Capacity
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="1"
                                    max="12"
                                    step="1"
                                    value={studyHours}
                                    onChange={(e) => setStudyHours(Number(e.target.value))}
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-green-500"
                                />
                                <span className="w-16 text-center font-bold text-[var(--foreground)] border border-gray-200 dark:border-gray-700 rounded px-2 py-1">
                  {studyHours}h
                </span>
                            </div>
                            <p className="text-xs text-gray-500">Max hours per day before AI stops scheduling.</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center px-6 py-2 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 disabled:opacity-50 transition-colors shadow-lg shadow-green-500/20"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}