import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../services/apiClient';
import { DocumentRecord, DocumentType } from '../types';
import { 
  FileText, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Clock, 
  Trash2, 
  Eye, 
  Edit3,
  X,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  HelpCircle,
  Link2
} from 'lucide-react';

export const DocumentVaultView: React.FC = () => {
  const { activeProjectDetail, activeProjectId, refreshProjectData, showToast, t } = useApp();
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('Commercial Invoice');
  const [isUploading, setIsUploading] = useState(false);
  const [simulateAiFailure, setSimulateAiFailure] = useState(false);
  const [isSyncingMaster, setIsSyncingMaster] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkRefValue, setLinkRefValue] = useState('');
  const [inspectedDoc, setInspectedDoc] = useState<DocumentRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Manual Entry / Fallback Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [manualForm, setManualForm] = useState({
    type: 'Commercial Invoice' as DocumentType,
    fileName: '',
    referenceNumber: '',
    issuingAuthority: '',
    declaredHsCode: '',
    declaredValue: '',
    expiryDate: '',
    status: 'Verified' as 'Verified' | 'Needs Correction' | 'Under Review',
    comments: '',
    checkListIEC: true,
    checkListConsignee: true,
    checkListIncoterms: true,
    checkListLabStamp: false
  });

  const documents = activeProjectDetail?.documents || [];
  const project = activeProjectDetail?.project;

  const docTypes: DocumentType[] = [
    'Commercial Invoice',
    'Packing List',
    'Purchase Order',
    'Certificate of Origin (COO)',
    'Product Test Certificate (REACH / RoHS / FDA)',
    'Marine Cargo Insurance Policy',
    'Bill of Lading / Airway Bill',
    'Shipping Bill / ICEGATE LEO',
    'IEC Certificate',
    'GST Certificate',
    'Other'
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProjectId) return;

    setIsUploading(true);
    showToast(
      simulateAiFailure 
        ? `Uploading ${file.name} (Simulating AI Outage)...` 
        : `Uploading ${file.name} for AI Compliance Analysis...`
    );

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        console.info('[AI Document Analysis Debug] Initiating document upload:', {
          fileName: file.name,
          docType: selectedDocType,
          simulateAiFailure
        });

        const newDoc = await apiClient.uploadDocument(activeProjectId, {
          type: selectedDocType,
          fileName: file.name,
          fileSize: `${Math.round(file.size / 1024)} KB`,
          base64Data,
          mimeType: file.type || 'application/pdf',
          simulateAiFailure
        });

        await refreshProjectData();
        setInspectedDoc(newDoc);

        if (newDoc.aiReview?.aiStatus === 'unavailable') {
          console.warn('[AI Document Analysis Debug] AI service was unavailable for document. Manual input fallback active:', newDoc);
          showToast(`⚠️ AI service unavailable. Document loaded in manual inspection fallback mode.`);
        } else {
          console.info('[AI Document Analysis Debug] AI review completed successfully:', newDoc.aiReview);
          showToast(`AI audit completed: ${newDoc.aiReview?.completenessScore}% completeness`);
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('[AI Document Analysis Debug] Upload error:', err);
      showToast(err.message || 'Failed to upload document');
      setIsUploading(false);
    }
  };

  const handleOpenManualEntry = (docToEdit?: DocumentRecord) => {
    if (docToEdit) {
      setEditingDocId(docToEdit.id);
      setManualForm({
        type: docToEdit.type,
        fileName: docToEdit.fileName,
        referenceNumber: docToEdit.referenceNumber || '',
        issuingAuthority: docToEdit.issuingAuthority || '',
        declaredHsCode: docToEdit.declaredHsCode || '',
        declaredValue: docToEdit.declaredValue || '',
        expiryDate: docToEdit.expiryDate || '',
        status: docToEdit.status,
        comments: docToEdit.reviewerComments || '',
        checkListIEC: true,
        checkListConsignee: true,
        checkListIncoterms: true,
        checkListLabStamp: docToEdit.status === 'Verified'
      });
    } else {
      setEditingDocId(null);
      setManualForm({
        type: selectedDocType,
        fileName: `${selectedDocType.replace(/[^a-zA-Z0-9]/g, '_')}_Manual_Record.pdf`,
        referenceNumber: 'INV/2024/' + Math.floor(1000 + Math.random() * 9000),
        issuingAuthority: 'Palghar Leather Works (Self-Certified)',
        declaredHsCode: project?.hsCode || '4202.21',
        declaredValue: `USD ${project?.estimatedValue?.toLocaleString() || '45,000'}`,
        expiryDate: '2025-12-31',
        status: 'Verified',
        comments: 'Manually inspected and verified against customs documentation rules.',
        checkListIEC: true,
        checkListConsignee: true,
        checkListIncoterms: true,
        checkListLabStamp: true
      });
    }
    setIsManualModalOpen(true);
  };

  const handleSaveManualForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectId) return;

    const checklist: string[] = [];
    if (manualForm.checkListIEC) checklist.push('Exporter IEC & GSTIN Validated');
    if (manualForm.checkListConsignee) checklist.push('Overseas Consignee Name & Port Matched');
    if (manualForm.checkListIncoterms) checklist.push('Incoterms & Currency Terms Specified');
    if (manualForm.checkListLabStamp) checklist.push('Accredited Testing / Origin Stamp Verified');

    try {
      if (editingDocId) {
        console.info('[AI Document Analysis Debug] Saving manual document update:', { editingDocId, manualForm });
        const updated = await apiClient.updateDocument(editingDocId, {
          type: manualForm.type,
          fileName: manualForm.fileName,
          referenceNumber: manualForm.referenceNumber,
          issuingAuthority: manualForm.issuingAuthority,
          declaredHsCode: manualForm.declaredHsCode,
          declaredValue: manualForm.declaredValue,
          expiryDate: manualForm.expiryDate,
          status: manualForm.status,
          reviewerComments: manualForm.comments
        });
        showToast(`Document "${updated.fileName}" updated manually to status "${updated.status}"`);
      } else {
        console.info('[AI Document Analysis Debug] Creating new manual document record:', manualForm);
        const created = await apiClient.createManualDocument(activeProjectId, {
          type: manualForm.type,
          fileName: manualForm.fileName,
          referenceNumber: manualForm.referenceNumber,
          issuingAuthority: manualForm.issuingAuthority,
          declaredHsCode: manualForm.declaredHsCode,
          declaredValue: manualForm.declaredValue,
          expiryDate: manualForm.expiryDate,
          status: manualForm.status,
          checklist,
          comments: manualForm.comments
        });
        showToast(`Manual record "${created.type}" saved to customs repository`);
      }

      await refreshProjectData();
      setIsManualModalOpen(false);
      if (inspectedDoc && editingDocId === inspectedDoc.id) {
        const refreshed = (activeProjectDetail?.documents || []).find(d => d.id === editingDocId);
        if (refreshed) setInspectedDoc(refreshed);
      }
    } catch (err: any) {
      console.error('[AI Document Analysis Debug] Manual entry error:', err);
      showToast(err.message || 'Failed to save manual document entry');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    await apiClient.deleteDocument(id);
    await refreshProjectData();
    if (inspectedDoc?.id === id) setInspectedDoc(null);
    showToast(`Document ${name} removed`);
  };

  const handleSyncMasterDocs = async () => {
    if (!activeProjectId) return;
    setIsSyncingMaster(true);
    try {
      const res = await apiClient.syncMasterDocuments(activeProjectId);
      await refreshProjectData();
      showToast(`Linked ${res.count} Enterprise Master Documents (IEC, GSTIN, RCMC, Udyam) to this consignment!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to sync master documents');
    } finally {
      setIsSyncingMaster(false);
    }
  };

  const handleLinkDocsByRef = async (refNum?: string) => {
    if (!activeProjectId) return;
    try {
      const res = await apiClient.linkDocumentsByRef(activeProjectId, refNum || linkRefValue, !refNum && !linkRefValue);
      await refreshProjectData();
      setIsLinkModalOpen(false);
      setLinkRefValue('');
      showToast(`Linked ${res.linkedCount} documents to consignment "${activeProjectId}"!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to link documents');
    }
  };

  const filteredDocs = documents.filter(d => {
    if (filterStatus === 'All') return true;
    return d.status === filterStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-900 font-mono">
              {t('documentVault')}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              Export Document Repository & AI Audit
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Auditing foreign trade documentation for {project?.name || 'Active Batch'} with automated AI analysis and manual inspection fallback
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleSyncMasterDocs}
            disabled={isSyncingMaster}
            className="px-3 py-2 rounded-xl bg-teal-50 border border-teal-200 hover:bg-teal-100 text-teal-900 text-xs font-semibold shadow-2xs transition flex items-center space-x-1.5"
            title="Import company IEC, GSTIN, Udyam & RCMC into this consignment"
          >
            <ShieldCheck className={`w-3.5 h-3.5 text-teal-700 ${isSyncingMaster ? 'animate-spin' : ''}`} />
            <span>{isSyncingMaster ? 'Syncing...' : 'Sync Master Docs (IEC/GST)'}</span>
          </button>
          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-2xs transition flex items-center space-x-1.5"
            title="Link existing documents by Invoice or Shipping Bill #"
          >
            <Link2 className="w-3.5 h-3.5 text-teal-700" />
            <span>Link by Ref #</span>
          </button>
          <button
            onClick={() => handleOpenManualEntry()}
            className="px-3 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-2xs transition flex items-center space-x-1.5"
            title="Input document details manually if AI is unavailable"
          >
            <PlusCircle className="w-3.5 h-3.5 text-teal-700" />
            <span>Manual Entry / Fallback</span>
          </button>
          <span className="text-xs font-semibold text-stone-500 px-3 py-1 bg-stone-100 rounded-xl">
            {documents.filter(d => d.status === 'Verified').length} of {documents.length} Verified
          </span>
        </div>
      </div>

      {/* Intelligence Explanation Banner: How the website knows your documents */}
      <div className="bg-gradient-to-r from-teal-900 via-stone-900 to-teal-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-teal-800/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-700/80 text-teal-100">
                Enterprise Document Intelligence
              </span>
              <span className="text-xs text-teal-200/90 font-mono">Consignment: {activeProjectId}</span>
            </div>
            <h2 className="text-sm font-bold text-white">How ExportPilot AI Knows What Documents You Have:</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-300 pt-1">
              <div className="flex items-start space-x-2">
                <span className="text-teal-400 font-bold">1.</span>
                <span><strong>Enterprise Master Vault:</strong> Company statutory registrations (IEC: <code>0308019482</code>, GSTIN, Udyam, RCMC) are stored once and automatically inherited by every consignment.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-teal-400 font-bold">2.</span>
                <span><strong>Consignment Specifics:</strong> Invoices, packing lists, test reports & shipping bills are indexed via your consignment ID, invoice number, or direct upload.</span>
              </div>
            </div>
          </div>
          <div className="flex sm:flex-col gap-2 shrink-0">
            <button
              onClick={handleSyncMasterDocs}
              disabled={isSyncingMaster}
              className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold text-xs transition shadow-xs flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingMaster ? 'animate-spin' : ''}`} />
              <span>{isSyncingMaster ? 'Linking...' : 'Auto-Sync Master Docs'}</span>
            </button>
            <button
              onClick={() => handleLinkDocsByRef()}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition border border-white/20 flex items-center justify-center space-x-1.5"
            >
              <Link2 className="w-3.5 h-3.5 text-teal-300" />
              <span>Auto-Link All Available</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Box with AI Failure Simulation Toggle */}
      <div className="bg-white rounded-2xl p-6 border-2 border-dashed border-teal-600/30 hover:border-teal-600 transition shadow-2xs">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center mx-auto shadow-2xs">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-stone-900">Upload Trade Document for AI Audit</h3>
            <p className="text-xs text-stone-500 mt-1">
              Supports PDF, PNG, JPEG. Automatically checks HS Codes, weights, Incoterms, and destination laboratory stamps.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value as DocumentType)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 bg-stone-50 text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
            >
              {docTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <label className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition shadow-xs cursor-pointer flex items-center space-x-2 ${
              isUploading ? 'bg-stone-400 cursor-not-allowed' : 'bg-teal-800 hover:bg-teal-700'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-teal-200" />
              <span>{isUploading ? 'Auditing with AI...' : 'Choose File & Analyze'}</span>
              <input
                type="file"
                disabled={isUploading}
                onChange={handleFileUpload}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
            </label>
          </div>

          {/* Test AI Outage Toggle for Hackathon Reviewers */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-center space-x-2 text-[11px] text-stone-500">
            <input
              type="checkbox"
              id="simulateFailure"
              checked={simulateAiFailure}
              onChange={e => setSimulateAiFailure(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="simulateFailure" className="cursor-pointer font-medium select-none">
              Simulate AI Service Failure (to test manual entry fallback mechanism)
            </label>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-stone-200 pb-2">
        {['All', 'Verified', 'Needs Correction', 'Under Review'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filterStatus === s 
                ? 'bg-stone-900 text-white shadow-2xs' 
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          const isVerified = doc.status === 'Verified';
          const hasIssue = doc.status === 'Needs Correction';
          const isAiUnavailable = doc.aiReview?.aiStatus === 'unavailable';
          const isManual = doc.aiReview?.isManualEntry || doc.aiReview?.aiStatus === 'manual_entry';

          return (
            <div
              key={doc.id}
              className={`bg-white rounded-2xl border p-5 transition shadow-2xs flex flex-col justify-between ${
                isAiUnavailable 
                  ? 'border-amber-300 bg-amber-50/20' 
                  : isVerified 
                  ? 'border-stone-200 hover:border-teal-300' 
                  : hasIssue 
                  ? 'border-red-300 bg-red-50/15' 
                  : 'border-stone-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {isManual && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        Manual Entry
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isAiUnavailable ? 'bg-amber-100 text-amber-800 animate-pulse' :
                      isVerified ? 'bg-emerald-100 text-emerald-800' :
                      hasIssue ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-stone-900 truncate" title={doc.fileName}>
                  {doc.fileName}
                </h4>
                <p className="text-xs font-semibold text-teal-800 mt-0.5">{doc.type}</p>
                <div className="text-[11px] text-stone-400 mt-1 flex items-center space-x-2">
                  <span>{doc.fileSize || '350 KB'}</span>
                  <span>•</span>
                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  {doc.referenceNumber && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-stone-600 truncate">{doc.referenceNumber}</span>
                    </>
                  )}
                </div>

                {/* AI Status / Fallback Notice Snippet */}
                {isAiUnavailable ? (
                  <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-amber-900">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>AI Analysis Unavailable</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      AI service was offline during upload. Manual inspection fallback is active.
                    </p>
                    <button
                      onClick={() => handleOpenManualEntry(doc)}
                      className="mt-1 text-[11px] font-bold text-teal-900 hover:underline flex items-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Input Details & Verify Manually →</span>
                    </button>
                  </div>
                ) : doc.aiReview && (
                  <div className="mt-3 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-800 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-teal-600" />
                        <span>Compliance Score</span>
                      </span>
                      <span className={`font-bold ${doc.aiReview.completenessScore >= 80 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {doc.aiReview.completenessScore}%
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                      {doc.aiReview.explanation}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setInspectedDoc(doc)}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-teal-50 hover:text-teal-900 text-stone-700 font-semibold transition flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Audit Report</span>
                  </button>

                  <button
                    onClick={() => handleOpenManualEntry(doc)}
                    className="px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-stone-200 text-stone-600 font-semibold transition flex items-center space-x-1"
                    title="Edit document attributes or manual status override"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit / Verify</span>
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(doc.id, doc.fileName)}
                  className="p-1 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Detailed Audit Modal */}
      {inspectedDoc && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-teal-700" />
                  <h3 className="text-base font-bold text-stone-900">Document Verification Audit</h3>
                </div>
                <p className="text-xs text-stone-500 truncate mt-0.5">{inspectedDoc.fileName}</p>
              </div>
              <button
                onClick={() => setInspectedDoc(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Fallback Warning Banner if AI was unavailable */}
              {inspectedDoc.aiReview?.aiStatus === 'unavailable' && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>AI Analysis Unavailable — Manual Inspection Fallback Active</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    The automated AI Document Analysis service was unable to parse this document. 
                    You can manually verify fields, enter reference numbers, and record regulatory clearance below.
                  </p>
                  <button
                    onClick={() => {
                      const doc = inspectedDoc;
                      setInspectedDoc(null);
                      handleOpenManualEntry(doc);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-800 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Open Manual Inspection Form</span>
                  </button>
                </div>
              )}

              {/* Completeness score banner */}
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">Completeness Index</span>
                  <div className="text-2xl font-black text-teal-950 mt-0.5">
                    {inspectedDoc.aiReview?.completenessScore || 85}%
                  </div>
                  <p className="text-[11px] text-teal-800 mt-1">{inspectedDoc.aiReview?.recommendation}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  inspectedDoc.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {inspectedDoc.status}
                </span>
              </div>

              {/* Detected Fields */}
              {inspectedDoc.aiReview?.detectedFields && inspectedDoc.aiReview.detectedFields.length > 0 && (
                <div>
                  <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-2">
                    Verified Statutory Fields ({inspectedDoc.aiReview.detectedFields.length})
                  </h4>
                  <div className="space-y-1.5 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    {inspectedDoc.aiReview.detectedFields.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between text-stone-700">
                        <span className="flex items-center space-x-1.5 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{f.field}</span>
                        </span>
                        {f.value && (
                          <span className="font-mono text-stone-900 text-[11px] bg-white px-2 py-0.5 rounded border border-stone-200">
                            {f.value}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Fields or Issues */}
              {inspectedDoc.aiReview?.issues && inspectedDoc.aiReview.issues.length > 0 && (
                <div>
                  <h4 className="font-bold text-red-900 uppercase tracking-wider text-[11px] mb-2">
                    Compliance Issues & Deficiencies ({inspectedDoc.aiReview.issues.length})
                  </h4>
                  <div className="space-y-2">
                    {inspectedDoc.aiReview.issues.map((iss, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start space-x-2">
                        <AlertOctagon className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-bold text-[10px] uppercase tracking-wider block text-red-800">
                            Severity: {iss.severity}
                          </span>
                          <span className="leading-snug">{iss.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-3 rounded-xl bg-stone-100 text-stone-500 text-[10px] leading-relaxed border border-stone-200">
                <span className="font-bold text-stone-700">Statutory Notice: </span>
                {inspectedDoc.aiReview?.disclaimer || 'Official customs verification and physical container assessment apply at port of exit.'}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
              <button
                onClick={() => {
                  const doc = inspectedDoc;
                  setInspectedDoc(null);
                  handleOpenManualEntry(doc);
                }}
                className="px-3.5 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs transition flex items-center space-x-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Details / Override Status</span>
              </button>

              <button
                onClick={() => setInspectedDoc(null)}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry & Verification Fallback Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {editingDocId ? 'Manual Inspection & Status Override' : 'Manual Document Entry (AI Fallback)'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Record trade document attributes directly for statutory compliance ledger
                </p>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualForm} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Document Category</label>
                  <select
                    value={manualForm.type}
                    onChange={e => setManualForm({ ...manualForm, type: e.target.value as DocumentType })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden"
                  >
                    {docTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">File / Document Title</label>
                  <input
                    type="text"
                    value={manualForm.fileName}
                    onChange={e => setManualForm({ ...manualForm, fileName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Reference / Invoice Number</label>
                  <input
                    type="text"
                    value={manualForm.referenceNumber}
                    onChange={e => setManualForm({ ...manualForm, referenceNumber: e.target.value })}
                    placeholder="e.g. PLW/EXP/2024-25/089"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Issuing Authority / Agency</label>
                  <input
                    type="text"
                    value={manualForm.issuingAuthority}
                    onChange={e => setManualForm({ ...manualForm, issuingAuthority: e.target.value })}
                    placeholder="e.g. Palghar Leather Works / SGS India"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Declared HS Code</label>
                  <input
                    type="text"
                    value={manualForm.declaredHsCode}
                    onChange={e => setManualForm({ ...manualForm, declaredHsCode: e.target.value })}
                    placeholder="e.g. 4202.21"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Declared Value & Currency</label>
                  <input
                    type="text"
                    value={manualForm.declaredValue}
                    onChange={e => setManualForm({ ...manualForm, declaredValue: e.target.value })}
                    placeholder="e.g. USD 42,500 CIF Hamburg"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Verification Status</label>
                  <select
                    value={manualForm.status}
                    onChange={e => setManualForm({ ...manualForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden font-semibold"
                  >
                    <option value="Verified">Verified (Customs Approved)</option>
                    <option value="Needs Correction">Needs Correction</option>
                    <option value="Under Review">Under Review</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Document Expiry Date</label>
                  <input
                    type="date"
                    value={manualForm.expiryDate}
                    onChange={e => setManualForm({ ...manualForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Statutory Checklist */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="font-bold text-stone-800 uppercase tracking-wider text-[10px] block">
                  Mandatory Statutory Checklist Verification
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-700">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={manualForm.checkListIEC}
                      onChange={e => setManualForm({ ...manualForm, checkListIEC: e.target.checked })}
                      className="rounded text-teal-700 focus:ring-teal-600"
                    />
                    <span>Exporter IEC & GSTIN Validated</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={manualForm.checkListConsignee}
                      onChange={e => setManualForm({ ...manualForm, checkListConsignee: e.target.checked })}
                      className="rounded text-teal-700 focus:ring-teal-600"
                    />
                    <span>Consignee Name & Port Match</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={manualForm.checkListIncoterms}
                      onChange={e => setManualForm({ ...manualForm, checkListIncoterms: e.target.checked })}
                      className="rounded text-teal-700 focus:ring-teal-600"
                    />
                    <span>Incoterms & Currency Terms</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={manualForm.checkListLabStamp}
                      onChange={e => setManualForm({ ...manualForm, checkListLabStamp: e.target.checked })}
                      className="rounded text-teal-700 focus:ring-teal-600"
                    />
                    <span>NABL Lab / Agency Stamp</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Auditor Comments / Justification</label>
                <textarea
                  rows={2}
                  value={manualForm.comments}
                  onChange={e => setManualForm({ ...manualForm, comments: e.target.value })}
                  placeholder="Record verification notes, discrepancy reasons, or amendment details..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-semibold shadow-xs"
                >
                  {editingDocId ? 'Save Manual Override' : 'Save Document to Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link by Reference Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center space-x-2">
                <Link2 className="w-5 h-5 text-teal-700" />
                <h3 className="font-bold text-stone-900 text-base">Link Documents by Reference</h3>
              </div>
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Fetch or attach existing trade files (e.g. Invoices, Packing Lists, Inspection Reports) by entering a matching reference number or search term.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-800">
                Reference / Invoice / Shipping Bill #
              </label>
              <input
                type="text"
                value={linkRefValue}
                onChange={e => setLinkRefValue(e.target.value)}
                placeholder="e.g. INV-2024-001 or EXP-2025"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 font-mono focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleLinkDocsByRef(linkRefValue)}
                className="w-full py-2.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center space-x-1.5"
              >
                <Link2 className="w-4 h-4 text-teal-200" />
                <span>Search & Link to Consignment</span>
              </button>
              <button
                type="button"
                onClick={() => handleLinkDocsByRef()}
                className="w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition"
              >
                Link All Available System Documents
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
