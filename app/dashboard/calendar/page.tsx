'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ChevronLeft, ChevronRight, Clock, AlertCircle } from 'lucide-react';

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Helper: Get days in month
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    useEffect(() => {
        const fetchAssignments = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch assignments with subject colors
                const { data } = await supabase
                    .from('assignments')
                    .select('*, subjects(color, name)')
                    .neq('status', 'done'); // Only show active tasks

                if (data) setAssignments(data);
            }
            setLoading(false);
        };
        fetchAssignments();
    }, []);

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50/50 border border-gray-100" />);
        }

        // Actual days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = new Date(year, month, day).toDateString();

            // Find tasks for this day
            const daysTasks = assignments.filter(a =>
                new Date(a.due_date).toDateString() === dateString
            );

            const isToday = new Date().toDateString() === dateString;

            days.push(
                <div key={day} className={`h-32 border border-gray-100 p-2 overflow-y-auto ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
                    <div className="flex justify-between items-start mb-1">
            <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
              {day}
            </span>
                        {daysTasks.length > 0 && (
                            <span className="text-xs font-medium text-gray-400">{daysTasks.length} due</span>
                        )}
                    </div>

                    <div className="space-y-1">
                        {daysTasks.map((task) => (
                            <div
                                key={task.id}
                                className="text-xs p-1.5 rounded border border-gray-100 bg-white shadow-sm flex items-center gap-2"
                                style={{ borderLeft: `3px solid ${task.subjects?.color || '#ccc'}` }}
                            >
                                <span className="truncate flex-1 font-medium text-gray-700">{task.title}</span>
                                {task.priority === 'urgent' && <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return days;
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
                    <p className="text-gray-500">View upcoming deadlines</p>
                </div>

                <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-50 rounded-md">
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="w-40 text-center font-semibold text-gray-900 select-none">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-50 rounded-md">
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                    {loading ? (
                        <div className="col-span-7 flex items-center justify-center text-gray-400">Loading calendar...</div>
                    ) : renderCalendar()}
                </div>
            </div>
        </div>
    );
}