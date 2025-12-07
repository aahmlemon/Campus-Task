'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { generateDailyStudyPlan, type DailyPlanSlot, type Assignment, type BusySlot } from '@/utils/smart_scheduler';
import { fetchCalendarEvents } from '@/utils/google_calendar';
import { Clock, AlertCircle, CheckCircle2, Coffee, ArrowRight, CalendarOff, Calendar, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({
        pending: 0,
        urgent: 0,
        hours: 0
    });
    const [schedule, setSchedule] = useState<DailyPlanSlot[]>([]);
    const [weeklyPreview, setWeeklyPreview] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [todayDate, setTodayDate] = useState(''); // New State for Today's Header

    useEffect(() => {
        const loadDashboardData = async () => {
            // 0. Set Today's Date (Client-side only to avoid hydration mismatch)
            const now = new Date();
            setTodayDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }));

            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // 1. Fetch Profile
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(profileData);

                // 2. Fetch Assignments
                const { data: assignments } = await supabase
                    .from('assignments')
                    .select('*, subjects(color, name)')
                    .neq('status', 'done');

                // 3. Fetch Calendar Events
                const calendarEvents: BusySlot[] = await fetchCalendarEvents();

                if (assignments) {
                    const pendingCount = assignments.length;
                    const urgentCount = assignments.filter(a => a.priority === 'urgent').length;

                    // Format for Scheduler
                    const formattedAssignments: Assignment[] = assignments.map(a => ({
                        ...a,
                        subject_color: a.subjects?.color,
                        subject_name: a.subjects?.name,
                        subject_id: a.subject_id
                    }));

                    const startHour = profileData?.preferred_start_hour || 9;

                    // Get study goal (default to 4 hours)
                    const studyGoalHours = profileData?.study_goal_hours || 4;
                    const minutesAvailable = studyGoalHours * 60;

                    // 4. Generate Schedule
                    const suggestedPlan = generateDailyStudyPlan(
                        formattedAssignments,
                        calendarEvents,
                        startHour,
                        minutesAvailable
                    );
                    setSchedule(suggestedPlan);

                    // 5. UPDATE STATS
                    const todayMinutes = suggestedPlan.reduce((acc, slot) => {
                        if (!slot.is_break && !slot.is_busy) {
                            return acc + slot.duration_minutes;
                        }
                        return acc;
                    }, 0);

                    setStats({
                        pending: pendingCount,
                        urgent: urgentCount,
                        hours: Math.round(todayMinutes / 60 * 10) / 10
                    });

                    // 6. Generate Weekly Preview (Next 5 Days)
                    const next5Days = [];
                    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                    for (let i = 0; i < 5; i++) {
                        const date = new Date();
                        date.setDate(date.getDate() + i);
                        const dayName = daysOfWeek[date.getDay()];

                        // Short date format (e.g. "Dec 7")
                        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                        const dayEvents = calendarEvents.filter(e => new Date(e.start).toDateString() === date.toDateString());

                        const dueTasks = formattedAssignments.filter(a => new Date(a.due_date).toDateString() === date.toDateString());

                        const prepTasks = formattedAssignments.filter(a => {
                            const due = new Date(a.due_date);
                            const diffTime = due.getTime() - date.getTime();
                            const diffDays = diffTime / (1000 * 3600 * 24);
                            return diffDays > 0 && diffDays <= 3;
                        });

                        const focusTask = dueTasks.length > 0 ? dueTasks[0] : (prepTasks.length > 0 ? prepTasks[0] : null);

                        next5Days.push({
                            dayName: i === 0 ? 'Today' : dayName,
                            dateStr, // Use the short format
                            eventsCount: dayEvents.length,
                            focusTask: focusTask,
                            dueCount: dueTasks.length
                        });
                    }
                    setWeeklyPreview(next5Days);
                }
            }
            setLoading(false);
        };

        loadDashboardData();
    }, []);

    if (loading) return <div className="p-12 text-center text-gray-500">Loading your workspace...</div>;

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
                    Welcome back, <span className="text-green-500">{profile?.full_name || user?.email?.split('@')[0]}</span>
                </h2>
                <p className="text-gray-500 mt-2 font-medium">Here is your focus for today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[var(--card)] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-4 group hover:border-green-500/30 transition-all">
                    <div className="p-3 bg-green-500/10 text-green-500 rounded-xl group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Tasks</h3>
                        <p className="text-2xl font-bold text-[var(--foreground)]">{stats.pending}</p>
                    </div>
                </div>

                <div className="bg-[var(--card)] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-4 group hover:border-red-500/30 transition-all">
                    <div className="p-3 bg-red-500/10 text-red-500 rounded-xl group-hover:scale-110 transition-transform">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Urgent Items</h3>
                        <p className="text-2xl font-bold text-[var(--foreground)]">{stats.urgent}</p>
                    </div>
                </div>

                <div className="bg-[var(--card)] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-4 group hover:border-purple-500/30 transition-all">
                    <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl group-hover:scale-110 transition-transform">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Today&#39;s Study</h3>
                        <p className="text-2xl font-bold text-[var(--foreground)]">{stats.hours}h</p>
                    </div>
                </div>
            </div>

            {/* Smart Schedule Section */}
            <div className="bg-[var(--card)] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-[var(--foreground)] text-lg">Today&#39;s Smart Schedule</h3>
                        {/* Added Today's Date */}
                        <span className="text-sm text-gray-500 font-medium hidden sm:inline-block">
              {todayDate}
            </span>
                    </div>
                    <span className="text-xs font-bold bg-green-500 text-black px-3 py-1 rounded-full shadow-lg shadow-green-500/20">
            AI Generated
          </span>
                </div>

                <div className="p-6">
                    {schedule.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p>No tasks scheduled for today! You&#39;ve reached your daily limit or have no pending work.</p>
                            <Link href="/dashboard/subjects" className="text-green-500 text-sm mt-2 hover:underline font-medium">
                                View Subjects &rarr;
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {schedule.map((slot, index) => {

                                if (slot.is_busy) {
                                    return (
                                        <div key={`busy-${index}`} className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 opacity-70">
                                            <div className="w-24 flex-shrink-0 text-center">
                                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{slot.suggested_start_time}</span>
                                            </div>
                                            <div className="flex-1 flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                <CalendarOff className="w-4 h-4" />
                                                <span className="text-sm font-medium">{slot.reason}</span>
                                            </div>
                                        </div>
                                    )
                                }

                                if (slot.is_break) {
                                    return (
                                        <div key={`break-${index}`} className="flex items-center gap-4 p-3 bg-orange-500/10 rounded-xl border border-orange-500/20 border-dashed">
                                            <div className="w-24 flex-shrink-0 text-center">
                                                <span className="text-xs font-semibold text-orange-500">{slot.suggested_start_time}</span>
                                            </div>
                                            <div className="flex-1 flex items-center gap-2 text-orange-500">
                                                <Coffee className="w-4 h-4" />
                                                <span className="text-sm font-medium">Take a 10 min break</span>
                                            </div>
                                        </div>
                                    )
                                }

                                const task = slot.assignment as Assignment;

                                return (
                                    <div key={task.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-green-500/30 hover:shadow-md transition-all bg-[var(--card)] group">
                                        <div className="w-24 flex-shrink-0">
                                            <span className="text-sm font-bold text-[var(--foreground)] block">{slot.suggested_start_time}</span>
                                            <span className="text-xs text-gray-500">{slot.duration_minutes} mins</span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-[var(--foreground)] truncate group-hover:text-green-500 transition-colors">
                                                    {task.title}
                                                </h4>
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full
                          ${task.priority === 'urgent' ? 'bg-red-500/10 text-red-500' :
                                                    task.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                                                        'bg-blue-500/10 text-blue-500'}`}>
                          {task.priority}
                        </span>
                                            </div>

                                            <div className="flex items-center gap-2 mb-2">
                        <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: task.subject_color || '#ccc' }}
                        />
                                                <span className="text-sm text-gray-500 truncate">{task.subject_name}</span>
                                            </div>

                                            <div className="text-xs text-gray-400 flex items-center gap-1">
                                                💡 {slot.reason}
                                            </div>
                                        </div>

                                        <div className="pl-4 flex-shrink-0">
                                            <Link
                                                href={`/dashboard/subjects/${task.subject_id}`}
                                                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors"
                                            >
                                                Start <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Weekly Trajectory Section */}
            <div className="space-y-4">
                <h3 className="font-semibold text-[var(--foreground)] text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-500" /> Weekly Trajectory
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {weeklyPreview.map((day, idx) => (
                        <div
                            key={idx}
                            className={`p-4 rounded-xl border transition-all flex flex-col gap-3
                ${day.dayName === 'Today'
                                ? 'bg-green-500/5 border-green-500/30'
                                : 'bg-[var(--card)] border-gray-200 dark:border-gray-800 hover:border-green-500/20'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                  <span className={`text-sm font-bold ${day.dayName === 'Today' ? 'text-green-500' : 'text-gray-500'}`}>
                    {day.dayName}
                  </span>
                                    {/* Added Date Below Day */}
                                    <span className="text-xs text-gray-400 font-medium">
                    {day.dateStr}
                  </span>
                                </div>
                                {day.eventsCount > 0 && (
                                    <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {day.eventsCount}
                  </span>
                                )}
                            </div>

                            {day.focusTask ? (
                                <div className="mt-auto">
                                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Recommended Focus</div>
                                    <div className="text-xs font-semibold text-[var(--foreground)] truncate border-l-2 pl-2"
                                         style={{ borderColor: day.focusTask.subject_color || '#22c55e' }}>
                                        {day.focusTask.title}
                                    </div>
                                    {day.dueCount > 0 && (
                                        <div className="mt-2 text-[10px] text-red-500 font-medium">
                                            ⚠️ {day.dueCount} Assignment{day.dueCount > 1 ? 's' : ''} Due!
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-auto text-xs text-gray-400 italic">
                                    Free day! Relax or review.
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}