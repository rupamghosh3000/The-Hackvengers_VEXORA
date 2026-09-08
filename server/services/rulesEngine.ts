import { ExportProject, RoadmapStep, RiskFactor, ExportRule, Requirement } from '../../src/types';

export type { RoadmapStep, RiskFactor, ExportRule, Requirement };

export function generatePersonalizedRoadmap(project: ExportProject): RoadmapStep[] {
  const isHighReady = project.readinessScore >= 80;
  const isMidReady = project.readinessScore >= 50;

  return [
    {
      id: 1,
      stepNumber: 1,
      title: 'Business Eligibility & Port AD Code',
      category: 'Business',
      description: 'Ensure Udyam, GSTIN, and Authorized Dealer (AD) code are linked with ICEGATE port directory.',
      status: 'Completed',
      priority: 'High',
      estimatedDuration: '1-2 Days',
      estimatedCost: '₹0 (Free)',
      requiredDocuments: ['Udyam Certificate', 'Bank AD Code Letter'],
      responsibleParty: 'MSME Owner',
      nextAction: 'Verified with JNPT Port Customs'
    },
    {
      id: 2,
      stepNumber: 2,
      title: 'DGFT Import Export Code (IEC) Verification',
      category: 'Business',
      description: 'Active 10-digit DGFT IEC registration with updated bank profile.',
      status: 'Completed',
      priority: 'High',
      estimatedDuration: '1 Day',
      estimatedCost: '₹500',
      requiredDocuments: ['DGFT IEC Certificate'],
      responsibleParty: 'MSME Owner / DGFT Portal',
      nextAction: 'Active & Valid for FY 2024-25'
    },
    {
      id: 3,
      stepNumber: 3,
      title: 'Harmonized System (HS) Code Classification',
      category: 'Compliance',
      description: `Validate 6/8-digit HS Code (${project.hsCode}) against destination import tariff schedules.`,
      status: 'Completed',
      priority: 'High',
      estimatedDuration: '1 Day',
      requiredDocuments: ['Product Technical Spec Sheet'],
      responsibleParty: 'Export Consultant',
      nextAction: `HS ${project.hsCode} Confirmed`
    },
    {
      id: 4,
      stepNumber: 4,
      title: `Product Specific Certifications (${project.destinationCountry})`,
      category: 'Compliance',
      description: project.destinationCountry === 'Germany' || project.destinationCountry === 'Italy'
        ? 'Mandatory EU REACH SVHC chemical assay, Azo dye non-detection, and Chromium VI laboratory certificate.'
        : `Destination statutory conformity certificate for ${project.destinationCountry}.`,
      status: project.readinessScore < 50 ? 'Blocked' : isHighReady ? 'Completed' : 'In Progress',
      priority: 'High',
      estimatedDuration: '7-12 Days',
      estimatedCost: '₹18,500',
      requiredDocuments: ['NABL Accredited Test Report', 'Material Safety Data Sheet (MSDS)'],
      responsibleParty: 'Accredited Lab (SGS / CLRI)',
      nextAction: project.readinessScore < 50 ? 'Audit Action Required: Retest with NABL Lab' : 'Certificate Verified'
    },
    {
      id: 5,
      stepNumber: 5,
      title: 'International Export Packaging Specifications',
      category: 'Packaging',
      description: 'Moisture-proof double-wall corrugated master cartons with silica gel desiccant packs and ISPM-15 fumigated wooden pallets.',
      status: isMidReady ? 'Completed' : 'In Progress',
      priority: 'Medium',
      estimatedDuration: '3-4 Days',
      estimatedCost: '₹12,000',
      requiredDocuments: ['ISPM-15 Fumigation Certificate', 'Carton Drop Test Report'],
      responsibleParty: 'Packaging Supervisor',
      nextAction: 'Pallet Fumigation Stamps Inspected'
    },
    {
      id: 6,
      stepNumber: 6,
      title: `Destination Labelling & Language Compliance (${project.destinationCountry})`,
      category: 'Labelling',
      description: `Dual-language markings, Country of Origin "Made in India", Net Weight, EAN-13 Barcode, and EU Recyclable logo.`,
      status: isHighReady ? 'Completed' : 'In Progress',
      priority: 'Medium',
      estimatedDuration: '2 Days',
      requiredDocuments: ['Artwork Label Proof'],
      responsibleParty: 'MSME QC Team',
      nextAction: 'Verified on Master Cartons'
    },
    {
      id: 7,
      stepNumber: 7,
      title: 'Buyer Export Documentation (CI & Packing List)',
      category: 'Buyer',
      description: 'Standardized Commercial Invoice and Packing List aligned with Incoterms (FOB/CIF) and buyer purchase order.',
      status: isMidReady ? 'Completed' : 'In Progress',
      priority: 'High',
      estimatedDuration: '2 Days',
      requiredDocuments: ['Commercial Invoice', 'Packing List', 'Buyer Purchase Order'],
      responsibleParty: 'Finance & Accounts',
      nextAction: 'Verified and Signed'
    },
    {
      id: 8,
      stepNumber: 8,
      title: `Freight & Logistics Booking (${project.shippingMode})`,
      category: 'Logistics',
      description: `Confirm container space booking or air cargo slot with carrier for ${project.destinationPort}.`,
      status: project.status === 'In Transit' ? 'Completed' : 'In Progress',
      priority: 'High',
      estimatedDuration: '2-3 Days',
      estimatedCost: '$2,850',
      requiredDocuments: ['Shipping Order / Booking Note'],
      responsibleParty: 'Freight Forwarder',
      nextAction: 'Container Slot Confirmed'
    },
    {
      id: 9,
      stepNumber: 9,
      title: 'Customs & CHA Coordination (ICEGATE)',
      category: 'Customs',
      description: 'Electronic filing of Shipping Bill on ICEGATE portal, EDI customs assessment, container gate-in, and Let Export Order (LEO).',
      status: project.status === 'In Transit' ? 'Completed' : isHighReady ? 'In Progress' : 'Not Started',
      priority: 'High',
      estimatedDuration: '2-4 Days',
      estimatedCost: '₹8,500 (CHA charges)',
      requiredDocuments: ['Checklist Shipping Bill', 'Customs LEO Copy'],
      responsibleParty: 'Customs House Agent (CHA)',
      nextAction: project.status === 'In Transit' ? 'LEO Granted' : 'File Checklist on ICEGATE'
    },
    {
      id: 10,
      stepNumber: 10,
      title: 'Marine Cargo Insurance Policy',
      category: 'Insurance',
      description: 'Institute Cargo Clauses (A) all-risks cover for 110% of CIF consignment value from factory floor to overseas warehouse.',
      status: isHighReady ? 'Completed' : 'In Progress',
      priority: 'High',
      estimatedDuration: '1 Day',
      estimatedCost: '$180 (0.35% + GST)',
      requiredDocuments: ['Marine Insurance Certificate'],
      responsibleParty: 'Insurance Broker',
      nextAction: 'Policy Active'
    },
    {
      id: 11,
      stepNumber: 11,
      title: 'Factory Stuffing & Port Gate-In',
      category: 'Logistics',
      description: 'Pallet stuffing under excise/customs supervision, container electronic seal (e-Seal) affixing, and dispatch to JNPT CFS.',
      status: project.status === 'In Transit' ? 'Completed' : 'Not Started',
      priority: 'Medium',
      estimatedDuration: '1-2 Days',
      requiredDocuments: ['e-Seal Inspection Note', 'Gate Pass'],
      responsibleParty: 'Factory Logistics',
      nextAction: project.status === 'In Transit' ? 'Container Port Gate-In Complete' : 'Schedule Trucking'
    },
    {
      id: 12,
      stepNumber: 12,
      title: 'Vessel In-Transit Tracking & Port Delivery',
      category: 'Logistics',
      description: `Live tracking of ocean vessel or air flight, transshipment notifications, and final delivery release against Bill of Lading.`,
      status: project.status === 'In Transit' ? 'In Progress' : 'Not Started',
      priority: 'Medium',
      estimatedDuration: project.shippingMode === 'Sea' ? '18-24 Days' : '4-6 Days',
      requiredDocuments: ['Negotiable Ocean Bill of Lading (BL)'],
      responsibleParty: 'Shipping Line & Importer',
      nextAction: project.status === 'In Transit' ? 'En Route Arabian Sea (ETA 28 Dec)' : 'Awaiting Departure'
    }
  ];
}

