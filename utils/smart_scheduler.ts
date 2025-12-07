export interface Assignment {
    id: string;
    title: string;
    due_date: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimated_minutes: number;
    status: 'todo' | 'in_progress' | 'done';
    subject_color?: string;
    subject_name?: string;
    subject_id?: string;
}

export interface BusySlot {
    start: Date;
    end: Date;
    title?: string;
}

export interface DailyPlanSlot {
    assignment: Assignment | 'BREAK' | 'BUSY';
    suggested_start_time: string;
    duration_minutes: number;
    reason: string;
    is_break?: boolean;
    is_busy?: boolean;
}

const getUrgencyScore = (task: Assignment): number => {
    const now = new Date().getTime();
    const due = new Date(task.due_date).getTime();
    const hoursUntilDue = (due - now) / (1000 * 60 * 60);

    const priorityWeights = { urgent: 300, high: 50, medium: 20, low: 10 };
    let score = priorityWeights[task.priority] || 0;

    if (hoursUntilDue < 0) score += 500;
    else if (hoursUntilDue < 24) score += 200;
    else if (hoursUntilDue < 72) score += 50;

    return score;
};

const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const findConflict = (start: Date, durationMinutes: number, busySlots: BusySlot[]): BusySlot | null => {
    const end = new Date(start.getTime() + durationMinutes * 60000);

    return busySlots.find(slot => {
        return (start < slot.end && end > slot.start);
    }) || null;
};

export const generateDailyStudyPlan = (
    tasks: Assignment[],
    busySlots: BusySlot[] = [],
    startHour: number = 9,
    minutesAvailable: number = 240 // Default 4 hours
): DailyPlanSlot[] => {

    const activeTasks = tasks
        .filter(t => t.status !== 'done')
        .sort((a, b) => getUrgencyScore(b) - getUrgencyScore(a));

    const schedule: DailyPlanSlot[] = [];
    let currentTime = new Date();
    currentTime.setHours(startHour, 0, 0, 0);

    const hardStop = new Date();
    hardStop.setHours(22, 0, 0, 0);

    let minutesStudied = 0;

    while (activeTasks.length > 0 && currentTime < hardStop) {

        if (minutesStudied >= minutesAvailable) {
            break;
        }

        // 1. Check if we are CURRENTLY in a conflict
        const conflict = findConflict(currentTime, 15, busySlots);
        if (conflict) {
            const duration = Math.round((conflict.end.getTime() - currentTime.getTime()) / 60000);

            schedule.push({
                assignment: 'BUSY',
                suggested_start_time: formatTime(currentTime),
                duration_minutes: duration,
                reason: conflict.title || 'Busy (Calendar Event)',
                is_busy: true
            });

            currentTime = new Date(conflict.end);
            continue;
        }

        // 2. Pick a Task
        let candidateIndex = 0;
        if (schedule.length > 0) {
            const lastSlot = schedule[schedule.length - 1];
            if (lastSlot.assignment !== 'BREAK' && lastSlot.assignment !== 'BUSY') {
                const lastSubjectId = (lastSlot.assignment as Assignment).subject_id;
                const betterTaskIdx = activeTasks.findIndex(t => t.subject_id !== lastSubjectId);
                if (betterTaskIdx !== -1) candidateIndex = betterTaskIdx;
            }
        }
        const task = activeTasks[candidateIndex];

        if (minutesStudied + task.estimated_minutes > minutesAvailable) {
            // If the task is too long for the remaining budget, skip it or break.
            // For MVP, break to avoid overworking.
            break;
        }

        // 3. Ensure task FITS before next busy slot
        const nextConflict = findConflict(currentTime, task.estimated_minutes, busySlots);

        if (nextConflict) {
            schedule.push({
                assignment: 'BUSY',
                suggested_start_time: formatTime(nextConflict.start),
                duration_minutes: Math.round((nextConflict.end.getTime() - nextConflict.start.getTime()) / 60000),
                reason: nextConflict.title || 'Busy (Calendar Event)',
                is_busy: true
            });

            currentTime = new Date(nextConflict.end);
            continue;
        }

        // 4. Schedule It
        schedule.push({
            assignment: task,
            suggested_start_time: formatTime(currentTime),
            duration_minutes: task.estimated_minutes,
            reason: "Smart Pick",
            is_break: false
        });

        currentTime.setMinutes(currentTime.getMinutes() + task.estimated_minutes);
        minutesStudied += task.estimated_minutes; // [FIX] Increment study counter
        activeTasks.splice(candidateIndex, 1);

        // 5. Breaks
        if (activeTasks.length > 0 && minutesStudied < minutesAvailable) {
            const breakDuration = 10;
            if (!findConflict(currentTime, breakDuration, busySlots)) {
                schedule.push({
                    assignment: 'BREAK',
                    suggested_start_time: formatTime(currentTime),
                    duration_minutes: breakDuration,
                    reason: 'Rest',
                    is_break: true
                });
                currentTime.setMinutes(currentTime.getMinutes() + breakDuration);
            }
        }
    }

    return schedule;
};