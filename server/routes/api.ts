import express, { Request, Response } from 'express';
import { db } from '../db';
import { calculateExportReadiness } from '../services/readinessEngine';
import { generatePersonalizedRoadmap, evaluateExportRisks } from '../services/rulesEngine';
import { calculateExportCost } from '../services/costEstimator';
import { calculateExportTimeline } from '../services/timelineEstimator';
import { analyzeDocumentWithGemini, askExportCopilot } from '../services/geminiService';
import { logisticsService } from '../services/logisticsProvider';
import { ExportProject, DocumentRecord, User } from '../../src/types';

export const apiRouter = express.Router();

// --- AUTHENTICATION ---
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = db.getUserByEmail(email || 'vikram@palgharleather.com');
  if (!user) {
    return res.status(401).json({ error: 'User not found. Try one of the demo role credentials.' });
  }
  const business = db.getBusiness(user.businessId);
  return res.json({ user, business });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, role, businessName, city, state, pinCode, gstNumber, iecNumber } = req.body;
  
  const newUser: User = {
    id: 'usr-' + Date.now(),
    name: name || 'MSME Exporter',
    email: email || 'exporter@msme.in',
    role: role || 'msme',
    businessId: 'biz-' + Date.now(),
    language: 'en',
    title: 'Owner / Partner',
    createdAt: new Date().toISOString()
  };

  const newBusiness = {
    id: newUser.businessId!,
    name: businessName || 'New Indian Enterprises',
    ownerName: newUser.name,
    email: newUser.email,
    phone: '+91 98200 11223',
    address: 'Industrial Estate, Station Road',
    city: city || 'Palghar',
    state: state || 'Maharashtra',
    pinCode: pinCode || '401404',
    gstNumber: gstNumber || '27AABCN9999K1Z4',
    gstStatus: 'Verified' as const,
    iecNumber: iecNumber || '0308999888',
    iecStatus: 'Verified' as const,
    businessType: 'Manufacturer Exporter' as const,
    products: ['General Goods'],
    yearsInOperation: 3,
    exportExperience: 'First-time Exporter' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.createUser(newUser);
  db.updateBusiness(newBusiness.id, newBusiness);

  return res.status(201).json({ user: newUser, business: newBusiness });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const email = req.query.email as string || 'vikram@palgharleather.com';
  const user = db.getUserByEmail(email) || db.getUsers()[0];
  const business = db.getBusiness(user.businessId);
  return res.json({ user, business });
});

// --- BUSINESS PROFILE ---
apiRouter.get('/business', (req: Request, res: Response) => {
  const business = db.getBusiness();
  return res.json(business);
});

apiRouter.put('/business', (req: Request, res: Response) => {
  const updated = db.updateBusiness('biz-1', req.body);
  db.addAuditLog('biz-1', 'usr-1', 'Vikram Singhania', 'Business Profile Updated', 'Updated business credentials and DGFT registration details.');
  return res.json(updated);
});

// --- PROJECTS ---
apiRouter.get('/projects', (req: Request, res: Response) => {
  const projects = db.getAllProjects();
  return res.json(projects);
});

apiRouter.get('/projects/:id', (req: Request, res: Response) => {
  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const business = db.getBusiness(project.businessId);
  const documents = db.getDocuments(project.id);
  const shipments = db.getShipments(project.id);
  const readiness = calculateExportReadiness(project, business, documents);
  const baseRoadmap = generatePersonalizedRoadmap(project);
  const roadmap = db.applyRoadmapOverrides(project.id, baseRoadmap);
  const risks = evaluateExportRisks(project);
  const costEstimate = calculateExportCost({
    productValue: project.estimatedValue,
    quantity: project.quantity,
    shippingMode: project.shippingMode,
    destinationCountry: project.destinationCountry,
    currency: project.currency
  });
  const timelineEstimate = calculateExportTimeline({
    shippingMode: project.shippingMode,
    destinationCountry: project.destinationCountry,
    targetShipmentDate: project.targetShipmentDate
  });

  return res.json({
    project,
    business,
    documents,
    shipment: shipments[0] || null,
    readiness,
    roadmap,
    risks,
    costEstimate,
    timelineEstimate
  });
});

