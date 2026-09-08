import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../services/apiClient';
import { CostBreakdown, ShippingMode } from '../types';
import { 
  Calculator, 
  DollarSign, 
  Ship, 
  Plane, 
  Truck, 
  Package, 
  ShieldCheck, 
  FileText, 
  Building2, 
  Anchor,
  TrendingDown,
  Info,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const CostEstimatorView: React.FC = () => {
  const { activeProjectDetail, activeProjectId, showToast } = useApp();
  const project = activeProjectDetail?.project;

  const [quantity, setQuantity] = useState<number>(project?.quantity || 500);
  const [productValue, setProductValue] = useState<number>(project?.estimatedValue || 42500);
  const [shippingMode, setShippingMode] = useState<ShippingMode>(project?.shippingMode || 'Sea');
  const [destinationCountry, setDestinationCountry] = useState<string>(project?.destinationCountry || 'Germany');
  const [packagingGrade, setPackagingGrade] = useState<'Standard' | 'Heavy Duty / Palletized' | 'Eco-Certified'>('Standard');
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(activeProjectDetail?.costEstimate || null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEstimate = async () => {
    if (!activeProjectId) return;
    setIsLoading(true);
    try {
      const res = await apiClient.getCostEstimate(activeProjectId, {
        quantity,
        productValue,
        shippingMode,
        destinationCountry,
        packagingGrade,
        currency: project?.currency || 'USD'
      });
      setCostBreakdown(res);
    } catch (err) {
      console.error('Error fetching cost estimate:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimate();
  }, [quantity, productValue, shippingMode, destinationCountry, packagingGrade]);

  const perUnitCost = costBreakdown && quantity > 0 
    ? (costBreakdown.totalEstimatedCost / quantity).toFixed(2)
    : '0';

  const baseUnitValue = quantity > 0 ? (productValue / quantity).toFixed(2) : '0';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-900 font-mono">
              SIMULATOR
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              Export Cost Estimator & What-If Simulator
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Deterministic planning model for FOB/CIF cross-border consignment budgeting
          </p>
        </div>

        <button
          onClick={fetchEstimate}
          className="px-3 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-2xs transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-stone-500 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Recalculate Estimate</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Interactive Controls */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-stone-100">
            <Calculator className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-stone-900">Consignment Parameters</h3>
          </div>

          {/* Quantity Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
              <label>Export Quantity ({project?.unit || 'Pcs'})</label>
              <span className="font-bold text-teal-900">{quantity.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="50"
              max="5000"
              step="50"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full accent-teal-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
              <span>50</span>
              <span>2,500</span>
              <span>5,000</span>
            </div>
          </div>

          {/* Product Base Value */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Total Factory Goods Value ({project?.currency || 'USD'})
            </label>
            <input
              type="number"
              value={productValue}
              onChange={(e) => setProductValue(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600"
            />
            <div className="text-[10px] text-stone-400 mt-1">
              Base unit production value: ${baseUnitValue} / {project?.unit || 'unit'}
            </div>
          </div>

          {/* Shipping Mode */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Freight Transit Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setShippingMode('Sea')}
                className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition ${
                  shippingMode === 'Sea' ? 'bg-teal-50 border-teal-600 text-teal-900' : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                }`}
              >
                <Ship className="w-4 h-4" />
                <span>Sea (FCL/LCL)</span>
              </button>
              <button
                type="button"
                onClick={() => setShippingMode('Air')}
                className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition ${
                  shippingMode === 'Air' ? 'bg-teal-50 border-teal-600 text-teal-900' : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                }`}
              >
                <Plane className="w-4 h-4" />
                <span>Air Cargo</span>
              </button>
              <button
                type="button"
                onClick={() => setShippingMode('Courier')}
                className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition ${
                  shippingMode === 'Courier' ? 'bg-teal-50 border-teal-600 text-teal-900' : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Courier</span>
              </button>
            </div>
          </div>

          {/* Destination Country */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Destination Country
            </label>
            <select
              value={destinationCountry}
              onChange={(e) => setDestinationCountry(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 bg-stone-50 text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
            >
              <option value="Germany">Germany (Hamburg / Bremen)</option>
              <option value="United Kingdom">United Kingdom (London Gateway)</option>
              <option value="United States">United States (New York / LA)</option>
              <option value="United Arab Emirates">United Arab Emirates (Jebel Ali)</option>
              <option value="Italy">Italy (Genoa / Milan)</option>
              <option value="Japan">Japan (Yokohama / Tokyo)</option>
            </select>
          </div>

          {/* Packaging Grade */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Packaging Standard
            </label>
            <select
              value={packagingGrade}
              onChange={(e) => setPackagingGrade(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 bg-stone-50 text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
            >
              <option value="Standard">Standard 5-Ply Corrugated</option>
              <option value="Heavy Duty / Palletized">ISPM-15 Heat-Treated Palletized</option>
              <option value="Eco-Certified">EU Recyclable Eco-Certified</option>
            </select>
          </div>
        </div>

        {/* Right 2 Cols: Cost Breakdown & Output Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Banner KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-stone-900 text-white rounded-2xl p-5 border border-stone-800 shadow-sm flex flex-col justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Total Landed Export Cost</span>
              <div className="text-3xl font-black text-teal-300 my-2">
                ${costBreakdown?.totalEstimatedCost.toLocaleString()} {costBreakdown?.currency || 'USD'}
              </div>
              <p className="text-[11px] text-stone-400">
                Includes factory value, international freight, all-risks insurance & CHA customs clearance
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs flex flex-col justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Landed Cost Per Unit</span>
              <div className="text-3xl font-black text-stone-900 my-2">
                ${perUnitCost} <span className="text-xs font-normal text-stone-400">/ {project?.unit || 'unit'}</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-medium flex items-center space-x-1">
                <span>+${(Number(perUnitCost) - Number(baseUnitValue)).toFixed(2)} cross-border overhead</span>
              </div>
            </div>
          </div>

          {/* Itemized Breakdown Table */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs">
            <h3 className="text-sm font-bold text-stone-900 mb-4 pb-2 border-b border-stone-100">
              Itemized Export Budget Allocation
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                <span className="font-semibold text-stone-800 flex items-center space-x-2">
                  <Package className="w-3.5 h-3.5 text-stone-400" />
                  <span>Goods Factory Value (FOB Base)</span>
                </span>
                <span className="font-bold text-stone-900 font-mono">${costBreakdown?.productValue.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                <span className="font-semibold text-stone-800 flex items-center space-x-2">
                  <Package className="w-3.5 h-3.5 text-stone-400" />
                  <span>Export Grade Packaging & Desiccants ({packagingGrade})</span>
                </span>
                <span className="font-bold text-stone-900 font-mono">${costBreakdown?.packagingCost.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                <span className="font-semibold text-stone-800 flex items-center space-x-2">
                  {shippingMode === 'Sea' ? <Ship className="w-3.5 h-3.5 text-teal-600" /> : <Plane className="w-3.5 h-3.5 text-teal-600" />}
                  <span>{shippingMode} Freight to {destinationCountry}</span>
                </span>
                <span className="font-bold text-teal-900 font-mono">${costBreakdown?.freightCost.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                <span className="font-semibold text-stone-800 flex items-center space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                  <span>Institute Cargo Clauses (A) Marine Insurance (0.35% CIF + GST)</span>
                </span>
                <span className="font-bold text-stone-900 font-mono">${costBreakdown?.insuranceCost.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                <span className="font-semibold text-stone-800 flex items-center space-x-2">
                  <FileText className="w-3.5 h-3.5 text-stone-400" />
                  <span>DGFT & Chamber of Commerce Documentation / COO</span>
                </span>
                <span className="font-bold text-stone-900 font-mono">${costBreakdown?.documentationCost.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                <span className="font-semibold text-stone-800 flex items-center space-x-2">
                  <Building2 className="w-3.5 h-3.5 text-stone-400" />
                  <span>Customs House Agent (CHA) Filing & Examination Charges</span>
                </span>
                <span className="font-bold text-stone-900 font-mono">${costBreakdown?.customsCharges.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                <span className="font-semibold text-stone-800 flex items-center space-x-2">
                  <Anchor className="w-3.5 h-3.5 text-stone-400" />
                  <span>JNPT Port Terminal & CFS Handling Fees</span>
                </span>
                <span className="font-bold text-stone-900 font-mono">${costBreakdown?.portHandlingCharges.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-stone-900 flex justify-between items-center text-sm">
              <span className="font-extrabold text-stone-900">Total Consignment Landed Estimate</span>
              <span className="font-black text-teal-900 text-lg font-mono">
                ${costBreakdown?.totalEstimatedCost.toLocaleString()} {costBreakdown?.currency}
              </span>
            </div>
          </div>

          {/* Disclaimer Note */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-500 leading-relaxed flex items-start space-x-2">
            <Info className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
            <span>
              <strong className="text-stone-700">Planning Estimate: </strong>
              Figures reflect standard tariff schedules for JNPT Nhava Sheva to European and American hub ports. Final maritime freight rates and currency exchange rates may vary at the time of carrier booking confirmation.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
