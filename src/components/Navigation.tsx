import React, { useState } from 'react';
import { useApp, AppView } from '../context/AppContext';
import { 
  LayoutGrid, 
  ShieldCheck, 
  Milestone, 
  FileText, 
  Truck, 
  Building2, 
  Calculator, 
  AlertTriangle, 
  Sparkles, 
  Users2, 
  Bell, 
  Plus, 
  ChevronDown, 
  Globe, 
  CheckCircle2, 
  AlertCircle,
  Ship,
  LogOut,
  ExternalLink,
  Search
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { 
    user, 
    business, 
    projects, 
    activeProjectId, 
    setActiveProjectId, 
    currentView, 
    setCurrentView,
    setIsNewProjectModalOpen,
    setIsCopilotDrawerOpen,
    language,
    setLanguage,
    notifications,
    markNotificationRead,
    loginAs,
    logout,
    t
  } = useApp();

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const activeProject = projects.find(p => p.id === activeProjectId);
  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems: { view: AppView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { view: 'dashboard', label: t('dashboard'), icon: LayoutGrid },
    { view: 'readiness', label: t('readinessScore'), icon: ShieldCheck },
    { view: 'roadmap', label: t('roadmap'), icon: Milestone },
    { view: 'documents', label: t('documentVault'), icon: FileText },
    { view: 'logistics', label: t('logisticsCHA'), icon: Truck },
    { view: 'cost', label: t('costEstimator'), icon: Calculator },
    { view: 'risk', label: t('riskRadar'), icon: AlertTriangle },
    { view: 'copilot', label: t('copilot'), icon: Sparkles },
    { view: 'role_management', label: t('rolePortal'), icon: Users2 }
  ];

  return (
    <>
      {/* Top Header Bar */}
      <header className="h-16 bg-white border-b border-stone-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-4">
          {/* Logo & Platform Name */}
          <div 
            onClick={() => setCurrentView('landing')}
            className="flex items-center space-x-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-800 flex items-center justify-center text-white font-bold shadow-sm group-hover:bg-teal-700 transition">
              <Ship className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-stone-900 tracking-tight text-base sm:text-lg">EXPORTPILOT</span>
                <span className="text-xs px-1.5 py-0.5 rounded font-semibold bg-teal-100 text-teal-800">AI</span>
              </div>
              <p className="text-[10px] text-stone-500 hidden sm:block">From India-ready to Export-ready</p>
            </div>
          </div>

          <div className="h-5 w-px bg-stone-200 hidden md:block" />

          {/* Project Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-white text-xs text-stone-800 font-medium transition max-w-[220px] sm:max-w-[320px]"
            >
              <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
              <span className="truncate">{activeProject ? `${activeProject.name}` : 'Select Consignment'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            </button>

            {isProjectDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 border-b border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Export Consignments</span>
                  <button 
                    onClick={() => {
                      setIsProjectDropdownOpen(false);
                      setIsNewProjectModalOpen(true);
                    }}
                    className="text-[11px] font-medium text-teal-700 hover:text-teal-800 flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Export</span>
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveProjectId(p.id);
                        setIsProjectDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-start space-x-2.5 hover:bg-stone-50 transition ${
                        p.id === activeProjectId ? 'bg-teal-50/70 font-semibold text-teal-900' : 'text-stone-700'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${p.status === 'In Transit' ? 'bg-blue-500' : p.readinessScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <div className="flex-1 truncate">
                        <div className="truncate">{p.name}</div>
                        <div className="text-[10px] text-stone-500 font-normal">
                          {p.destinationCountry} • ${p.estimatedValue.toLocaleString()} • {p.readinessScore}% Ready
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Pill Tabs (Desktop) */}
        <nav className="hidden lg:flex items-center space-x-1 bg-stone-100 p-1 rounded-xl border border-stone-200/80">
          {navItems.slice(0, 5).map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  isActive 
                    ? 'bg-white text-teal-900 shadow-xs' 
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-700' : 'text-stone-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <div className="flex items-center bg-stone-100 rounded-lg p-0.5 text-[11px] font-medium border border-stone-200">
            <button 
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded ${language === 'en' ? 'bg-white shadow-xs text-stone-900 font-semibold' : 'text-stone-500 hover:text-stone-800'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage('hi')}
              className={`px-2 py-0.5 rounded ${language === 'hi' ? 'bg-white shadow-xs text-stone-900 font-semibold' : 'text-stone-500 hover:text-stone-800'}`}
            >
              हिंदी
            </button>
            <button 
              onClick={() => setLanguage('mr')}
              className={`px-2 py-0.5 rounded ${language === 'mr' ? 'bg-white shadow-xs text-stone-900 font-semibold' : 'text-stone-500 hover:text-stone-800'}`}
            >
              मराठी
            </button>
          </div>

          {/* AI Copilot Quick Trigger */}
          <button
            onClick={() => setCurrentView('copilot')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold hover:bg-teal-100 transition shadow-2xs"
            title="Ask AI Export Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Copilot</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
              className="p-2 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {isNotifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50">
                <div className="px-3 py-1.5 border-b border-stone-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-900">Trade Alerts ({unreadCount} new)</span>
                  <span className="text-[10px] text-stone-400">DGFT & Vessel Updates</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 text-xs cursor-pointer hover:bg-stone-50 transition ${!n.read ? 'bg-amber-50/50' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-stone-900">{n.title}</span>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                      </div>
                      <p className="text-[11px] text-stone-600 leading-snug">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Chip / Role Switcher */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center space-x-2 p-1 pr-2 rounded-xl hover:bg-stone-100 border border-transparent hover:border-stone-200 transition"
              >
                <div className="w-7 h-7 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-stone-900 leading-none">{user.name}</div>
                  <div className="text-[10px] text-stone-500 uppercase tracking-wider">{user.role}</div>
                </div>
                <ChevronDown className="w-3 h-3 text-stone-400 hidden sm:block" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-stone-100">
                    <p className="font-bold text-stone-900">{user.name}</p>
                    <p className="text-[11px] text-stone-500">{user.email}</p>
                    {business && (
                      <p className="text-[10px] text-teal-700 font-medium mt-1">
                        {business.name} • {business.gstStatus === 'Verified' ? 'GST Verified' : 'GST Pending'}
                      </p>
                    )}
                  </div>
                  
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                    Switch Test Account Role
                  </div>
                  <button 
                    onClick={() => { loginAs('vikram@palgharleather.com'); setIsRoleDropdownOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-stone-50 text-stone-700 flex items-center justify-between"
                  >
                    <span>Vikram (MSME Exporter)</span>
                    {user.role === 'msme' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                  <button 
                    onClick={() => { loginAs('ananya@globaltradeadvisors.in'); setIsRoleDropdownOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-stone-50 text-stone-700 flex items-center justify-between"
                  >
                    <span>Ananya (Export Consultant)</span>
                    {user.role === 'consultant' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                  <button 
                    onClick={() => { loginAs('arjun@dgftfreight.com'); setIsRoleDropdownOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-stone-50 text-stone-700 flex items-center justify-between"
                  >
                    <span>Arjun (Logistics CHA)</span>
                    {user.role === 'logistics' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                  <button 
                    onClick={() => { loginAs('admin@exportpilot.ai'); setIsRoleDropdownOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-stone-50 text-stone-700 flex items-center justify-between"
                  >
                    <span>Admin (DGFT Rules Master)</span>
                    {user.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                  </button>

                  <div className="border-t border-stone-100 my-1" />
                  <button 
                    onClick={() => { logout(); setIsRoleDropdownOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center space-x-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setCurrentView('landing')}
              className="px-3 py-1.5 rounded-lg bg-teal-800 text-white text-xs font-semibold hover:bg-teal-700 transition shadow-xs"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Sub-Header Context Bar when in App View */}
      {currentView !== 'landing' && business && (
        <div className="bg-stone-50 border-b border-stone-200 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between text-xs text-stone-600 gap-2">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-stone-800">{business.name}</span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-500">{business.city}, {business.state}</span>
            <span className="text-stone-300">•</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
              IEC: {business.iecNumber}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 hidden sm:inline">
              GSTIN: {business.gstNumber}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentView('cost')}
              className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 font-medium transition text-[11px]"
            >
              {t('costEstimator')}
            </button>
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-teal-800 text-white font-medium hover:bg-teal-700 transition text-[11px] flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>+ {t('newConsignment')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary Module Navigation Strip */}
      {currentView !== 'landing' && (
        <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-1.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-1.5 min-w-max">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setCurrentView(item.view)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-teal-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-200' : 'text-stone-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