apiRouter.post('/projects', (req: Request, res: Response) => {
  const body = req.body;
  const customId = body.id?.trim() || body.consignmentNumber?.trim();
  const projectId = customId || `EXP-2025-0${Math.floor(100 + Math.random() * 900)}`;

  const newProject: ExportProject = {
    id: projectId,
    businessId: body.businessId || 'biz-1',
    name: body.name || `Consignment ${projectId}`,
    productId: 'prod-' + Date.now(),
    productName: body.productName || 'Export Product',
    productCategory: body.productCategory || 'General Merchandise',
    hsCode: body.hsCode || '8479.89',
    description: body.description || (body.invoiceNumber ? `Invoice Ref: ${body.invoiceNumber}` : 'Indian manufactured export batch'),
    origin: body.origin || 'Palghar, Maharashtra (via JNPT Nhava Sheva)',
    destinationCountry: body.destinationCountry || 'Germany',
    destinationCity: body.destinationCity || 'Hamburg',
    destinationPort: body.destinationPort || 'Port of Hamburg (DEHAM)',
    quantity: Number(body.quantity) || 500,
    unit: body.unit || 'Pcs',
    estimatedValue: Number(body.estimatedValue) || 25000,
    currency: body.currency || 'USD',
    shippingMode: body.shippingMode || 'Sea',
    buyerName: body.buyerName || 'Global Importer Partner',
    buyerCompany: body.buyerCompany || 'International Trade Corp',
    buyerContact: body.buyerContact || 'trade@globalimporter.com',
    buyerAddress: body.buyerAddress || 'Port Zone Warehouse',
    readinessScore: 65,
    riskLevel: 'Medium',
    status: 'In Preparation',
    targetShipmentDate: body.targetShipmentDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const business = db.getBusiness(newProject.businessId);

  // Auto-link master enterprise documents (IEC, GST, Udyam, RCMC) to new consignment
  let projectDocs: DocumentRecord[] = [];
  if (body.autoLinkMasterDocs !== false) {
    projectDocs = db.syncMasterDocumentsToProject(newProject.id, newProject.businessId);
  }

  const initialReadiness = calculateExportReadiness(newProject, business, projectDocs);
  newProject.readinessScore = initialReadiness.overallScore;

  db.createProject(newProject);
  return res.status(201).json(newProject);
});

// Sync master enterprise documents on demand
apiRouter.post('/projects/:id/documents/sync-master', (req: Request, res: Response) => {
  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const docs = db.syncMasterDocumentsToProject(project.id, project.businessId);
  
  // Recalculate readiness
  const business = db.getBusiness(project.businessId);
  const updatedReadiness = calculateExportReadiness(project, business, docs);
  db.updateProject(project.id, { readinessScore: updatedReadiness.overallScore });

  return res.json({ success: true, count: docs.length, documents: docs, readinessScore: updatedReadiness.overallScore });
});

// Link existing trade documents by reference number
apiRouter.post('/projects/:id/documents/link-by-ref', (req: Request, res: Response) => {
  const { referenceNumber, searchAll } = req.body;
  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const allDocs = db.getDocuments();
  const matchedDocs = allDocs.filter(d => 
    d.projectId !== project.id && (
      (referenceNumber && (d.fileName.toLowerCase().includes(referenceNumber.toLowerCase()) || d.id.toLowerCase().includes(referenceNumber.toLowerCase()))) ||
      searchAll
    )
  );

  let linkedCount = 0;
  for (const mDoc of matchedDocs) {
    const copy: DocumentRecord = {
      ...mDoc,
      id: `doc-linked-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      projectId: project.id,
      uploadedAt: new Date().toISOString()
    };
    db.saveDocument(copy);
    linkedCount++;
  }

  const updatedDocs = db.getDocuments(project.id);
  const business = db.getBusiness(project.businessId);
  const updatedReadiness = calculateExportReadiness(project, business, updatedDocs);
  db.updateProject(project.id, { readinessScore: updatedReadiness.overallScore });

  return res.json({ success: true, linkedCount, documents: updatedDocs, readinessScore: updatedReadiness.overallScore });
});

apiRouter.put('/projects/:id', (req: Request, res: Response) => {
  const updated = db.updateProject(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Project not found' });
  return res.json(updated);
});

apiRouter.delete('/projects/:id', (req: Request, res: Response) => {
  db.deleteProject(req.params.id);
  return res.json({ success: true });
});

// Update Roadmap Step Status
apiRouter.put('/projects/:id/roadmap/:stepId', (req: Request, res: Response) => {
  const projectId = req.params.id;
  const stepId = parseInt(req.params.stepId, 10);
  const { status, nextAction } = req.body;

  const project = db.getProjectById(projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  db.setRoadmapStepStatus(projectId, stepId, status, nextAction);

  const baseRoadmap = generatePersonalizedRoadmap(project);
  const updatedRoadmap = db.applyRoadmapOverrides(projectId, baseRoadmap);
  const updatedStep = updatedRoadmap.find(s => s.id === stepId);

  return res.json({
    success: true,
    stepId,
    status,
    step: updatedStep,
    roadmap: updatedRoadmap
  });
});

// --- DOCUMENTS & AI ANALYSIS ---
apiRouter.get('/projects/:id/documents', (req: Request, res: Response) => {
  const docs = db.getDocuments(req.params.id);
  return res.json(docs);
});

apiRouter.post('/projects/:id/documents', async (req: Request, res: Response) => {
  const { type, fileName, fileSize, base64Data, mimeType, simulateAiFailure } = req.body;
  const projectId = req.params.id;

  const newDoc: DocumentRecord = {
    id: 'doc-' + Date.now(),
    projectId,
    type: type || 'Other',
    fileName: fileName || 'Uploaded_Document.pdf',
    fileSize: fileSize || '450 KB',
    status: 'Under Review',
    uploadedBy: 'Vikram Singhania',
    uploadedAt: new Date().toISOString()
  };

  // Perform AI Review with fallback capability
  const aiReview = await analyzeDocumentWithGemini(
    newDoc.fileName, 
    newDoc.type, 
    base64Data, 
    mimeType, 
    Boolean(simulateAiFailure)
  );
  newDoc.aiReview = aiReview;

  if (aiReview.aiStatus === 'unavailable') {
    newDoc.status = 'Under Review';
    console.warn('[AI Document Analysis Debug] AI review unavailable. Manual input fallback enabled for:', newDoc.fileName);
  } else {
    newDoc.status = aiReview.completenessScore >= 80 ? 'Verified' : 'Needs Correction';
  }

  db.saveDocument(newDoc);

  // Recalculate project readiness score
  const project = db.getProjectById(projectId);
  if (project) {
    const business = db.getBusiness(project.businessId);
    const docs = db.getDocuments(projectId);
    const newReadiness = calculateExportReadiness(project, business, docs);
    db.updateProject(projectId, { readinessScore: newReadiness.overallScore });
  }

  db.addAuditLog(
    projectId, 
    'usr-1', 
    'Vikram Singhania', 
    aiReview.aiStatus === 'unavailable' ? 'Document Uploaded (AI Fallback Active)' : 'Document Uploaded & Analyzed', 
    `Uploaded ${newDoc.fileName} (${newDoc.type}) - ${aiReview.aiStatus === 'unavailable' ? 'AI unavailable, manual inspection required' : `AI Score: ${aiReview.completenessScore}%`}`
  );

  return res.status(201).json(newDoc);
});

// Manual document entry fallback endpoint
apiRouter.post('/projects/:id/documents/manual', (req: Request, res: Response) => {
  const { 
    type, 
    fileName, 
    fileSize, 
    referenceNumber, 
    issuingAuthority, 
    declaredHsCode, 
    declaredValue, 
    expiryDate, 
    status, 
    checklist, 
    comments 
  } = req.body;
  const projectId = req.params.id;

  const newDoc: DocumentRecord = {
    id: 'doc-' + Date.now(),
    projectId,
    type: type || 'Commercial Invoice',
    fileName: fileName || `${(type || 'Document').replace(/[^a-zA-Z0-9]/g, '_')}_Manual_Record.pdf`,
    fileSize: fileSize || 'Manual Entry',
    status: status || 'Verified',
    expiryDate,
    referenceNumber,
    issuingAuthority,
    declaredHsCode,
    declaredValue,
    uploadedBy: 'Vikram Singhania (Manual)',
    uploadedAt: new Date().toISOString(),
    reviewerComments: comments,
    verifiedAt: status === 'Verified' ? new Date().toISOString() : undefined,
    aiReview: {
      documentType: type || 'Commercial Invoice',
      completenessScore: status === 'Verified' ? 95 : 65,
      detectedFields: [
        { field: 'Reference / Invoice Number', value: referenceNumber || 'Recorded', present: Boolean(referenceNumber) },
        { field: 'Issuing Authority / Agency', value: issuingAuthority || 'Self-Certified', present: Boolean(issuingAuthority) },
        { field: 'HS Code Declared', value: declaredHsCode || 'Included', present: Boolean(declaredHsCode) },
        { field: 'Valuation & Terms', value: declaredValue || 'Declared', present: Boolean(declaredValue) },
        ...(checklist || []).map((f: string) => ({ field: f, value: 'Manually Verified', present: true }))
      ],
      missingFields: status === 'Needs Correction' ? ['Manual Correction Required'] : [],
      issues: status === 'Needs Correction' ? [{ severity: 'medium', message: comments || 'Discrepancy noted during manual inspection' }] : [],
      explanation: `Document manually verified and recorded by exporter. Reference ID: ${referenceNumber || 'N/A'}.`,
      recommendation: status === 'Verified' ? 'Document verified for customs Let Export Order (LEO).' : 'Update document fields before container stuffing.',
      analyzedAt: new Date().toISOString(),
      disclaimer: 'Manual verification entry — subject to statutory Indian Customs physical verification.',
      aiStatus: 'manual_entry',
      isManualEntry: true
    }
  };

  db.saveDocument(newDoc);

  console.info('[AI Document Analysis Debug] Document manually saved to database:', {
    projectId,
    docId: newDoc.id,
    type: newDoc.type,
    status: newDoc.status
  });

  // Recalculate project readiness
  const project = db.getProjectById(projectId);
  if (project) {
    const business = db.getBusiness(project.businessId);
    const docs = db.getDocuments(projectId);
    const newReadiness = calculateExportReadiness(project, business, docs);
    db.updateProject(projectId, { readinessScore: newReadiness.overallScore });
  }

  db.addAuditLog(
    projectId, 
    'usr-1', 
    'Vikram Singhania', 
    'Manual Document Entry Saved', 
    `Recorded ${newDoc.type} (Ref: ${referenceNumber || 'N/A'}) with status "${newDoc.status}" via fallback mode.`
  );

  return res.status(201).json(newDoc);
});

// Update document manually (status override or field edits)
apiRouter.put('/documents/:id', (req: Request, res: Response) => {
  const existing = db.getDocumentById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Document not found' });

  const updated: DocumentRecord = {
    ...existing,
    ...req.body,
    status: req.body.status || existing.status,
    verifiedAt: req.body.status === 'Verified' ? new Date().toISOString() : existing.verifiedAt
  };

  if (req.body.referenceNumber) updated.referenceNumber = req.body.referenceNumber;
  if (req.body.issuingAuthority) updated.issuingAuthority = req.body.issuingAuthority;
  if (req.body.declaredHsCode) updated.declaredHsCode = req.body.declaredHsCode;
  if (req.body.declaredValue) updated.declaredValue = req.body.declaredValue;
  if (req.body.reviewerComments) updated.reviewerComments = req.body.reviewerComments;

  if (updated.aiReview) {
    updated.aiReview.isManualEntry = true;
    if (updated.status === 'Verified') {
      updated.aiReview.completenessScore = Math.max(90, updated.aiReview.completenessScore);
    }
  }

  db.saveDocument(updated);

  console.info('[AI Document Analysis Debug] Document manually updated in database:', {
    id: updated.id,
    status: updated.status,
    type: updated.type
  });

  const project = db.getProjectById(updated.projectId);
  if (project) {
    const business = db.getBusiness(project.businessId);
    const docs = db.getDocuments(project.id);
    const newReadiness = calculateExportReadiness(project, business, docs);
    db.updateProject(project.id, { readinessScore: newReadiness.overallScore });
  }

  db.addAuditLog(
    updated.projectId,
    'usr-1',
    'Vikram Singhania',
    'Document Updated Manually',
    `Updated ${updated.fileName} status to "${updated.status}".`
  );

  return res.json(updated);
});

apiRouter.delete('/documents/:id', (req: Request, res: Response) => {
  const doc = db.getDocumentById(req.params.id);
  if (doc) {
    db.deleteDocument(req.params.id);
    db.addAuditLog(doc.projectId, 'usr-1', 'Vikram Singhania', 'Document Deleted', `Removed document ${doc.fileName}`);
  }
  return res.json({ success: true });
});

// Sync master enterprise documents (IEC, GSTIN, Udyam, RCMC) to a project
apiRouter.post('/projects/:id/documents/sync-master', (req: Request, res: Response) => {
  const projectId = req.params.id;
  const project = db.getProjectById(projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const updatedDocs = db.syncMasterDocumentsToProject(projectId, project.businessId);
  const business = db.getBusiness(project.businessId);
  const newReadiness = calculateExportReadiness(project, business, updatedDocs);
  db.updateProject(projectId, { readinessScore: newReadiness.overallScore });

  db.addAuditLog(
    projectId,
    'usr-1',
    'Vikram Singhania',
    'Master Documents Synced',
    'Synced enterprise master credentials (IEC, GST, Udyam, RCMC) to this consignment.'
  );
  return res.json(updatedDocs);
});

// Link existing enterprise documents by Invoice / Consignment / Packing reference number
apiRouter.post('/projects/:id/documents/link-by-ref', (req: Request, res: Response) => {
  const projectId = req.params.id;
  const { referenceNumber } = req.body;
  const project = db.getProjectById(projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  if (!referenceNumber || !referenceNumber.trim()) {
    return res.status(400).json({ error: 'Reference number is required' });
  }

  const cleanRef = referenceNumber.trim().toLowerCase();
  const allDocs = db.getDocuments();
  const matchedDocs = allDocs.filter(d => 
    d.projectId !== projectId && (
      d.fileName.toLowerCase().includes(cleanRef) ||
      (d.referenceNumber && d.referenceNumber.toLowerCase().includes(cleanRef)) ||
      (d.aiReview?.detectedFields?.some(f => f.value.toLowerCase().includes(cleanRef)))
    )
  );

  const currentProjectDocs = db.getDocuments(projectId);
  for (const mDoc of matchedDocs) {
    const alreadyInProject = currentProjectDocs.some(e => e.fileName === mDoc.fileName && e.type === mDoc.type);
    if (!alreadyInProject) {
      const linkedDoc: DocumentRecord = {
        ...mDoc,
        id: `doc-link-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        projectId,
        uploadedAt: new Date().toISOString()
      };
      db.saveDocument(linkedDoc);
    }
  }

  const updatedDocs = db.getDocuments(projectId);
  const business = db.getBusiness(project.businessId);
  const newReadiness = calculateExportReadiness(project, business, updatedDocs);
  db.updateProject(projectId, { readinessScore: newReadiness.overallScore });

  db.addAuditLog(
    projectId,
    'usr-1',
    'Vikram Singhania',
    'Documents Linked by Reference',
    `Linked ${matchedDocs.length} document(s) matching ref "${referenceNumber}".`
  );
  return res.json(updatedDocs);
});

