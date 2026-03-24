import React from 'react';

// Hooks y Layout
import { useDashboard } from './hooks/useDashboard';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';

// Secciones del contenido principal
import { WelcomeBanner } from './sections/WelcomeBanner';
import { MetricsGrid } from './sections/MetricsGrid';
import { ChartsSection } from './sections/ChartsSection';

export const DashboardPage = () => {
    const { 
        isDarkMode, toggleTheme, 
        isSidebarOpen, setIsSidebarOpen, 
        activeTab, setActiveTab 
    } = useDashboard();

    return (
        <div className={`min-h-screen font-sans flex ${isDarkMode ? 'dark' : ''}`}>
        <div className="flex w-full min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-300">
            
            <Sidebar 
            isSidebarOpen={isSidebarOpen} 
            setIsSidebarOpen={setIsSidebarOpen}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            />

            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
            
            <TopHeader 
                setIsSidebarOpen={setIsSidebarOpen}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
            />

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Contenido dinámico: Aquí podrías usar un Switch basado en "activeTab" en el futuro */}
                {activeTab === 'dashboard' && (
                    <>
                    <WelcomeBanner />
                    <MetricsGrid />
                    <ChartsSection />
                    </>
                )}

                {/* Ejemplo de cómo crecerá:
                {activeTab === 'pacientes' && <PacientesView />}
                {activeTab === 'agenda' && <AgendaView />}
                */}
                
                </div>
            </div>

            </main>
        </div>
        </div>
    );
};
