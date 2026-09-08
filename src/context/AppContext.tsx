import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Business, ExportProject, NotificationItem, RequirementStatus } from '../types';
import { apiClient, ProjectDetailResponse } from '../services/apiClient';
import { getTranslation, SupportedLanguage } from '../utils/translations';

export type AppView = 
  | 'landing'
  | 'dashboard'
  | 'readiness'
  | 'roadmap'
  | 'documents'
  | 'compliance'
  | 'packaging'
  | 'buyer'
  | 'logistics'
  | 'customs'
  | 'insurance'
  | 'cost'
  | 'timeline'
  | 'risk'
  | 'shipment'
  | 'copilot'
  | 'role_management';

interface AppContextType {
  user: User | null;
  business: Business | null;
  projects: ExportProject[];
  activeProjectId: string;
  activeProjectDetail: ProjectDetailResponse | null;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  setActiveProjectId: (id: string) => void;
  isLoading: boolean;
  refreshProjectData: () => Promise<void>;
  updateRoadmapStep: (stepId: number, status: RequirementStatus) => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isNewProjectModalOpen: boolean;
  setIsNewProjectModalOpen: (open: boolean) => void;
  isCopilotDrawerOpen: boolean;
  setIsCopilotDrawerOpen: (open: boolean) => void;
  language: 'en' | 'hi' | 'mr';
  setLanguage: (lang: 'en' | 'hi' | 'mr') => void;
  t: (key: string, fallback?: string) => string;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => Promise<void>;
  loginAs: (email: string) => Promise<void>;
  logout: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  hideToast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [projects, setProjects] = useState<ExportProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('EXP-2025-0142');
  const [activeProjectDetail, setActiveProjectDetail] = useState<ProjectDetailResponse | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState<boolean>(false);
  const [isCopilotDrawerOpen, setIsCopilotDrawerOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const hideToast = () => {
    setToastMessage(null);
  };

  const t = useCallback((key: string, fallback?: string) => {
    return getTranslation(language, key, fallback);
  }, [language]);

  // Initial Load
  const initApp = useCallback(async () => {
    try {
      setIsLoading(true);
      const authData = await apiClient.getCurrentUser();
      setUser(authData.user);
      setBusiness(authData.business);

      const projs = await apiClient.getProjects();
      setProjects(projs);
      if (projs.length > 0) {
        const targetId = projs[0].id;
        setActiveProjectId(targetId);
        const detail = await apiClient.getProjectDetail(targetId);
        setActiveProjectDetail(detail);
      }

      const notifs = await apiClient.getNotifications();
      setNotifications(notifs);
    } catch (e) {
      console.error('Failed to init app:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initApp();
  }, [initApp]);

  // Load project details when activeProjectId changes
  const refreshProjectData = useCallback(async () => {
    if (!activeProjectId) return;
    try {
      const detail = await apiClient.getProjectDetail(activeProjectId);
      setActiveProjectDetail(detail);
      const projs = await apiClient.getProjects();
      setProjects(projs);
      const notifs = await apiClient.getNotifications();
      setNotifications(notifs);
    } catch (e) {
      console.error('Failed to refresh project data:', e);
    }
  }, [activeProjectId]);

  useEffect(() => {
    if (activeProjectId) {
      refreshProjectData();
    }
  }, [activeProjectId, refreshProjectData]);

  const loginAs = async (email: string) => {
    try {
      setIsLoading(true);
      const res = await apiClient.login(email);
      setUser(res.user);
      setBusiness(res.business);
      setIsAuthModalOpen(false);
      setCurrentView('dashboard');
      showToast(`Welcome back, ${res.user.name} (${res.user.role.toUpperCase()})`);
      await refreshProjectData();
    } catch (e: any) {
      showToast(e.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentView('landing');
    showToast('Signed out of ExportPilot AI');
  };

  const markNotificationRead = async (id: string) => {
    await apiClient.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const updateRoadmapStep = async (stepId: number, status: RequirementStatus) => {
    if (!activeProjectId || !activeProjectDetail) return;

    const previousRoadmap = activeProjectDetail.roadmap;
    const updatedRoadmap = previousRoadmap.map(s => {
      if (s.id === stepId) {
        return {
          ...s,
          status,
          nextAction: status === 'Completed' ? 'Milestone Cleared & Verified' : 'In Progress'
        };
      }
      return s;
    });

    // Immediate optimistic update so view switching retains the status instantly
    setActiveProjectDetail(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        roadmap: updatedRoadmap
      };
    });

    try {
      const res = await apiClient.updateRoadmapStep(activeProjectId, stepId, status);
      if (res && res.roadmap) {
        setActiveProjectDetail(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            roadmap: res.roadmap
          };
        });
      }
    } catch (err: any) {
      console.error('Failed to persist roadmap step status:', err);
      // Revert on failure
      setActiveProjectDetail(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          roadmap: previousRoadmap
        };
      });
      showToast('Failed to save milestone progress. Please retry.');
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        business,
        projects,
        activeProjectId,
        activeProjectDetail,
        currentView,
        setCurrentView,
        setActiveProjectId,
        isLoading,
        refreshProjectData,
        updateRoadmapStep,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isNewProjectModalOpen,
        setIsNewProjectModalOpen,
        isCopilotDrawerOpen,
        setIsCopilotDrawerOpen,
        language,
        setLanguage,
        t,
        notifications,
        markNotificationRead,
        loginAs,
        logout,
        toastMessage,
        showToast,
        hideToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
