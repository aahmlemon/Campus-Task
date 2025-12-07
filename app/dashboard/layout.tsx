'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    BookOpen,
    LogOut,
    Settings
} from 'lucide-react';

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const navItems = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
        { name: 'Subjects', href: '/dashboard/subjects', icon: BookOpen },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    return (
        <div className="flex min-h-screen transition-colors">

            {/* Sidebar */}
            {/* Background uses the CSS variable --card for automatic theme switching */}
            <aside className="w-64 bg-[var(--card)] border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col transition-colors duration-300">
                <div className="p-6 flex items-center gap-3">
                    {/* THEME UPDATE: Green Logo Box */}
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-black font-bold shadow-lg shadow-green-500/20">
                        C
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">CampusTask</h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                                    isActive
                                        ? 'bg-green-500/10 text-green-600 dark:text-green-400' // THEME UPDATE: Green Active State
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                                }`}
                            >
                                {/* THEME UPDATE: Green Icon when active */}
                                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-green-500' : ''}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}