'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, CheckSquare, Clock, Layout, Zap, Menu } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-green-500 selection:text-black">

            {/* --- NAVBAR --- */}
            <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-green-500/20">
                            C
                        </div>
                        <span className="text-2xl font-bold tracking-tight">CampusTask</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link
                            href="/login"
                            className="hidden md:block text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/signup"
                            className="px-5 py-2.5 bg-green-500 text-black font-semibold rounded-full hover:bg-green-400 transition-all shadow-[0_0_20px_-5px_rgba(34,197,94,0.4)] hover:shadow-[0_0_25px_-5px_rgba(34,197,94,0.6)]"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-green-500/20 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16 relative z-10">
                    <div className="flex-1 text-center md:text-left space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-green-400 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
                            The Ultimate Student Workspace
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                            Master Your <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                Semester.
              </span>
                        </h1>

                        <p className="text-xl text-gray-400 max-w-lg mx-auto md:mx-0 leading-relaxed">
                            Stop drowning in deadlines. Sync your calendar, manage tasks with AI, and visualize your progress in one stunning dashboard.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <Link
                                href="/signup"
                                className="px-8 py-4 bg-white text-black font-bold text-lg rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                            >
                                Start Organizing <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="#features"
                                className="px-8 py-4 bg-white/5 text-white border border-white/10 font-bold text-lg rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center"
                            >
                                How it Works
                            </Link>
                        </div>
                    </div>

                    {/* Hero UI Mockup */}
                    <div className="flex-1 w-full max-w-lg relative perspective-1000">
                        <div className="relative bg-gray-900 border border-white/10 rounded-3xl p-6 shadow-2xl shadow-green-900/20 backdrop-blur-xl rotate-y-12 hover:rotate-y-0 transition-transform duration-500 ease-out">
                            {/* Fake Window Controls */}
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                            </div>

                            {/* Mock Content */}
                            <div className="space-y-4">
                                {/* Card 1 */}
                                <div className="bg-gray-800/50 p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:border-green-500/30 transition-colors">
                                    <div>
                                        <div className="text-xs text-green-400 font-mono mb-1">CS101 • DUE TODAY</div>
                                        <div className="font-semibold">Intro to Algorithms</div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full border border-green-500/30 flex items-center justify-center text-green-400">
                                        <CheckSquare className="w-4 h-4" />
                                    </div>
                                </div>

                                {/* Card 2 */}
                                <div className="bg-gray-800/50 p-4 rounded-xl border border-white/5 flex gap-4">
                                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center text-green-400">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-2 w-24 bg-gray-700 rounded-full mb-2"></div>
                                        <div className="h-2 w-16 bg-gray-700 rounded-full"></div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="bg-gray-800/50 p-4 rounded-xl border border-white/5">
                                    <div className="flex justify-between text-sm mb-2 text-gray-400">
                                        <span>Daily Goal</span>
                                        <span className="text-white">85%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                        <div className="bg-gradient-to-r from-green-500 to-emerald-400 w-[85%] h-full rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Glow effect underneath */}
                        <div className="absolute -inset-4 bg-green-500/20 blur-3xl -z-10 rounded-full opacity-50"></div>
                    </div>
                </div>
            </header>

            {/* --- FEATURES SECTION --- */}
            <section id="features" className="py-32 bg-gray-950 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                            Tools built for <span className="text-green-500">High Achievers</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Everything you need to manage your academic life, stripped of distractions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Layout,
                                title: "Kanban Boards",
                                desc: "Visualize workload per subject. Drag tasks to completion with zero friction."
                            },
                            {
                                icon: Zap,
                                title: "Smart Scheduler",
                                desc: "AI-powered planning. We analyze deadlines to build your perfect study routine."
                            },
                            {
                                icon: Calendar,
                                title: "Calendar Sync",
                                desc: "Two-way sync with Google Calendar. Never double-book a study session again."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="group p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-green-500/30 hover:bg-white/10 transition-all duration-300">
                                <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 text-green-400 group-hover:scale-110 transition-transform duration-300">
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- CTA SECTION --- */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-green-600/10"></div>
                <div className="max-w-4xl mx-auto px-4 text-center space-y-8 relative z-10">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
                        Ready to crush this semester?
                    </h2>
                    <div className="flex justify-center">
                        <Link
                            href="/signup"
                            className="px-12 py-6 bg-green-500 text-black font-bold text-xl rounded-full hover:bg-green-400 hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(34,197,94,0.5)]"
                        >
                            Join Now for Free
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-black py-12 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="font-bold text-2xl tracking-tight text-white flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-500 rounded-md"></div>
                        CampusTask
                    </div>
                    <div className="flex gap-8 text-sm font-medium text-gray-400">
                        <a href="#" className="hover:text-green-400 transition-colors">About</a>
                        <a href="#" className="hover:text-green-400 transition-colors">Features</a>
                        <a href="#" className="hover:text-green-400 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-green-400 transition-colors">Contact</a>
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                        © 2025 Shortcut Asia Internship Project.
                    </div>
                </div>
            </footer>
        </div>
    );
}