import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Ship, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowUpRight, 
  Clock, 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Phone, 
  MessageSquare, 
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Anchor,
  Compass,
  FileCheck2,
  ExternalLink
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    projects, 
    activeProjectId, 
    setActiveProjectId, 
    activeProjectDetail, 
    setCurrentView,
    setIsNewProjectModalOpen,
    showToast,
    t
  } = useApp();

  const [filterTab, setFilterTab] = useState<'all' | 'ready' | 'transit' | 'risk'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const detail = activeProjectDetail;
  const project = detail?.project || projects[0];
  const readiness = detail?.readiness;
  const shipment = detail?.shipment;

  // Dynamic calculations across projects
  const readyProjects = projects.filter(p => p.status === 'Ready to Export' || p.readinessScore >= 80);
  const atRiskProjects = projects.filter(p => p.readinessScore < 60 || p.riskLevel === 'High');
  const inTransitProjects = projects.filter(p => p.status === 'In Transit');

  // Filter projects for table
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.destinationCountry.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterTab === 'ready') return p.status === 'Ready to Export';
    if (filterTab === 'transit') return p.status === 'In Transit';
    if (filterTab === 'risk') return p.readinessScore < 50 || p.riskLevel === 'High';
    return true;
  });

  const handleExportCsv = () => {
    const headers = 'ID,Name,Product,HSCode,Destination,Quantity,Value,Status,ReadinessScore\n';
    const rows = projects.map(p => 
      `"${p.id}","${p.name}","${p.productName}","${p.hsCode}","${p.destinationCountry}",${p.quantity},${p.estimatedValue},"${p.status}",${p.readinessScore}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ExportPilot_Consignments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Export consignments report downloaded as CSV');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Welcome & Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            MSME Export Command Center
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Palghar Leather Works • Cross-Border Operations to EU, UK & Americas
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-2xs transition flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ {t('newConsignment')}</span>
          </button>
        </div>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Active Export Shipments</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800 flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>{projects.length} Total</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-stone-900">{projects.length}</span>
            <span className="text-xs text-stone-500">Live Consignments</span>
          </div>
          <div className="mt-2 text-xs text-stone-500 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{inTransitProjects.length} Sea/Air Vessel(s) in active transit</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Ready for Dispatch</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
              {readyProjects[0]?.readinessScore || 94}% Top Score
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-stone-900">{readyProjects.length}</span>
            <span className="text-xs text-stone-500">Consignments Ready</span>
          </div>
          <div className="mt-2 text-xs text-stone-500 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate">{readyProjects[0]?.name || 'Buyer documents verified'}</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Compliance Risk Radar</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              atRiskProjects.length > 0 ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {atRiskProjects.length} {atRiskProjects.length === 1 ? 'Alert' : 'Alerts'}
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className={`text-3xl font-extrabold ${atRiskProjects.length > 0 ? 'text-red-600' : 'text-stone-900'}`}>
              {atRiskProjects[0] ? `${atRiskProjects[0].readinessScore}%` : '100%'}
            </span>
            <span className="text-xs text-stone-500">{atRiskProjects[0]?.destinationCountry || 'Compliant'}</span>
          </div>
          <div className="mt-2 text-xs text-red-700 flex items-center space-x-1.5 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="truncate">
              {atRiskProjects[0] ? `${atRiskProjects[0].name} requires testing/origin doc` : 'Zero critical compliance blockers'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Dual Bar Statistics + Right Column (Gauge & Vessel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Readiness & Milestone Statistics Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
              <div>
                <h3 className="text-base font-bold text-stone-900">Export Readiness & Compliance Overview</h3>
                <p className="text-xs text-stone-500">Active Consignment: {project.name}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-xs font-bold border border-teal-100">
                  {readiness?.status || 'Almost Ready'} ({readiness?.overallScore || 78}/100)
                </span>
                <button
                  onClick={() => setCurrentView('readiness')}
                  className="text-xs text-teal-800 hover:text-teal-900 font-semibold flex items-center space-x-0.5"
                >
                  <span>Deep Dive</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 9 Category Visual Progress Bars */}
            <div className="mt-5 space-y-3.5">
              {readiness?.categories.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-700">{cat.category}</span>
                    <span className="font-bold text-stone-900">{cat.score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        cat.score >= 85 ? 'bg-teal-600' : cat.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Footer */}
          <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-600 gap-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              <span>Next Critical Step: {readiness?.recommendedNextActions[0] || 'Complete packaging audit'}</span>
            </div>
            <button
              onClick={() => setCurrentView('roadmap')}
              className="px-3 py-1.5 rounded-lg bg-stone-900 text-white font-semibold hover:bg-stone-800 transition"
            >
              Open 12-Step Roadmap
            </button>
          </div>
        </div>

        {/* Right Col: Analytic Gauge & Active Vessel Card */}
        <div className="space-y-6">
          {/* Gauge Card */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Export Readiness Gauge</span>
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                +4.25% vs last month
              </span>
            </div>

            {/* SVG Semi-Circle Arc */}
            <div className="flex flex-col items-center py-2">
              <div className="relative w-44 h-24 flex items-center justify-center">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#e7e5e4"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#0f766e"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="125.6"
                    strokeDashoffset={125.6 * (1 - (readiness?.overallScore || 78) / 100)}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute bottom-0 text-center">
                  <span className="text-3xl font-extrabold text-stone-900">{readiness?.overallScore || 78}%</span>
                </div>
              </div>
              <p className="text-xs text-stone-500 mt-2 font-medium">Enterprise Grade Target: 90%</p>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-stone-50">
                <div className="text-[10px] text-stone-400 font-medium">Est. Value</div>
                <div className="font-bold text-stone-900">${project.estimatedValue.toLocaleString()}</div>
              </div>
              <div className="p-2 rounded-lg bg-stone-50">
                <div className="text-[10px] text-stone-400 font-medium">Destination</div>
                <div className="font-bold text-stone-900 truncate">{project.destinationCountry}</div>
              </div>
            </div>
          </div>

          {/* Active Vessel & Logistics Card */}
          <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 border border-stone-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Active Ocean Vessel</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  LEO Cleared
                </span>
              </div>

              <div className="flex items-start space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-700/60 text-teal-200 flex items-center justify-center font-bold shrink-0">
                  <Ship className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{shipment?.vesselName || 'Hamburg Express'}</h4>
                  <p className="text-xs text-stone-400">Carrier: {shipment?.carrierName || 'CMA CGM Line'}</p>
                  <p className="text-[11px] text-stone-500 font-mono mt-0.5">BL: {shipment?.blNumber || 'MAEU928419'}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-stone-800 pt-3 text-stone-300">
                <div className="flex justify-between">
                  <span className="text-stone-400">Origin Port:</span>
                  <span className="font-semibold text-white">JNPT Nhava Sheva</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Destination:</span>
                  <span className="font-semibold text-white">Port of Hamburg (DEHAM)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Position:</span>
                  <span className="text-teal-400 font-medium">Arabian Sea (18.9°N, 71.4°E)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Estimated ETA:</span>
                  <span className="font-semibold text-white">28 Dec 2024</span>
                </div>
              </div>
            </div>

            {/* CHA Contact Row */}
            <div className="mt-5 pt-3 border-t border-stone-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-white">Arjun Mehta (CHA)</div>
                <div className="text-[10px] text-stone-400">JNPT Port Desk</div>
              </div>
              <button
                onClick={() => setCurrentView('logistics')}
                className="px-2.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-medium text-xs transition flex items-center space-x-1"
              >
                <span>Full Tracking</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Shipments & Consignments Data Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-stone-900">Export Consignments Directory</h3>
            <p className="text-xs text-stone-500">Track and manage active cross-border orders across foreign buyers</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-semibold text-stone-600">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1 rounded-lg transition ${filterTab === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'hover:text-stone-900'}`}
              >
                All ({projects.length})
              </button>
              <button
                onClick={() => setFilterTab('ready')}
                className={`px-3 py-1 rounded-lg transition ${filterTab === 'ready' ? 'bg-white text-stone-900 shadow-2xs' : 'hover:text-stone-900'}`}
              >
                Ready (1)
              </button>
              <button
                onClick={() => setFilterTab('transit')}
                className={`px-3 py-1 rounded-lg transition ${filterTab === 'transit' ? 'bg-white text-stone-900 shadow-2xs' : 'hover:text-stone-900'}`}
              >
                In Transit (1)
              </button>
              <button
                onClick={() => setFilterTab('risk')}
                className={`px-3 py-1 rounded-lg transition ${filterTab === 'risk' ? 'bg-white text-stone-900 shadow-2xs' : 'hover:text-stone-900'}`}
              >
                High Risk (1)
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders or ports..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600 w-48 sm:w-60"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Order ID & Name</th>
                <th className="py-3.5 px-4">Product Category</th>
                <th className="py-3.5 px-4">Overseas Buyer</th>
                <th className="py-3.5 px-4">Destination Port</th>
                <th className="py-3.5 px-4">Target Date</th>
                <th className="py-3.5 px-4">Declared Value</th>
                <th className="py-3.5 px-4">Readiness</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {filteredProjects.map((p) => (
                <tr 
                  key={p.id}
                  onClick={() => setActiveProjectId(p.id)}
                  className={`hover:bg-teal-50/40 cursor-pointer transition ${
                    p.id === activeProjectId ? 'bg-teal-50/60' : ''
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-stone-900">{p.name}</div>
                    <div className="text-[10px] text-stone-400 font-mono">{p.id}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div>{p.productName}</div>
                    <div className="text-[10px] text-stone-400">HS: {p.hsCode}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-stone-800">{p.buyerCompany}</div>
                    <div className="text-[10px] text-stone-500">{p.buyerName}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div>{p.destinationPort}</div>
                    <div className="text-[10px] text-stone-400">{p.destinationCountry}</div>
                  </td>
                  <td className="py-3.5 px-4 text-stone-600 font-mono">
                    {p.targetShipmentDate}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-stone-900">
                    ${p.estimatedValue.toLocaleString()} {p.currency}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 rounded-full bg-stone-100 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            p.readinessScore >= 80 ? 'bg-teal-600' : p.readinessScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${p.readinessScore}%` }}
                        />
                      </div>
                      <span className="font-bold text-stone-900">{p.readinessScore}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      p.status === 'In Transit'
                        ? 'bg-blue-100 text-blue-800'
                        : p.status === 'Ready to Export'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProjectId(p.id);
                          setCurrentView('readiness');
                        }}
                        className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition"
                        title="View Readiness"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProjectId(p.id);
                          setCurrentView('documents');
                        }}
                        className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition"
                        title="Document Vault"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProjectId(p.id);
                          setCurrentView('roadmap');
                        }}
                        className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition"
                        title="Roadmap"
                      >
                        <ChevronRight className="w-4 h-4 text-teal-800" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
