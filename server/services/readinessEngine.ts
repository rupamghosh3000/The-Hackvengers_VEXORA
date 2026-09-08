import { ExportProject, Business, DocumentRecord, Requirement } from '../../src/types';

export interface ReadinessCategoryBreakdown {
  category: string;
  weight: number;
  score: number;
  weightedScore: number;
  completed: number;
  total: number;
  items: { title: string; status: 'completed' | 'in_progress' | 'missing' | 'blocked'; note?: string }[];
}

export interface ReadinessReport {
  overallScore: number;
  status: 'Not Ready' | 'Needs Attention' | 'Almost Ready' | 'Export Ready';
  categories: ReadinessCategoryBreakdown[];
  criticalBlockers: string[];
  warnings: string[];
  recommendedNextActions: string[];
  lastCalculatedAt: string;
}

export function calculateExportReadiness(
  project: ExportProject,
  business: Business,
  documents: DocumentRecord[]
): ReadinessReport {
  const categories: ReadinessCategoryBreakdown[] = [];
  const criticalBlockers: string[] = [];
  const warnings: string[] = [];
  const recommendedNextActions: string[] = [];

  // 1. Business Readiness (15%)
  const bizItems: { title: string; status: 'completed' | 'in_progress' | 'missing' | 'blocked'; note?: string }[] = [
    { 
      title: 'Valid GST Registration', 
      status: business.gstStatus === 'Verified' ? 'completed' : business.gstStatus === 'Pending' ? 'in_progress' : 'missing',
      note: business.gstNumber || 'Missing GSTIN'
    },
    { 
      title: 'DGFT Import Export Code (IEC)', 
      status: business.iecStatus === 'Verified' ? 'completed' : business.iecStatus === 'Pending' ? 'in_progress' : 'missing',
      note: business.iecNumber || 'Mandatory 10-digit IEC code'
    },
    { 
      title: 'Udyam MSME Registration', 
      status: business.udyamNumber ? 'completed' : 'in_progress',
      note: business.udyamNumber || 'For export subsidy & credit benefits'
    },
    { 
      title: 'Authorized Bank AD Code Registration', 
      status: 'completed',
      note: 'Linked with JNPT port customs'
    }
  ];
  const bizCompleted = bizItems.filter(i => i.status === 'completed').length;
  const bizScore = Math.round((bizCompleted / bizItems.length) * 100);
  if (business.iecStatus !== 'Verified') {
    criticalBlockers.push('DGFT IEC verification incomplete — goods cannot clear Indian customs.');
  }

  // 2. Export Documentation (20%)
  const hasInvoice = documents.some(d => d.type === 'Commercial Invoice' && d.status === 'Verified');
  const hasPackingList = documents.some(d => d.type === 'Packing List' && d.status === 'Verified');
  const hasCOO = documents.some(d => d.type === 'Certificate of Origin (COO)' && (d.status === 'Verified' || d.status === 'Under Review'));
  
  const docItems: { title: string; status: 'completed' | 'in_progress' | 'missing' | 'blocked'; note?: string }[] = [
    { title: 'Commercial Invoice (FOB/CIF Compliant)', status: hasInvoice ? 'completed' : 'in_progress' },
    { title: 'Detailed Packing List with Carton Weights', status: hasPackingList ? 'completed' : 'in_progress' },
    { title: 'Non-Preferential Certificate of Origin (COO)', status: hasCOO ? 'completed' : 'missing' },
    { title: 'Electronic Bank Realisation (e-BRC) Framework', status: 'completed' }
  ];
  const docCompleted = docItems.filter(i => i.status === 'completed').length;
  const docScore = Math.round((docCompleted / docItems.length) * 100);
  if (!hasInvoice) recommendedNextActions.push('Upload finalized Commercial Invoice for AI compliance audit.');

  // 3. Product Compliance (20%)
  const complianceDoc = documents.find(d => d.type === 'Product Test Certificate (REACH / RoHS / FDA)');
  const hasValidCompliance = complianceDoc && complianceDoc.status === 'Verified';
  const hasComplianceIssue = complianceDoc && complianceDoc.status === 'Needs Correction';
  
  const compItems: { title: string; status: 'completed' | 'in_progress' | 'missing' | 'blocked'; note?: string }[] = [
    { 
      title: project.destinationCountry === 'Germany' || project.destinationCountry === 'Italy' 
        ? 'EU REACH SVHC & Azo Dye Laboratory Clearance'
        : project.destinationCountry === 'United States'
        ? 'US FDA / Consumer Product Safety Clearance'
        : 'Destination Statutory Quality Certificate',
      status: hasValidCompliance ? 'completed' : hasComplianceIssue ? 'blocked' : 'in_progress',
      note: complianceDoc?.fileName
    },
    { title: 'Harmonized System (HS) Code Classification', status: 'completed', note: `HS: ${project.hsCode}` },
    { title: 'Country of Origin Marks & Barcode Integrity', status: 'completed' }
  ];
  const compCompleted = compItems.filter(i => i.status === 'completed').length;
  let compScore = Math.round((compCompleted / compItems.length) * 100);
  if (hasComplianceIssue) {
    compScore = Math.min(compScore, 40);
    criticalBlockers.push('Product test certificate rejected by auditor: Accredited NABL test report required.');
    recommendedNextActions.push('Submit material test samples to an accredited testing laboratory.');
  }

  // 4. Packaging & Labelling (10%)
  const packItems: { title: string; status: 'completed' | 'in_progress' | 'missing' | 'blocked'; note?: string }[] = [
    { title: 'ISPM-15 Heat Treated Wooden Pallet Markings', status: 'completed' },
    { title: 'Dual-Language Destination Warning Labels', status: project.readinessScore > 50 ? 'completed' : 'in_progress' },
    { title: 'Recyclable Packaging Material Declaration', status: 'completed' }
  ];
  const packCompleted = packItems.filter(i => i.status === 'completed').length;
  const packScore = Math.round((packCompleted / packItems.length) * 100);

  // 5. Buyer Documentation (10%)
  const buyerItems: { title: string; status: 'completed' | 'in_progress' | 'missing' | 'blocked'; note?: string }[] = [
    { title: 'Buyer Purchase Order Signed', status: project.buyerCompany ? 'completed' : 'in_progress' },
    { title: 'Agreed Payment Terms (LC / Advance / CAD)', status: 'completed' },
    { title: 'Consignee Delivery Address Confirmation', status: 'completed' }
  ];
  const buyerCompleted = buyerItems.filter(i => i.status === 'completed').length;
  const buyerScore = Math.round((buyerCompleted / buyerItems.length) * 100);

  // 6. Logistics Coordination (10%)
  const hasShipment = project.status === 'In Transit' || project.status === 'Ready to Export';
  const logItems: { title: string; status: 'completed' | 'in_progress' | 'missing' | 'blocked'; note?: string }[] = [
    { title: 'Carrier Space Booking & Container Slot', status: hasShipment ? 'completed' : 'in_progress' },
    { title: 'Factory Stuffing / CFS Terminal Gate-in', status: project.status === 'In Transit' ? 'completed' : 'in_progress' }
  ];
  const logCompleted = logItems.filter(i => i.status === 'completed').length;
  const logScore = Math.round((logCompleted / logItems.length) * 100);

  // 7. Customs & CHA Readiness (5%)
  const hasCustoms = project.status === 'In Transit' || project.readinessScore >= 75;
  const custItems: { title: string; status: 'completed' | 'in_progress' | 'missing' | 'blocked'; note?: string }[] = [
    { title: 'ICEGATE Shipping Bill Checklist Generation', status: hasCustoms ? 'completed' : 'in_progress' },
    { title: 'Let Export Order (LEO) Customs Sanction', status: project.status === 'In Transit' ? 'completed' : 'in_progress' }
  ];
  const custCompleted = custItems.filter(i => i.status === 'completed').length;
  const custScore = Math.round((custCompleted / custItems.length) * 100);

  // 8. Marine Cargo Insurance (5%)
  const hasInsurance = documents.some(d => d.type === 'Marine Cargo Insurance Policy' && d.status === 'Verified');
  const insItems: { title: string; status: 'completed' | 'in_progress' | 'missing' | 'blocked'; note?: string }[] = [
    { title: 'Institute Cargo Clauses (A) Policy', status: hasInsurance ? 'completed' : 'in_progress' }
  ];
  const insCompleted = insItems.filter(i => i.status === 'completed').length;
  const insScore = Math.round((insCompleted / insItems.length) * 100);
  if (!hasInsurance) warnings.push('Marine insurance policy pending endorsement for active shipment.');

  // 9. Shipment Tracking Readiness (5%)
  const shipScore = project.status === 'In Transit' ? 100 : project.status === 'Ready to Export' ? 80 : 40;

  // Build Category Breakdown
  categories.push(
    { category: 'Business Eligibility', weight: 0.15, score: bizScore, weightedScore: Math.round(bizScore * 0.15), completed: bizCompleted, total: bizItems.length, items: bizItems },
    { category: 'Export Documentation', weight: 0.20, score: docScore, weightedScore: Math.round(docScore * 0.20), completed: docCompleted, total: docItems.length, items: docItems },
    { category: 'Product Compliance & Certifications', weight: 0.20, score: compScore, weightedScore: Math.round(compScore * 0.20), completed: compCompleted, total: compItems.length, items: compItems },
    { category: 'Packaging & International Labelling', weight: 0.10, score: packScore, weightedScore: Math.round(packScore * 0.10), completed: packCompleted, total: packItems.length, items: packItems },
    { category: 'Buyer & Export Documentation', weight: 0.10, score: buyerScore, weightedScore: Math.round(buyerScore * 0.10), completed: buyerCompleted, total: buyerItems.length, items: buyerItems },
    { category: 'Logistics & Freight Coordination', weight: 0.10, score: logScore, weightedScore: Math.round(logScore * 0.10), completed: logCompleted, total: logItems.length, items: logItems },
    { category: 'Customs & Port CHA Readiness', weight: 0.05, score: custScore, weightedScore: Math.round(custScore * 0.05), completed: custCompleted, total: custItems.length, items: custItems },
    { category: 'Marine Cargo Insurance', weight: 0.05, score: insScore, weightedScore: Math.round(insScore * 0.05), completed: insCompleted, total: insItems.length, items: insItems },
    { category: 'Shipment & Delivery Readiness', weight: 0.05, score: shipScore, weightedScore: Math.round(shipScore * 0.05), completed: shipScore === 100 ? 1 : 0, total: 1, items: [{ title: 'Port Delivery & BL Dispatch', status: shipScore === 100 ? 'completed' : 'in_progress' }] }
  );

  // Deterministic Weighted Sum
  const rawSum = categories.reduce((sum, cat) => sum + (cat.score * cat.weight), 0);
  const overallScore = Math.min(100, Math.max(0, Math.round(rawSum)));

  let status: 'Not Ready' | 'Needs Attention' | 'Almost Ready' | 'Export Ready' = 'Not Ready';
  if (overallScore >= 90) status = 'Export Ready';
  else if (overallScore >= 75) status = 'Almost Ready';
  else if (overallScore >= 50) status = 'Needs Attention';

  if (recommendedNextActions.length === 0) {
    if (overallScore < 80) {
      recommendedNextActions.push('Complete pending packaging marks and obtain final shipping bill review.');
    } else {
      recommendedNextActions.push('Monitor maritime carrier voyage updates and notify buyer of ETA.');
    }
  }

  return {
    overallScore,
    status,
    categories,
    criticalBlockers,
    warnings,
    recommendedNextActions,
    lastCalculatedAt: new Date().toISOString()
  };
}
