'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, BookOpen, Trash2, Camera } from 'lucide-react';
import NewSubjectModal from '@/components/NewSubjectModal';
import ScanTimetableModal from '@/components/ScanTimetableModal';
import Link from 'next/link';

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isScanModalOpen, setIsScanModalOpen] = useState(false); // <--- New State for Scanner
    const [loading, setLoading] = useState(true);

    const fetchSubjects = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('subjects')
                .select(`
          *,
          assignments (
            id,
            status
          )
        `)
                .order('created_at', { ascending: false });

            if (!error && data) setSubjects(data);
        }
        setLoading(false);
    };

    const deleteSubject = async (id: string) => {
        if (confirm('Are you sure? This will delete all assignments for this subject too.')) {
            await supabase.from('subjects').delete().eq('id', id);
            fetchSubjects();
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Your Subjects</h1>
                    <p className="text-gray-500 mt-1">Manage your courses and assignments</p>
                </div>

                <div className="flex gap-3">
                    {/* --- SCAN BUTTON IS HERE --- */}
                    <button
                        onClick={() => setIsScanModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium"
                    >
                        <Camera className="w-5 h-5 mr-2" />
                        Scan Timetable
                    </button>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Subject
                    </button>
                </div>
            </div>

            {/* Grid of Subjects */}
            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading your courses...</div>
            ) : subjects.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No subjects yet</h3>
                    <p className="text-gray-500 mt-1">Add your first course or scan your timetable!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subject) => {
                        const activeCount = subject.assignments?.filter((a: any) => a.status !== 'done').length || 0;

                        return (
                            <div
                                key={subject.id}
                                className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
                            >
                                {/* Card Header (Color Strip) */}
                                <div
                                    className="h-3 w-full"
                                    style={{ backgroundColor: subject.color }}
                                />

                                <div className="p-5 flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {subject.name}
                                        </h3>
                                        <button
                                            onClick={() => deleteSubject(subject.id)}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <p className="text-sm text-gray-500 mt-2">
                                        {activeCount} Active Assignment{activeCount !== 1 ? 's' : ''}
                                    </p>
                                </div>

                                {/* Card Footer */}
                                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                                    <Link
                                        href={`/dashboard/subjects/${subject.id}`}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                    >
                                        View Tasks &rarr;
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Manual Add Modal */}
            <NewSubjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchSubjects}
            />

            {/* AI Scan Modal */}
            <ScanTimetableModal
                isOpen={isScanModalOpen}
                onClose={() => setIsScanModalOpen(false)}
                onSuccess={fetchSubjects}
            />
        </div>
    );
}