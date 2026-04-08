import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { ExcelGathering } from '../components/gathering/ExcelGathering';
import { DataCleaning } from '../components/cleaning/DataCleaning';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { useAuthUser } from '../hooks/useAuthUser';

interface PageProps {
  onSignOut?: () => void;
}

export default function Page({ onSignOut }: PageProps) {
  // Extracted Custom Hooks
  const { lang, t, toggleLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { userEmail, userCredits, fetchCredits, handleSignOut } = useAuthUser(onSignOut);

  // App Routing State
  const [appMode, setAppMode] = useState<'gathering' | 'cleaning'>('gathering');
  // Need to pass a dummy active tab or something if needed by header, but we'll adapt Header
  // The header uses activeTab for some title on the left.
  const [activeTab, setActiveTab] = useState('template');

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 font-sans relative">
      {/* Global Application Header */}
      <Header
        appMode={appMode}
        onChangeMode={setAppMode}
        activeTab={activeTab}
        userCredits={userCredits}
        userEmail={userEmail}
        isDark={isDark}
        t={t}
        onToggleLang={toggleLanguage}
        onToggleTheme={toggleTheme}
        onSignOut={handleSignOut}
      />

      {/* Main Content Router */}
      {appMode === 'gathering' ? (
        <ExcelGathering
          t={t}
          userEmail={userEmail}
          userCredits={userCredits}
          fetchCredits={fetchCredits}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      ) : (
        <DataCleaning
          t={t}
          isDark={isDark}
          userCredits={userCredits}
          fetchCredits={fetchCredits}
        />
      )}
    </div>
  );
}