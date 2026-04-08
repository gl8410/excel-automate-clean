import React from 'react';
import { Button } from '../ui/button';
import { Coins, Languages, Moon, Sun, LogOut, TableProperties, FileText } from 'lucide-react';

interface HeaderProps {
    appMode: 'gathering' | 'cleaning';
    onChangeMode: (mode: 'gathering' | 'cleaning') => void;
    activeTab?: string;
    userCredits: number | null;
    userEmail: string;
    isDark: boolean;
    t: any; // Translation dict
    onToggleLang: () => void;
    onToggleTheme: () => void;
    onSignOut: () => void;
}

export function Header({
    appMode,
    onChangeMode,
    activeTab,
    userCredits,
    userEmail,
    isDark,
    t,
    onToggleLang,
    onToggleTheme,
    onSignOut,
}: HeaderProps) {
    return (
        <div className="h-16 border-b border-slate-200 dark:border-slate-800/80 flex items-center px-8 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-20 justify-between">
            <div className="flex items-center gap-4 text-sm font-bold text-slate-500 uppercase tracking-widest pl-4">
                <div
                    className={`cursor-pointer px-4 flex items-center h-16 border-b-2 transition-all gap-2 ${appMode === 'gathering' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent hover:text-slate-700 dark:hover:text-slate-300'}`}
                    onClick={() => onChangeMode('gathering')}
                >
                    <TableProperties size={16} /> Excel 智能汇总
                </div>
                <div
                    className={`cursor-pointer px-4 flex items-center h-16 border-b-2 transition-all gap-2 ${appMode === 'cleaning' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent hover:text-slate-700 dark:hover:text-slate-300'}`}
                    onClick={() => onChangeMode('cleaning')}
                >
                    <FileText size={16} /> 数据清洗
                </div>
            </div>

            {/* Right-side navbar items */}
            <div className="flex items-center gap-1">
                {/* Credits */}
                {userCredits !== null && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold text-amber-500 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-900/50 mr-2">
                        <Coins size={14} className="text-amber-400" />
                        <span>{t.credits} {userCredits}</span>
                    </div>
                )}

                {/* Language / Translation icon */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40"
                    title={t.switchLang}
                    onClick={onToggleLang}
                >
                    <Languages size={16} />
                </Button>

                {/* Theme toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/40"
                    onClick={onToggleTheme}
                    title={isDark ? t.lightMode : t.darkMode}
                >
                    {isDark ? <Moon size={16} /> : <Sun size={16} />}
                </Button>

                {/* Divider */}
                <div className="w-px h-5 bg-slate-200 mx-1" />

                {/* User avatar + email */}
                {userEmail && (
                    <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 cursor-default group relative">
                        <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold uppercase flex-shrink-0">
                            {userEmail.charAt(0)}
                        </div>
                        <span className="text-sm text-slate-600 font-medium max-w-[160px] truncate">{userEmail}</span>
                        {/* Hover dropdown hint for sign out */}
                        <button
                            onClick={onSignOut}
                            className="hidden group-hover:flex items-center gap-1 absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2 text-xs text-slate-500 hover:text-red-600 whitespace-nowrap z-50"
                        >
                            <LogOut size={12} className="mr-1" /> {t.logout}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
