import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { RiskFactor } from '../../server/services/rulesEngine';
import { 
  AlertTriangle, 
  AlertOctagon, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Filter, 
  Sparkles, 
  FileText, 
  Clock
} from 'lucide-react';

export const RiskRadarView: React.FC = () => {
  const { activeProjectDetail, setCurrentView, showToast } = useApp();
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [risks, setRisks] = useState<RiskFactor[]>(activeProjectDetail?.risks || []);

  const project = activeProjectDetail?.project;

  useEffect(() => {
    if (activeProjectDetail?.risks) {
      setRisks(activeProjectDetail.risks);
    }
  }, [activeProjectDetail?.risks]);

  const filteredRisks = risks.filter(r => {
    if (severityFilter === 'All') return true;
    return r.severity === severityFilter;
  });

  const handleResolveRisk = (id: string) => {
    let riskTitle = '';
    let wasResolved = false;

    setRisks(prev => {
      return prev.map(r => {
        if (r.id === id) {
          riskTitle = r.title;
          wasResolved = !r.resolved;
          return { ...r, resolved: !r.resolved };
        }
        return r;
      });
    });

    if (riskTitle) {
      showToast(wasResolved ? `Risk "${riskTitle}" marked as resolved` : `Risk "${riskTitle}" reopened for review`);
    }
  };

  const criticalCount = risks.filter(r => r.severity === 'Critical' && !r.resolved).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 font-mono">
              RADAR
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              Export Compliance Risk Radar
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Proactive detention avoidance, statutory regulation tracking, and customs mitigation for {project?.name}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {criticalCount > 0 ? (
            <span className="px-3 py-1.5 rounded-xl bg-red-100 text-red-800 text-xs font-bold flex items-center space-x-1.5 animate-pulse">
              <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
              <span>{criticalCount} Critical Action Required</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero Critical Hazards</span>
            </span>
          )}
        </div>
      </div>

      {/* Severity Filter Chips */}
      <div className="flex items-center space-x-2">
        <span className="text-xs font-bold text-stone-500 mr-1 flex items-center space-x-1">
          <Filter className="w-3 h-3" />
          <span>Severity:</span>
        </span>
        {['All', 'Critical', 'High', 'Medium', 'Low'].map(sev => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              severityFilter === sev
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Risks List */}
      <div className="space-y-4">
        {filteredRisks.map((risk) => {
          const isCritical = risk.severity === 'Critical';
          const isHigh = risk.severity === 'High';
          const isResolved = risk.resolved;

          return (
            <div
              key={risk.id}
              className={`bg-white rounded-2xl border p-5 sm:p-6 transition shadow-2xs ${
                isResolved 
                  ? 'border-stone-200 bg-stone-50/50 opacity-80' 
                  : isCritical
                  ? 'border-red-300 bg-red-50/15'
                  : isHigh
                  ? 'border-amber-300 bg-amber-50/10'
                  : 'border-stone-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start space-x-3.5 flex-1">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isResolved 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : isCritical 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isResolved ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-stone-900">{risk.title}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-600">
                        {risk.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isResolved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCritical
                          ? 'bg-red-100 text-red-800 animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isResolved ? 'Resolved' : risk.severity}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {risk.description}
                    </p>

                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                      <div className="text-stone-800">
                        <strong className="text-stone-900">Customs & Commercial Impact: </strong>
                        {risk.impact}
                      </div>
                      <div className="text-teal-900 font-medium">
                        <strong className="text-teal-950">Mitigation Action: </strong>
                        {risk.recommendedAction}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex flex-col sm:items-end space-y-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-stone-100">
                  <button
                    onClick={() => handleResolveRisk(risk.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-2xs ${
                      isResolved
                        ? 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                        : 'bg-teal-800 hover:bg-teal-700 text-white'
                    }`}
                  >
                    {isResolved ? 'Reopen Hazard' : 'Mark Mitigated'}
                  </button>
                  <button
                    onClick={() => setCurrentView('copilot')}
                    className="text-[11px] text-teal-800 hover:text-teal-900 font-semibold flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Ask AI Solution</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