// --- LOGISTICS PROVIDER API (Swappable with real provider) ---
apiRouter.get('/logistics/tracking/:query', async (req: Request, res: Response) => {
  const result = await logisticsService.getTracking(req.params.query);
  if (!result) {
    return res.status(404).json({ error: 'No shipment found for tracking query.' });
  }
  return res.json(result);
});

apiRouter.get('/logistics/shipments', async (req: Request, res: Response) => {
  const projectId = req.query.projectId as string | undefined;
  const list = await logisticsService.listShipments(projectId);
  return res.json(list);
});

apiRouter.post('/logistics/simulate-milestone', async (req: Request, res: Response) => {
  const { shipmentId } = req.body;
  const result = await logisticsService.simulateNextMilestone(shipmentId || 'sh-1');
  if (!result) {
    return res.status(404).json({ error: 'Shipment not found for simulation.' });
  }
  return res.json(result);
});

apiRouter.post('/logistics/messages', async (req: Request, res: Response) => {
  const { shipmentId, sender, message } = req.body;
  const reply = await logisticsService.sendChaMessage(
    shipmentId || 'sh-1',
    sender || 'Vikram Singhania',
    message || 'Requesting current vessel status.'
  );
  return res.json(reply);
});

apiRouter.put('/logistics/eta', async (req: Request, res: Response) => {
  const { shipmentId, newEta } = req.body;
  const updated = await logisticsService.updateShipmentEta(shipmentId || 'sh-1', newEta);
  if (!updated) return res.status(404).json({ error: 'Shipment not found' });
  return res.json(updated);
});