export function evaluateExportRisks(project: ExportProject): RiskFactor[] {
  const risks: RiskFactor[] = [];

  if (project.readinessScore < 50) {
    risks.push({
      id: 'r-1',
      category: 'Product Compliance',
      title: 'Missing Accredited Test Certification',
      severity: 'Critical',
      description: `Target destination (${project.destinationCountry}) requires statutory laboratory compliance certificate. Current in-house certificate was rejected by compliance auditor.`,
      impact: 'Risk of container detention and re-export fines by destination customs.',
      recommendedAction: 'Book priority NABL testing with SGS or CLRI testing labs immediately.',
      resolved: false
    });
  }

  if (project.destinationCountry === 'Germany' && project.readinessScore < 85) {
    risks.push({
      id: 'r-2',
      category: 'Packaging Compliance',
      title: 'LUCID Packaging Registry Verification Pending',
      severity: 'Medium',
      description: 'Under German VerpackG regulations, retail packaging must be registered in the ZSVR LUCID database before goods hit German store shelves.',
      impact: 'German buyer may incur municipal recycling surcharges.',
      recommendedAction: 'Verify LUCID registration number with European importer.',
      resolved: false
    });
  }

  if (project.status === 'In Transit') {
    risks.push({
      id: 'r-3',
      category: 'Maritime Transit',
      title: 'Cape of Good Hope Route Rerouting Surcharge & Transit Delay',
      severity: 'Low',
      description: 'Current vessel route avoids Red Sea transit, adding 8-10 days navigation buffer around Southern Africa.',
      impact: 'Estimated arrival in Hamburg adjusted to 28 Dec 2024.',
      recommendedAction: 'Automated notification dispatched to Hanseatic Goods procurement desk.',
      resolved: true
    });
  }

  return risks;
}
