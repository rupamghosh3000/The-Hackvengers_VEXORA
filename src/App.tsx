import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { SidebarRail } from './components/SidebarRail';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { ReadinessView } from './components/ReadinessView';
import { RoadmapView } from './components/RoadmapView';
import { DocumentVaultView } from './components/DocumentVaultView';
import { CostEstimatorView } from './components/CostEstimatorView';
import { RiskRadarView } from './components/RiskRadarView';
import { LogisticsView } from './components/LogisticsView';
import { CopilotView } from './components/CopilotView';
import { RolePortalView } from './components/RolePortalView';
import { AuthModal } from './components/AuthModal';
import { NewProjectModal } from './components/NewProjectModal';
import { Info, X } from 'lucide-react';

function AppContent() {
  const { currentView, toastMessage, hideToast, isLoading } = useApp();

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 antialiased selection:bg-teal-100 selection:text-teal-900">
      {currentView === 'landing' ? (
        <LandingPage />
      ) : (
        <div className="flex h-screen overflow-hidden">
          {/* Left Persistent Navigation Sidebar */}
          <SidebarRail />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Navigation />

            <main className="flex-1 overflow-y-auto bg-stone-50/70">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="flex items-center space-x-2 text-stone-500 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-ping" />
                    <span>Synchronizing DGFT & Customs Ledger...</span>
                  </div>
                </div>
              ) : (
                <>
                  {currentView === 'dashboard' && <DashboardView />}
                  {(currentView === 'readiness' || currentView === 'compliance') && <ReadinessView />}
                  {currentView === 'roadmap' && <RoadmapView />}
                  {currentView === 'documents' && <DocumentVaultView />}
                  {currentView === 'cost' && <CostEstimatorView />}
                  {(currentView === 'risk' || currentView === 'risks') && <RiskRadarView />}
                  {(currentView === 'logistics' || currentView === 'customs') && <LogisticsView />}
                  {currentView === 'copilot' && <CopilotView />}
                  {currentView === 'role_management' && <RolePortalView />}
                </>
              )}
            </main>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <AuthModal />
      <NewProjectModal />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center space-x-3 text-xs">
            <Info className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
            <button
              onClick={hideToast}
              className="p-1 text-stone-400 hover:text-white transition ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
