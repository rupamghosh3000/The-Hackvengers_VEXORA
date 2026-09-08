import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../services/apiClient';
import { UserRole } from '../types';
import { 
  Users2, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Edit3, 
  Save, 
  FileText, 
  Scale, 
  Clock, 
  Plus, 
  Trash2, 
  AlertTriangle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export const RolePortalView: React.FC = () => {
  const { user, business, loginAs, refreshProjectData, showToast } = useApp();

  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [bizFormData, setBizFormData] = useState({
    name: business?.name || 'Palghar Leather Works Pvt Ltd',
    ownerName: business?.ownerName || 'Vikram Singhania',
    phone: business?.phone || '+91 98201 88472',
    address: business?.address || 'Plot 48, MIDC Tarapur Industrial Area',
    city: business?.city || 'Palghar',
    state: business?.state || 'Maharashtra',
    pinCode: business?.pinCode || '401506',
    gstNumber: business?.gstNumber || '27AABCP8841K1Z2',
    iecNumber: business?.iecNumber || '0308012948',
    primaryProductCategory: business?.primaryProductCategory || 'Finished Leather Goods & Footwear'
  });

  const [rules, setRules] = useState<any[]>([
    {
      id: 'rule-dgft-1',
      productCategory: 'Finished Leather & Travel Goods',
      destinationCountry: 'European Union (EU)',
      requirementType: 'Chemical Testing',
      title: 'EU REACH Regulation (EC 1907/2006) - Chromium VI Limit',
      description: 'Hexavalent Chromium content must not exceed 3.0 mg/kg in leather articles coming into direct contact with skin.',
      priority: 'High',
      source: 'DGFT Export Policy / EU ECHA'
    },
    {
      id: 'rule-dgft-2',
      productCategory: 'Footwear & Accessories',
      destinationCountry: 'United Kingdom',
      requirementType: 'Customs Valuation',
      title: 'UK FTA Preference Certificate & Origin Declaration',
      description: 'Minimum 40% value addition within India required for preferential tariff quota under UK Generalised Scheme of Preferences.',
      priority: 'Medium',
      source: 'Ministry of Commerce & Industry'
    },
    {
      id: 'rule-dgft-3',
      productCategory: 'All Industrial Goods',
      destinationCountry: 'All Countries',
      requirementType: 'Statutory Documentation',
      title: 'DGFT ICEGATE Electronic Shipping Bill & LEO Clearance',
      description: 'Filing of Shipping Bill with verified RBI Authorized Dealer Code and GST LUT bond prior to container gate-in.',
      priority: 'High',
      source: 'Indian Customs (CBIC)'
    }
  ]);

  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState('Finished Leather');
  const [newRuleDest, setNewRuleDest] = useState('European Union');
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [isSavingBiz, setIsSavingBiz] = useState(false);

  const personas: { role: UserRole; name: string; title: string; desc: string; badge: string }[] = [
    {
      role: 'msme',
      name: 'Vikram Singhania',
      title: 'Managing Director, Palghar Leather Works',
      desc: 'Tier-2 Indian manufacturing unit exporting goods to Europe. Needs end-to-end guidance, document auditing, and cost certainty.',
      badge: 'MSME Exporter'
    },
    {
      role: 'logistics',
      name: 'Arjun Mehta',
      title: 'Licensed Customs House Agent (CHA)',
      desc: 'JNPT Port clearance specialist (License 11/2014). Monitors vessel logistics, bill of lading issuance, and ICEGATE queries.',
      badge: 'Port Logistics & Customs'
    },
    {
      role: 'consultant',
      name: 'Ananya Sharma',
      title: 'Senior Cross-Border Trade & Legal Counsel',
      desc: 'Ex-DGFT policy consultant advising on preferential tariff rules of origin, chemical testing protocols, and RoDTEP claims.',
      badge: 'Trade Advisory'
    },
    {
      role: 'admin',
      name: 'Officer Rajesh Verma',
      title: 'DGFT Zonal Joint Director General',
      desc: 'Ministry of Commerce & Industry supervisor reviewing national export incentives, HS code quotas, and FTP notifications.',
      badge: 'Regulatory Admin'
    }
  ];

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBiz(true);
    try {
      await apiClient.updateBusiness(bizFormData);
      await refreshProjectData();
      setIsEditingBusiness(false);
      showToast('Indian Enterprise Profile verified and updated on ICEGATE ledger.');
    } catch (err: any) {
      showToast(err.message || 'Failed to update business profile');
    } finally {
      setIsSavingBiz(false);
    }
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleTitle.trim()) return;
    const newRule = {
      id: 'rule-' + Date.now(),
      productCategory: newRuleCategory,
      destinationCountry: newRuleDest,
      requirementType: 'Statutory Compliance',
      title: newRuleTitle.trim(),
      description: 'Custom regulatory mandate configured for cross-border export screening.',
      priority: 'High',
      source: 'Internal Compliance Policy'
    };
    setRules(prev => [newRule, ...prev]);
    setNewRuleTitle('');
    setIsAddingRule(false);
    showToast('New compliance screening rule activated');
  };

  const handleDeleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    showToast('Rule removed from active catalog');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-900 font-mono">
              ACCESS & GOVERNANCE
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              Enterprise Profile & Stakeholder Portal
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Manage Indian business credentials, switch cross-border user roles, and inspect DGFT compliance rules
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>IEC & GSTIN Verified</span>
          </span>
        </div>
      </div>

      {/* Persona Role Switcher */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
              <Users2 className="w-4 h-4 text-teal-700" />
              <span>Multi-Stakeholder Persona Switcher</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Experience ExportPilot AI through different trade actor viewpoints (Active: <strong className="text-teal-900 font-bold">{user?.name}</strong>)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {personas.map(p => {
            const isCurrent = user?.role === p.role;
            return (
              <div 
                key={p.role}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                  isCurrent 
                    ? 'border-teal-600 bg-teal-50/50 shadow-xs ring-1 ring-teal-600' 
                    : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50'
                }`}
                onClick={() => loginAs(p.role)}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCurrent ? 'bg-teal-700 text-white' : 'bg-stone-100 text-stone-700'
                    }`}>
                      {p.badge}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-teal-800 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-stone-900">{p.name}</h4>
                  <p className="text-[11px] text-teal-800 font-medium mt-0.5">{p.title}</p>
                  <p className="text-xs text-stone-500 mt-2 leading-relaxed">{p.desc}</p>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    loginAs(p.role);
                  }}
                  className={`mt-4 w-full py-1.5 rounded-lg text-xs font-semibold transition ${
                    isCurrent 
                      ? 'bg-teal-800 text-white' 
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                  }`}
                >
                  {isCurrent ? 'Current Persona' : `Switch to ${p.name.split(' ')[0]}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enterprise Information Card (Editable) */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">{business?.name || 'Palghar Leather Works Pvt Ltd'}</h3>
              <p className="text-xs text-stone-500">DGFT Exporter of Record • Udyam Registered Micro-Enterprise</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditingBusiness(!isEditingBusiness)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition flex items-center space-x-1.5"
          >
            <Edit3 className="w-3.5 h-3.5 text-stone-500" />
            <span>{isEditingBusiness ? 'Cancel Editing' : 'Edit Business Profile'}</span>
          </button>
        </div>

        {isEditingBusiness ? (
          <form onSubmit={handleSaveBusiness} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Company Registered Name</label>
                <input
                  type="text"
                  value={bizFormData.name}
                  onChange={e => setBizFormData({ ...bizFormData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Primary Authorized Partner / Signatory</label>
                <input
                  type="text"
                  value={bizFormData.ownerName}
                  onChange={e => setBizFormData({ ...bizFormData, ownerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={bizFormData.phone}
                  onChange={e => setBizFormData({ ...bizFormData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">DGFT Import Export Code (IEC)</label>
                <input
                  type="text"
                  value={bizFormData.iecNumber}
                  onChange={e => setBizFormData({ ...bizFormData, iecNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-teal-600 focus:outline-hidden font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Goods & Services Tax (GSTIN)</label>
                <input
                  type="text"
                  value={bizFormData.gstNumber}
                  onChange={e => setBizFormData({ ...bizFormData, gstNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-teal-600 focus:outline-hidden font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Registered Factory City</label>
                <input
                  type="text"
                  value={bizFormData.city}
                  onChange={e => setBizFormData({ ...bizFormData, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-stone-100">
              <button
                type="submit"
                disabled={isSavingBiz}
                className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-semibold flex items-center space-x-1.5 shadow-xs transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingBiz ? 'Updating Ledger...' : 'Save & Verify Changes'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">DGFT IEC Code</span>
              <span className="text-sm font-mono font-bold text-stone-900 mt-1 block">
                {business?.iecNumber || '0308012948'}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center space-x-1 mt-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Status: Active</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">GSTIN Registration</span>
              <span className="text-sm font-mono font-bold text-stone-900 mt-1 block">
                {business?.gstNumber || '27AABCP8841K1Z2'}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center space-x-1 mt-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>LUT Bond Active</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Udyam Registration</span>
              <span className="text-sm font-mono font-bold text-stone-900 mt-1 block">
                UDYAM-MH-26-0019284
              </span>
              <span className="text-[10px] text-teal-800 font-semibold flex items-center space-x-1 mt-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Small Enterprise</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Registered Location</span>
              <span className="text-sm font-bold text-stone-900 mt-1 block">
                {business?.city || 'Palghar'}, {business?.state || 'MH'}
              </span>
              <span className="text-[10px] text-stone-500 mt-1 block">
                PIN: {business?.pinCode || '401506'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Foreign Trade Policy & Compliance Catalog */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center space-x-2">
              <Scale className="w-4 h-4 text-teal-700" />
              <span>DGFT Foreign Trade Policy & Country Mandate Rules</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Active regulatory rules evaluated by ExportPilot AI rules engine across your consignments
            </p>
          </div>

          <button
            onClick={() => setIsAddingRule(!isAddingRule)}
            className="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Compliance Rule</span>
          </button>
        </div>

        {isAddingRule && (
          <form onSubmit={handleAddRule} className="p-4 my-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Rule / Mandate Title</label>
                <input
                  type="text"
                  value={newRuleTitle}
                  onChange={e => setNewRuleTitle(e.target.value)}
                  placeholder="e.g. EU REACH Chromium VI Certification"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Product Category</label>
                <input
                  type="text"
                  value={newRuleCategory}
                  onChange={e => setNewRuleCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Destination Country</label>
                <input
                  type="text"
                  value={newRuleDest}
                  onChange={e => setNewRuleDest(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddingRule(false)}
                className="px-3 py-1.5 rounded-lg text-stone-600 hover:bg-stone-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-teal-800 text-white font-semibold"
              >
                Save Rule
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-stone-100 mt-4 text-xs">
          {rules.map(r => (
            <div key={r.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1 max-w-3xl">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-stone-900 text-sm">{r.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700">
                    {r.destinationCountry}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    r.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {r.priority} Priority
                  </span>
                </div>
                <p className="text-stone-600 text-xs leading-relaxed">{r.description}</p>
                <div className="flex items-center space-x-3 text-[11px] text-stone-400">
                  <span>Category: <strong className="text-stone-600">{r.productCategory}</strong></span>
                  <span>•</span>
                  <span>Source: {r.source}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleDeleteRule(r.id)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="Remove Rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
