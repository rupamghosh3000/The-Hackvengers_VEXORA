import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../services/apiClient';
import { ShippingMode } from '../types';
import { 
  X, 
  Ship, 
  Package, 
  Globe2, 
  DollarSign, 
  Calendar, 
  Building2, 
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const NewProjectModal: React.FC = () => {
  const { 
    isNewProjectModalOpen, 
    setIsNewProjectModalOpen, 
    refreshProjectData, 
    setActiveProjectId, 
    showToast 
  } = useApp();

  const [consignmentNumber, setConsignmentNumber] = useState(`EXP-2025-0${Math.floor(100 + Math.random() * 900)}`);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [autoLinkMasterDocs, setAutoLinkMasterDocs] = useState(true);
  const [name, setName] = useState('');
  const [productName, setProductName] = useState('');
  const [hsCode, setHsCode] = useState('4202.21');
  const [destinationCountry, setDestinationCountry] = useState('Germany');
  const [destinationPort, setDestinationPort] = useState('Port of Hamburg');
  const [shippingMode, setShippingMode] = useState<ShippingMode>('Sea');
  const [quantity, setQuantity] = useState(500);
  const [unit, setUnit] = useState('Pcs');
  const [estimatedValue, setEstimatedValue] = useState(35000);
  const [buyerCompany, setBuyerCompany] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [targetShipmentDate, setTargetShipmentDate] = useState('2025-01-20');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isNewProjectModalOpen) return null;

  const handleCountryChange = (c: string) => {
    setDestinationCountry(c);
    if (c === 'Germany') setDestinationPort('Port of Hamburg');
    else if (c === 'United Kingdom') setDestinationPort('London Gateway');
    else if (c === 'United States') setDestinationPort('Port of New York / New Jersey');
    else if (c === 'United Arab Emirates') setDestinationPort('Jebel Ali Port');
    else if (c === 'Italy') setDestinationPort('Port of Genoa');
    else if (c === 'Japan') setDestinationPort('Port of Yokohama');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newProj = await apiClient.createProject({
        id: consignmentNumber.trim() || undefined,
        name: name || `${productName || 'Export Batch'} to ${destinationCountry}`,
        productName: productName || 'Finished Leather Goods',
        hsCode,
        destinationCountry,
        destinationPort,
        shippingMode,
        quantity,
        unit,
        estimatedValue,
        currency: 'USD',
        buyerCompany: buyerCompany || 'Overseas Buyer Corp',
        buyerName: buyerName || 'Procurement Desk',
        targetShipmentDate,
        status: 'In Preparation',
        ...({
          consignmentNumber: consignmentNumber.trim(),
          invoiceNumber: invoiceNumber.trim() || undefined,
          autoLinkMasterDocs
        } as any)
      });

      await refreshProjectData();
      setActiveProjectId(newProj.id);
      setIsNewProjectModalOpen(false);
      showToast(`Consignment "${newProj.id}" created & linked with master DGFT documents!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to initialize project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold">
              <Ship className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Initiate New Export Consignment</h3>
              <p className="text-xs text-stone-500">Auto-generates statutory DGFT roadmap and compliance checklist</p>
            </div>
          </div>
          <button
            onClick={() => setIsNewProjectModalOpen(false)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Consignment Identification & Document Intelligence */}
          <div className="bg-teal-50/80 rounded-xl p-3.5 border border-teal-200/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                <span className="font-bold text-teal-950 text-xs">Consignment ID & Document Linking</span>
              </div>
              <span className="text-[10px] bg-teal-200 text-teal-900 font-semibold px-2 py-0.5 rounded">DGFT Central Vault</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Consignment No. (Project ID)
                </label>
                <div className="flex space-x-1">
                  <input
                    type="text"
                    required
                    value={consignmentNumber}
                    onChange={(e) => setConsignmentNumber(e.target.value)}
                    placeholder="e.g. EXP-2025-0145"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white font-mono text-xs focus:ring-2 focus:ring-teal-600"
                  />
                  <button
                    type="button"
                    onClick={() => setConsignmentNumber(`EXP-2025-0${Math.floor(100 + Math.random() * 900)}`)}
                    className="px-2 py-1 bg-white border border-stone-300 hover:bg-stone-50 rounded-lg text-[10px] font-semibold text-stone-600 shrink-0"
                    title="Generate New Reference"
                  >
                    Auto
                  </button>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Invoice / Shipping Bill No. (Optional)
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g. PLW-2425/092"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white font-mono text-xs focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>

            <label className="flex items-start space-x-2 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoLinkMasterDocs}
                onChange={(e) => setAutoLinkMasterDocs(e.target.checked)}
                className="mt-0.5 rounded text-teal-700 focus:ring-teal-600 w-3.5 h-3.5"
              />
              <div className="text-[11px] text-stone-700 leading-snug">
                <span className="font-semibold text-teal-950">Auto-link Enterprise Master Documents:</span> Automatically attach company's verified <strong>IEC</strong> (0308019482), <strong>GSTIN</strong>, <strong>MSME Udyam</strong>, and <strong>RCMC</strong> from your central profile.
              </div>
            </label>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Consignment Title / Description</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Spring 2025 Leather Tote Bags to Germany"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Product Name</label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Genuine Leather Handbags"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">HS Code (ITC-HS)</label>
              <input
                type="text"
                required
                value={hsCode}
                onChange={(e) => setHsCode(e.target.value)}
                placeholder="e.g. 4202.21"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Destination Country</label>
              <select
                value={destinationCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              >
                <option value="Germany">Germany</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Italy">Italy</option>
                <option value="Japan">Japan</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Discharge Port</label>
              <input
                type="text"
                required
                value={destinationPort}
                onChange={(e) => setDestinationPort(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Transit Mode</label>
              <select
                value={shippingMode}
                onChange={(e) => setShippingMode(e.target.value as ShippingMode)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              >
                <option value="Sea">Sea (FCL/LCL)</option>
                <option value="Air">Air Cargo</option>
                <option value="Courier">Express Courier</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Estimated FOB Value ($ USD)</label>
              <input
                type="number"
                min="1"
                required
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Target Shipment Date</label>
              <input
                type="date"
                required
                value={targetShipmentDate}
                onChange={(e) => setTargetShipmentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Overseas Buyer / Importer</label>
              <input
                type="text"
                value={buyerCompany}
                onChange={(e) => setBuyerCompany(e.target.value)}
                placeholder="e.g. Hanseatic Retail GmbH"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Buyer Representative</label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="e.g. Klaus Weber"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsNewProjectModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-semibold transition shadow-xs flex items-center space-x-1.5"
            >
              <span>{isSubmitting ? 'Creating...' : 'Initialize Export Consignment'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
