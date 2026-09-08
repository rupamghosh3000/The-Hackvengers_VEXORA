import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RoadmapStep } from '../../server/services/rulesEngine';
import { RequirementStatus } from '../types';
import { 
  Milestone, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  FileText, 
  User, 
  Calendar, 
  ChevronRight, 
  ArrowRight,
  Filter,
  Sparkles,
  DollarSign
} from 'lucide-react';

export const RoadmapView: React.FC = () => {
  const { activeProjectDetail, setCurrentView, showToast, updateRoadmapStep } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const steps = activeProjectDetail?.roadmap || [];
  const project = activeProjectDetail?.project;

  const categories = ['All', 'Business', 'Compliance', 'Packaging', 'Labelling', 'Buyer', 'Logistics', 'Customs', 'Insurance'];

  const filteredSteps = steps.filter(step => {
    if (selectedCategory === 'All') return true;
    return step.category === selectedCategory;
  });

  const handleToggleStatus = async (stepId: number) => {
    const currentStep = steps.find(s => s.id === stepId);
    if (!currentStep) return;

    const nextStatus: RequirementStatus = currentStep.status === 'Completed' ? 'In Progress' : 'Completed';
    showToast(`Step ${currentStep.stepNumber} marked as "${nextStatus}"`);
    await updateRoadmapStep(stepId, nextStatus);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-900 font-mono">
              12 PHASES
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              Export Execution Roadmap
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Personalized export compliance and logistics lifecycle for {project?.name || 'Active Consignment'}
          </p>
        </div>

        {/* Progress Pill */}
        <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl border border-stone-200 shadow-2xs">
          <div className="text-right">
            <div className="text-xs font-bold text-stone-900">
              {steps.filter(s => s.status === 'Completed').length} of {steps.length} Milestones Cleared
            </div>
            <div className="text-[10px] text-stone-400">DGFT & Port Customs Aligned</div>
          </div>
          <div className="w-10 h-10 rounded-full border-3 border-teal-600 flex items-center justify-center font-bold text-xs text-teal-800">
            {steps.length > 0 ? Math.round((steps.filter(s => s.status === 'Completed').length / steps.length) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-stone-500 mr-1 flex items-center space-x-1">
          <Filter className="w-3 h-3" />
          <span>Filter:</span>
        </span>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-teal-800 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stepper Timeline List */}
      <div className="space-y-4">
        {filteredSteps.map((step) => {
          const isCompleted = step.status === 'Completed';
          const isBlocked = step.status === 'Blocked';
          const isInProgress = step.status === 'In Progress';

          return (
            <div
              key={step.id}
              className={`bg-white rounded-2xl border p-5 sm:p-6 transition shadow-2xs ${
                isCompleted 
                  ? 'border-stone-200 hover:border-teal-300' 
                  : isBlocked
                  ? 'border-red-300 bg-red-50/20'
                  : 'border-amber-200 bg-amber-50/10'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Step Info */}
                <div className="flex items-start space-x-3.5 flex-1">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCompleted 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : isBlocked 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-700" /> : step.stepNumber}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-stone-900">{step.title}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-600">
                        {step.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCompleted 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : isBlocked 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {step.status}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed max-w-3xl">
                      {step.description}
                    </p>

                    {/* Metadata tags: Required Documents, Duration, Cost, Responsible Party */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 pt-2 font-medium">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>Duration: {step.estimatedDuration}</span>
                      </div>
                      {step.estimatedCost && (
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-3.5 h-3.5 text-stone-400" />
                          <span>Cost: {step.estimatedCost}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>Lead: {step.responsibleParty}</span>
                      </div>
                    </div>

                    {/* Required Documents pills */}
                    {step.requiredDocuments.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mr-1">
                          Required Docs:
                        </span>
                        {step.requiredDocuments.map((doc, dIdx) => (
                          <span
                            key={dIdx}
                            onClick={() => setCurrentView('documents')}
                            className="px-2 py-0.5 rounded bg-stone-100 hover:bg-teal-100 hover:text-teal-900 cursor-pointer text-[10px] font-medium text-stone-700 transition"
                          >
                            {doc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action: Status Toggle & Next Action */}
                <div className="flex flex-col sm:items-end space-y-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-stone-100">
                  <div className="text-[11px] text-stone-500 text-left sm:text-right">
                    <span className="font-semibold text-stone-700">Next Action: </span>
                    <span className="text-stone-900">{step.nextAction}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleStatus(step.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-2xs ${
                        isCompleted
                          ? 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          : 'bg-teal-800 hover:bg-teal-700 text-white'
                      }`}
                    >
                      {isCompleted ? 'Mark In Progress' : 'Mark as Completed'}
                    </button>
                    <button
                      onClick={() => setCurrentView('copilot')}
                      className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 transition"
                      title="Ask Copilot about this step"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