apiRouter.put('/logistics/status', async (req: Request, res: Response) => {
  const { shipmentId, status, comment } = req.body;
  const updated = await logisticsService.updateShipmentStatus(shipmentId || 'sh-1', status, comment);
  if (!updated) return res.status(404).json({ error: 'Shipment not found' });
  return res.json(updated);
});

// --- SHIPMENTS (Direct db access) ---
apiRouter.get('/projects/:id/shipments', (req: Request, res: Response) => {
  const shipments = db.getShipments(req.params.id);
  return res.json(shipments);
});

apiRouter.put('/shipments/:id', (req: Request, res: Response) => {
  const existing = db.getShipmentById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Shipment not found' });
  const updated = db.saveShipment({ ...existing, ...req.body });
  return res.json(updated);
});

// --- BUSINESS PROFILE UPDATE ---
apiRouter.put('/business', (req: Request, res: Response) => {
  const updated = db.updateBusiness('biz-1', req.body);
  return res.json(updated);
});

// --- ESTIMATORS ---
apiRouter.post('/projects/:id/cost-estimate', (req: Request, res: Response) => {
  const project = db.getProjectById(req.params.id);
  const estimate = calculateExportCost({
    productValue: Number(req.body.productValue) || project?.estimatedValue || 42500,
    quantity: Number(req.body.quantity) || project?.quantity || 500,
    shippingMode: req.body.shippingMode || project?.shippingMode || 'Sea',
    destinationCountry: req.body.destinationCountry || project?.destinationCountry || 'Germany',
    packagingGrade: req.body.packagingGrade || 'Standard',
    currency: req.body.currency || project?.currency || 'USD'
  });
  return res.json(estimate);
});

