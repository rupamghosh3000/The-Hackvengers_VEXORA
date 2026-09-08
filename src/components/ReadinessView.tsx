import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Printer,
  Sparkles,
  ExternalLink,
  Plus
} from 'lucide-react';

export const ReadinessView: React.FC = () => {
  const { activeProjectDetail, refreshProjectData, setCurrentView, showToast } = useApp();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const detail = activeProjectDetail;
  if (!detail) {
    return <div className="p-8 text-center text-stone-500">Loading readiness assessment...</div>;
  }

  const { project, readiness } = detail;

  const handleRecalculate = async () => {
    setIsRefreshing(true);
    await refreshProjectData();
    setIsRefreshing(false);
    showToast('Readiness score recalculated against active documents');
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategory(expandedCategory === cat ? null : cat);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-900 font-mono">
              {project.id}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              Export Readiness Audit Engine
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Consignment: <span className="font-semibold text-stone-800">{project.name}</span> • Destination: <span className="font-semibold text-stone-800">{project.destinationCountry} ({project.destinationPort})</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRecalculate}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-2xs transition flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-stone-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Recalculate Audit</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export Audit PDF</span>
          </button>
        </div>
      </div>

      {/* Main Readiness Gauge & Summary Banner */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
        <div className="lg:col-span-1 flex flex-col items-center justify-center p-4 bg-stone-50 rounded-xl border border-stone-200 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">Composite Score</span>
          <div className="text-5xl font-black text-teal-900">{readiness.overallScore}<span className="text-xl font-normal text-stone-400">/100</span></div>
          <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${
            readiness.overallScore >= 90 ? 'bg-emerald-100 text-emerald-800' :
            readiness.overallScore >= 75 ? 'bg-teal-100 text-teal-800' :
            readiness.overallScore >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
          }`}>
            {readiness.status}
          </span>
          <p className="text-[10px] text-stone-400 mt-2">
            Last recalculated: {new Date(readiness.lastCalculatedAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {/* Critical Blockers if any */}
          {readiness.criticalBlockers.length > 0 && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <div className="flex items-center space-x-2 text-red-900 font-bold text-xs mb-1">
                <AlertOctagon className="w-4 h-4 text-red-600" />
                <span>Critical Export Blocker ({readiness.criticalBlockers.length})</span>
              </div>
              <ul className="text-xs text-red-800 space-y-1 list-disc pl-5">
                {readiness.criticalBlockers.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {readiness.warnings.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Advisory Warnings ({readiness.warnings.length})</span>
              </div>
              <ul className="text-xs text-amber-800 space-y-1 list-disc pl-5">
                {readiness.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Recommended Actions */}
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-1.5 text-teal-950 font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                <span>Recommended Action for 90+ Score</span>
              </div>
              <p className="text-xs text-teal-900 mt-1 leading-snug">
                {readiness.recommendedNextActions[0]}
              </p>
            </div>
            <button
              onClick={() => setCurrentView('documents')}
              className="px-3.5 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold shadow-2xs whitespace-nowrap transition"
            >
              Upload Document
            </button>
          </div>
        </div>
      </div>

      {/* 9 Weighted Assessment Categories Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900">
            Weighted Assessment Categories (9 Pillars)
          </h2>
          <span className="text-xs text-stone-500 font-medium">Click any pillar to view detailed checklist criteria</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {readiness.categories.map((cat, idx) => {
            const isExpanded = expandedCategory === cat.category;
            return (
              <div 
                key={idx}
                className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-5 flex flex-col justify-between transition hover:border-teal-300"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 leading-snug">{cat.category}</h3>
                      <p className="text-[11px] text-stone-400 font-medium mt-0.5">
                        Weight: {Math.round(cat.weight * 100)}% • Contribution: {cat.weightedScore} pts
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      cat.score >= 85 ? 'bg-teal-100 text-teal-800' :
                      cat.score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {cat.score}%
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden my-3">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        cat.score >= 85 ? 'bg-teal-600' : cat.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>

                  {/* Passed vs Total stats */}
                  <div className="text-[11px] text-stone-500 font-medium mb-3">
                    {cat.completed} of {cat.total} mandatory requirements satisfied
                  </div>

                  {/* Checklist Items Preview */}
                  <div className="space-y-2 border-t border-stone-100 pt-3">
                    {cat.items.slice(0, isExpanded ? cat.items.length : 2).map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-start space-x-2 text-xs">
                        {item.status === 'completed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        ) : item.status === 'blocked' ? (
                          <AlertOctagon className="w-3.5 h-3.5 text-red-600 mt-0.5 shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1 leading-snug">
                          <span className={item.status === 'completed' ? 'text-stone-700' : 'font-semibold text-stone-900'}>
                            {item.title}
                          </span>
                          {item.note && (
                            <span className="block text-[10px] text-stone-400 font-mono mt-0.5">{item.note}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expand Toggle button */}
                {cat.items.length > 2 && (
                  <button
                    onClick={() => toggleCategory(cat.category)}
                    className="mt-3 pt-2 border-t border-stone-100 text-[11px] font-semibold text-teal-800 hover:text-teal-900 flex items-center justify-between w-full"
                  >
                    <span>{isExpanded ? 'Show Less' : `View All ${cat.items.length} Criteria`}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
