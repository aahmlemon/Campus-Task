'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Plus, ArrowLeft, Clock, Calendar, Pencil, Trash2 } from 'lucide-react';
import NewAssignmentModal from '@/components/NewAssignmentModal';
import Link from 'next/link';

export default function SubjectDetailsPage() {
    const params = useParams();
    const subjectId = params.id as string;

    const [subject, setSubject] = useState<any>(null);
    const [assignments, setAssignments] = useState<any[]>([]);

    // State for Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<any>(null); // New state to track edits

    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        // 1. Fetch Subject Info
        const { data: subjectData } = await supabase
            .from('subjects')
            .select('*')
            .eq('id', subjectId)
            .single();

        setSubject(subjectData);

        // 2. Fetch Assignments
        const { data: assignmentData } = await supabase
            .from('assignments')
            .select('*')
            .eq('subject_id', subjectId)
            .order('due_date', { ascending: true });

        if (assignmentData) setAssignments(assignmentData);
        setLoading(false);
    };

    const updateStatus = async (id: string, newStatus: string) => {
        setAssignments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
        await supabase.from('assignments').update({ status: newStatus }).eq('id', id);
    };

    const deleteAssignment = async (id: string) => {
        if (confirm("Delete this task?")) {
            setAssignments(prev => prev.filter(a => a.id !== id));
            await supabase.from('assignments').delete().eq('id', id);
        }
    };

    const openNewModal = () => {
        setEditingAssignment(null); // Clear any previous edit data
        setIsModalOpen(true);
    };

    const openEditModal = (task: any) => {
        setEditingAssignment(task); // Load task data
        setIsModalOpen(true);
    };

    useEffect(() => {
        fetchData();
    }, [subjectId]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;
    if (!subject) return <div className="p-8 text-center">Subject not found</div>;

    const todo = assignments.filter(a => a.status === 'todo');
    const inProgress = assignments.filter(a => a.status === 'in_progress');
    const done = assignments.filter(a => a.status === 'done');

    const KanbanColumn = ({ title, tasks, status, colorClass }: any) => (
        <div className="flex-1 min-w-[300px] bg-gray-50 rounded-xl p-4 flex flex-col h-full border border-gray-200">
            <h3 className={`font-semibold mb-4 flex items-center gap-2 ${colorClass}`}>
                {title} <span className="bg-white px-2 py-0.5 rounded-full text-xs border border-gray-200 text-gray-500">{tasks.length}</span>
            </h3>

            <div className="space-y-3 overflow-y-auto flex-1">
                {tasks.map((task: any) => (
                    <div key={task.id} className="group bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
                ${task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                  task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      task.priority === 'medium' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                {task.priority}
              </span>

                            {/* Edit Actions */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEditModal(task)}
                                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                    title="Edit"
                                >
                                    <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => deleteAssignment(task.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                    title="Delete"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>

                        <div className="flex justify-between items-center mb-3">
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(task.due_date).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {task.estimated_minutes}m
                            </div>
                        </div>

                        {/* Status Controls */}
                        <div className="flex gap-2 mt-2 pt-2 border-t border-gray-50">
                            {status !== 'todo' && (
                                <button
                                    onClick={() => updateStatus(task.id, 'todo')}
                                    className="text-xs text-gray-500 hover:text-blue-600"
                                >
                                    Move to Todo
                                </button>
                            )}
                            {status !== 'in_progress' && (
                                <button
                                    onClick={() => updateStatus(task.id, 'in_progress')}
                                    className="text-xs text-gray-500 hover:text-blue-600"
                                >
                                    {status === 'todo' ? 'Start' : 'Not Done'}
                                </button>
                            )}
                            {status !== 'done' && (
                                <button
                                    onClick={() => updateStatus(task.id, 'done')}
                                    className="text-xs text-gray-500 hover:text-green-600 ml-auto font-medium"
                                >
                                    Complete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {tasks.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm italic">No tasks</div>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/subjects" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            {subject.name}
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }}></span>
                        </h1>
                        <p className="text-gray-500 text-sm">Kanban Board</p>
                    </div>
                </div>
                <button
                    onClick={openNewModal}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Assignment
                </button>
            </div>

            {/* Kanban Board Container */}
            <div className="flex-1 overflow-x-auto">
                <div className="flex gap-6 h-full min-w-[1000px] pb-4">
                    <KanbanColumn
                        title="To Do"
                        tasks={todo}
                        status="todo"
                        colorClass="text-gray-700"
                    />
                    <KanbanColumn
                        title="In Progress"
                        tasks={inProgress}
                        status="in_progress"
                        colorClass="text-blue-600"
                    />
                    <KanbanColumn
                        title="Completed"
                        tasks={done}
                        status="done"
                        colorClass="text-green-600"
                    />
                </div>
            </div>

            <NewAssignmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
                subjectId={subjectId}
                initialData={editingAssignment} // Pass the assignment being edited
            />
        </div>
    );
}