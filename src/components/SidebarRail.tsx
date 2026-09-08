import React from 'react';
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
  Ship,
  Settings,
  HelpCircle,
  TrendingUp,
  FileCheck2
} from 'lucide-react';

export const SidebarRail: React.FC = () => {
  const { currentView, setCurrentView, user, setIsCopilotDrawerOpen } = useApp();

  const railItems: { view: AppView; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { view: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { view: 'readiness', label: 'Readiness Score', icon: ShieldCheck, badge: '78%' },
    { view: 'roadmap', label: '12-Step Roadmap', icon: Milestone },
    { view: 'documents', label: 'Document Vault', icon: FileText },
    { view: 'compliance', label: 'Product Compliance', icon: FileCheck2 },
    { view: 'logistics', label: 'Logistics & CHA', icon: Truck },
    { view: 'customs', label: 'ICEGATE Customs', icon: Building2 },
    { view: 'cost', label: 'Cost Estimator', icon: Calculator },
    { view: 'risk', label: 'Risk Radar', icon: AlertTriangle, badge: '1' },
    { view: 'copilot', label: 'AI Copilot', icon: Sparkles },
    { view: 'role_management', label: 'Role Portal', icon: Users2 }
  ];

  return (
    <aside className="w-[68px] sm:w-[72px] bg-stone-900 border-r border-stone-800 flex flex-col items-center py-4 justify-between shrink-0 select-none z-20">
      {/* Top Brand Anchor */}
      <div className="flex flex-col items-center space-y-4">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="w-10 h-10 rounded-xl bg-teal-700 hover:bg-teal-600 flex items-center justify-center text-white transition shadow-sm group relative"
          title="ExportPilot AI Home"
        >
          <Ship className="w-5 h-5 text-teal-100 group-hover:scale-105 transition" />
          <span className="sr-only">Home</span>
        </button>

        <div className="w-8 h-px bg-stone-800" />

        {/* Middle Navigation Icons */}
        <nav className="flex flex-col space-y-1.5 items-center">
          {railItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition group ${
                  isActive 
                    ? 'bg-teal-800 text-teal-100 shadow-inner' 
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <span className={`absolute -top-0.5 -right-0.5 text-[9px] px-1 py-0.2 rounded-full font-bold ${
                    item.badge === '1' ? 'bg-amber-500 text-stone-950' : 'bg-teal-500 text-stone-950'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {/* Floating tooltip */}
                <span className="absolute left-full ml-3 px-2 py-1 rounded bg-stone-800 text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition z-50 shadow-md">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Help */}
      <div className="flex flex-col items-center space-y-3">
        <button
          onClick={() => setCurrentView('copilot')}
          className="w-10 h-10 rounded-xl bg-teal-900/60 hover:bg-teal-800 text-teal-300 flex items-center justify-center transition group relative"
          title="Ask AI Copilot"
        >
          <Sparkles className="w-4 h-4" />
          <span className="absolute left-full ml-3 px-2 py-1 rounded bg-stone-800 text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition z-50 shadow-md">
            AI Copilot (Hindi & English)
          </span>
        </button>

        <div className="relative">
          <div 
            onClick={() => setCurrentView('role_management')}
            className="w-9 h-9 rounded-xl overflow-hidden border-2 border-teal-600/60 cursor-pointer hover:border-teal-400 transition"
            title={`${user?.name || 'User'} (${user?.role || 'MSME'})`}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-teal-800 text-white flex items-center justify-center font-bold text-xs">
                {user?.name?.charAt(0) || 'V'}
              </div>
            )}
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-stone-900 absolute -bottom-0.5 -right-0.5" />
        </div>
      </div>
    </aside>
  );
};