apiRouter.post('/projects/:id/timeline-estimate', (req: Request, res: Response) => {
  const project = db.getProjectById(req.params.id);
  const timeline = calculateExportTimeline({
    shippingMode: req.body.shippingMode || project?.shippingMode || 'Sea',
    destinationCountry: req.body.destinationCountry || project?.destinationCountry || 'Germany',
    hasCertificates: req.body.hasCertificates ?? true,
    targetShipmentDate: req.body.targetShipmentDate || project?.targetShipmentDate
  });
  return res.json(timeline);
});

// --- AI COPILOT ---
apiRouter.post('/ai/copilot', async (req: Request, res: Response) => {
  const { question, projectId, language } = req.body;
  const project = db.getProjectById(projectId || 'EXP-2025-0142');
  const business = db.getBusiness(project?.businessId || 'biz-1');
  const documents = db.getDocuments(project?.id);
  const shipments = db.getShipments(project?.id);
  const readinessReport = project ? calculateExportReadiness(project, business, documents) : null;
  const risks = project ? evaluateExportRisks(project) : [];
  const baseRoadmap = project ? generatePersonalizedRoadmap(project) : [];
  const roadmap = project ? db.applyRoadmapOverrides(project.id, baseRoadmap) : [];

  const reply = await askExportCopilot(question, {
    project,
    business,
    documents,
    readinessReport,
    risks,
    roadmap,
    shipment: shipments[0],
    language: language || 'en'
  });

  return res.json(reply);
});

// --- NOTIFICATIONS & AUDIT ---
apiRouter.get('/notifications', (req: Request, res: Response) => {
  return res.json(db.getNotifications());
});

apiRouter.put('/notifications/:id/read', (req: Request, res: Response) => {
  const n = db.markNotificationRead(req.params.id);
  return res.json(n);
});

apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  const projectId = req.query.projectId as string | undefined;
  return res.json(db.getAuditLogs(projectId));
});

// --- ADMIN RULES ---
apiRouter.get('/admin/rules', (req: Request, res: Response) => {
  return res.json(db.getRules());
});

apiRouter.post('/admin/rules', (req: Request, res: Response) => {
  const newRule = db.addRule({
    id: 'rule-' + Date.now(),
    productCategory: req.body.productCategory || 'General Merchandise',
    destinationCountry: req.body.destinationCountry || 'All Countries',
    requirementType: req.body.requirementType || 'Compliance',
    title: req.body.title || 'Export Rule Requirement',
    description: req.body.description || '',
    priority: req.body.priority || 'Medium',
    source: req.body.source || 'DGFT Foreign Trade Policy',
    active: true
  });
  return res.status(201).json(newRule);
});

apiRouter.delete('/admin/rules/:id', (req: Request, res: Response) => {
  db.deleteRule(req.params.id);
  return res.json({ success: true });
});
