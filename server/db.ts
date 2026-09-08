import fs from 'fs';
import path from 'path';
import { 
  User, 
  Business, 
  ExportProject, 
  Requirement, 
  DocumentRecord, 
  Shipment, 
  ExportRule, 
  NotificationItem, 
  AuditLogItem,
  RoadmapStep,
  RequirementStatus
} from '../src/types';

interface DatabaseSchema {
  users: User[];
  businesses: Business[];
  projects: ExportProject[];
  requirements: Requirement[];
  documents: DocumentRecord[];
  shipments: Shipment[];
  rules: ExportRule[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];
  roadmapOverrides?: Record<string, Record<number, { status: RequirementStatus; nextAction?: string }>>;
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'db.json');

const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Vikram Singhania',
    email: 'vikram@palgharleather.com',
    role: 'msme',
    businessId: 'biz-1',
    language: 'en',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAR9kZ4gSAEFIA2k1SbAUFhDCjosA4QN-_lbnPqvE5uLe6Cv0xzxZ-v2IrsdnvRnq19tX-6PO7CXz0NTJzPzNNmkgtpzQwqIpcTUZ_Ifd1_XYqiYP9QZQaDHf-_58Stp11KDpWBBSY8BGVnugy3hjK32g_GS68_p86IWFdBQBkiZdRprZPxEHMWSlNFGrZpWU2W--0LFFTzD1MiUJe9fTWn6mUmELu6DfRdVazDBIvOOhllsbRyUWxw3Q',
    title: 'Managing Director & Founder',
    createdAt: '2024-08-15T09:00:00Z'
  },
  {
    id: 'usr-2',
    name: 'Ananya Sharma',
    email: 'ananya@globaltradeadvisors.in',
    role: 'consultant',
    language: 'en',
    title: 'Lead DGFT & EU Trade Consultant',
    createdAt: '2024-06-10T10:30:00Z'
  },
  {
    id: 'usr-3',
    name: 'Arjun Mehta',
    email: 'arjun@dgftfreight.com',
    role: 'logistics',
    language: 'en',
    title: 'Senior CHA & Port Logistics Coordinator',
    createdAt: '2024-07-01T11:00:00Z'
  },
  {
    id: 'usr-4',
    name: 'Platform Administrator',
    email: 'admin@exportpilot.ai',
    role: 'admin',
    language: 'en',
    title: 'DGFT Rules & System Admin',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const INITIAL_BUSINESS: Business = {
  id: 'biz-1',
  name: 'Palghar Leather Works',
  ownerName: 'Vikram Singhania',
  email: 'vikram@palgharleather.com',
  phone: '+91 98201 44921',
  address: 'Plot 42, MIDC Industrial Area, Boisar Road',
  city: 'Palghar',
  state: 'Maharashtra',
  pinCode: '401404',
  gstNumber: '27AABCP1234F1Z8',
  gstStatus: 'Verified',
  iecNumber: '0308019482',
  iecStatus: 'Verified',
  udyamNumber: 'UDYAM-MH-24-001981',
  businessType: 'Manufacturer Exporter',
  products: ['Leather Goods', 'Handbags', 'Accessories', 'Tanned Leather'],
  yearsInOperation: 7,
  exportExperience: 'Occasional Exporter',
  createdAt: '2024-08-15T09:00:00Z',
  updatedAt: '2024-12-10T14:30:00Z'
};

const INITIAL_PROJECTS: ExportProject[] = [
  {
    id: 'EXP-2025-0142',
    businessId: 'biz-1',
    name: 'EU Autumn Batch: Premium Handbags',
    productId: 'prod-1',
    productName: 'Leather Handbags',
    productCategory: 'Leather & Finished Goods',
    hsCode: '4202.21',
    description: 'Full-grain vegetable tanned genuine cowhide ladies shoulder bags with brass fittings.',
    origin: 'Palghar, Maharashtra (via JNPT Nhava Sheva)',
    destinationCountry: 'Germany',
    destinationCity: 'Hamburg',
    destinationPort: 'Port of Hamburg (DEHAM)',
    quantity: 500,
    unit: 'Pcs',
    estimatedValue: 42500,
    currency: 'USD',
    shippingMode: 'Sea',
    buyerName: 'Klaus Lindner',
    buyerCompany: 'Hanseatic Goods GmbH',
    buyerContact: 'k.lindner@hanseaticgoods.de',
    buyerAddress: 'Speicherstadt 14, 20457 Hamburg, Germany',
    readinessScore: 78,
    riskLevel: 'Medium',
    status: 'In Transit',
    targetShipmentDate: '2024-12-28',
    createdAt: '2024-11-20T10:00:00Z',
    updatedAt: '2024-12-14T11:30:00Z'
  },
  {
    id: 'EXP-2025-0158',
    businessId: 'biz-1',
    name: 'UK Retail Chain: Wallets & Belts',
    productId: 'prod-2',
    productName: 'Wallets & Belts',
    productCategory: 'Leather & Finished Goods',
    hsCode: '4203.30',
    description: 'RFID-blocking slim bi-fold leather wallets and reversible dress belts.',
    origin: 'Palghar, Maharashtra (via JNPT Nhava Sheva)',
    destinationCountry: 'United Kingdom',
    destinationCity: 'London',
    destinationPort: 'London Gateway (GBLGP)',
    quantity: 1200,
    unit: 'Pcs',
    estimatedValue: 18200,
    currency: 'USD',
    shippingMode: 'Sea',
    buyerName: 'Arthur Pendelton',
    buyerCompany: 'British Retail Consortium',
    buyerContact: 'arthur.p@retail-brc.co.uk',
    buyerAddress: '21 Bishopsgate, London EC2N 4BQ, United Kingdom',
    readinessScore: 94,
    riskLevel: 'Low',
    status: 'Ready to Export',
    targetShipmentDate: '2025-01-15',
    createdAt: '2024-11-28T14:15:00Z',
    updatedAt: '2024-12-12T16:00:00Z'
  },
  {
    id: 'EXP-2025-0164',
    businessId: 'biz-1',
    name: 'Milan Fashion Atelier Sample Shipment',
    productId: 'prod-3',
    productName: 'Veg-Tanned Hide Samples',
    productCategory: 'Raw Tanned Leather',
    hsCode: '4107.92',
    description: 'Organic dyed veg-tan artisan calfskin hides for luxury shoemakers.',
    origin: 'Palghar, Maharashtra (via Mumbai Sahar Air Cargo)',
    destinationCountry: 'Italy',
    destinationCity: 'Genoa',
    destinationPort: 'Port of Genoa / Malpensa Airport',
    quantity: 300,
    unit: 'Sq M',
    estimatedValue: 31000,
    currency: 'USD',
    shippingMode: 'Air',
    buyerName: 'Marco Bellini',
    buyerCompany: 'Milano Conceria SpA',
    buyerContact: 'm.bellini@milanoconceria.it',
    buyerAddress: 'Via Monte Napoleone 8, 20121 Milano, Italy',
    readinessScore: 45,
    riskLevel: 'High',
    status: 'Compliance Review',
    targetShipmentDate: '2025-02-05',
    createdAt: '2024-12-05T09:30:00Z',
    updatedAt: '2024-12-13T10:00:00Z'
  }
];

const INITIAL_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc-master-iec',
    projectId: 'MASTER-BIZ-1',
    type: 'IEC Certificate',
    fileName: 'DGFT_IEC_Certificate_0308019482.pdf',
    fileSize: '340 KB',
    status: 'Verified',
    uploadedBy: 'Vikram Singhania',
    uploadedAt: '2024-08-15T09:00:00Z',
    aiReview: {
      documentType: 'IEC Certificate',
      completenessScore: 100,
      detectedFields: [
        { field: 'IEC Number', value: '0308019482', present: true },
        { field: 'Entity Name', value: 'Palghar Leather Works', present: true },
        { field: 'Issuing Regional Authority', value: 'DGFT Mumbai', present: true },
        { field: 'Status', value: 'Active / Electronic Verified', present: true }
      ],
      missingFields: [],
      issues: [],
      explanation: 'Statutory Import Export Code is active and linked with DGFT ICEGATE gateway.',
      recommendation: 'Valid for all custom sea and air ports across India.',
      analyzedAt: '2024-08-15T09:05:00Z',
      disclaimer: 'Official DGFT Verified Document'
    }
  },
  {
    id: 'doc-master-gst',
    projectId: 'MASTER-BIZ-1',
    type: 'GST Certificate',
    fileName: 'GST_Registration_REG-06_27AABCP1234F1Z8.pdf',
    fileSize: '420 KB',
    status: 'Verified',
    uploadedBy: 'Vikram Singhania',
    uploadedAt: '2024-08-15T09:10:00Z',
    aiReview: {
      documentType: 'GST Certificate',
      completenessScore: 100,
      detectedFields: [
        { field: 'GSTIN', value: '27AABCP1234F1Z8', present: true },
        { field: 'Legal Name', value: 'Palghar Leather Works', present: true },
        { field: 'State', value: 'Maharashtra (27)', present: true },
        { field: 'Taxpayer Type', value: 'Regular / Exporter', present: true }
      ],
      missingFields: [],
      issues: [],
      explanation: 'GST registration certificate verified on GSTN portal for LUT export zero-rated supply.',
      recommendation: 'Ensure Letter of Undertaking (LUT) is renewed annually.',
      analyzedAt: '2024-08-15T09:12:00Z',
      disclaimer: 'Official GSTN Verified'
    }
  },
  {
    id: 'doc-master-udyam',
    projectId: 'MASTER-BIZ-1',
    type: 'Other',
    fileName: 'MSME_Udyam_Registration_MH-24-001981.pdf',
    fileSize: '290 KB',
    status: 'Verified',
    uploadedBy: 'Vikram Singhania',
    uploadedAt: '2024-08-15T09:15:00Z',
    aiReview: {
      documentType: 'MSME Udyam Certificate',
      completenessScore: 100,
      detectedFields: [
        { field: 'Udyam Number', value: 'UDYAM-MH-24-001981', present: true },
        { field: 'Enterprise Class', value: 'Small Enterprise (Manufacturer)', present: true },
        { field: 'NIC Code', value: '1512 - Manufacture of luggage and handbags', present: true }
      ],
      missingFields: [],
      issues: [],
      explanation: 'Udyam certificate enables access to interest equalization schemes and priority export credit.',
      recommendation: 'Active and verified.',
      analyzedAt: '2024-08-15T09:18:00Z',
      disclaimer: 'Ministry of MSME Verified'
    }
  },
  {
    id: 'doc-master-rcmc',
    projectId: 'MASTER-BIZ-1',
    type: 'Other',
    fileName: 'CLE_Council_Leather_Exports_RCMC_2024-2029.pdf',
    fileSize: '310 KB',
    status: 'Verified',
    expiryDate: '2029-03-31',
    uploadedBy: 'Vikram Singhania',
    uploadedAt: '2024-08-20T10:00:00Z',
    aiReview: {
      documentType: 'RCMC Certificate',
      completenessScore: 100,
      detectedFields: [
        { field: 'Council', value: 'Council for Leather Exports (CLE)', present: true },
        { field: 'RCMC Number', value: 'CLE/WR/RCMC/2024/9142', present: true },
        { field: 'Validity', value: '31-Mar-2029', present: true }
      ],
      missingFields: [],
      issues: [],
      explanation: 'Valid RCMC is mandatory for duty remission benefits under RoDTEP / RoSCTL.',
      recommendation: 'Valid for all DGFT FTP 2023 benefit applications.',
      analyzedAt: '2024-08-20T10:05:00Z',
      disclaimer: 'CLE Verified Certificate'
    }
  },
  {
    id: 'doc-1',
    projectId: 'EXP-2025-0142',
    type: 'Commercial Invoice',
    fileName: 'Commercial_Invoice_EXP-0142_v2.pdf',
    fileSize: '342 KB',
    status: 'Verified',
    uploadedBy: 'Vikram Singhania',
    uploadedAt: '2024-12-10T11:00:00Z',
    aiReview: {
      documentType: 'Commercial Invoice',
      completenessScore: 98,
      detectedFields: [
        { field: 'Exporter (Palghar Leather Works)', value: 'Verified', present: true },
        { field: 'Consignee (Hanseatic Goods GmbH)', value: 'Verified', present: true },
        { field: 'Invoice No & Date', value: 'PLW-2425/089 (10 Dec 2024)', present: true },
        { field: 'HS Code (4202.21)', value: 'Matched', present: true },
        { field: 'Incoterms (FOB JNPT)', value: 'Declared', present: true },
        { field: 'Currency & Total Value', value: 'USD 42,500.00', present: true },
        { field: 'Country of Origin Declaration', value: 'India', present: true }
      ],
      missingFields: [],
      issues: [],
      explanation: 'All mandatory foreign trade fields, IEC registration, HS code, and FOB terms are correctly stated.',
      recommendation: 'Invoice is fully compliant for customs Let Export Order (LEO).',
      analyzedAt: '2024-12-10T11:02:15Z',
      disclaimer: 'AI-assisted review — official customs verification may still be required.'
    }
  },
  {
    id: 'doc-2',
    projectId: 'EXP-2025-0142',
    type: 'Packing List',
    fileName: 'Export_Packing_List_Pallets_EXP-0142.pdf',
    fileSize: '280 KB',
    status: 'Verified',
    uploadedBy: 'Vikram Singhania',
    uploadedAt: '2024-12-10T11:15:00Z',
    aiReview: {
      documentType: 'Packing List',
      completenessScore: 95,
      detectedFields: [
        { field: 'Carton Count', value: '25 Master Cartons', present: true },
        { field: 'Net Weight', value: '625.0 kg', present: true },
        { field: 'Gross Weight', value: '685.5 kg', present: true },
        { field: 'Dimensions & CBM', value: '4.8 CBM', present: true },
        { field: 'Pallet Markings (ISPM-15)', value: 'Present', present: true }
      ],
      missingFields: [],
      issues: [],
      explanation: 'Net and gross weights correlate cleanly with Commercial Invoice batch volume.',
      recommendation: 'Ready for shipping line container consolidation.',
      analyzedAt: '2024-12-10T11:16:00Z',
      disclaimer: 'AI-assisted review — official verification may still be required.'
    }
  },
  {
    id: 'doc-3',
    projectId: 'EXP-2025-0142',
    type: 'Product Test Certificate (REACH / RoHS / FDA)',
    fileName: 'SGS_Chemical_Test_Report_Azo_ChromiumVI.pdf',
    fileSize: '1.2 MB',
    status: 'Verified',
    expiryDate: '2025-11-30',
    uploadedBy: 'Ananya Sharma',
    uploadedAt: '2024-12-08T15:20:00Z',
    aiReview: {
      documentType: 'Laboratory Compliance Certificate',
      completenessScore: 100,
      detectedFields: [
        { field: 'Testing Authority', value: 'SGS India Pvt Ltd', present: true },
        { field: 'Test Standard', value: 'EU REACH Regulation (EC) No 1907/2006', present: true },
        { field: 'Chromium VI Content', value: '< 3 mg/kg (Pass)', present: true },
        { field: 'Aromatic Amines (Azo Dyes)', value: 'Not Detected (Pass)', present: true }
      ],
      missingFields: [],
      issues: [],
      explanation: 'Laboratory report certifies non-detection of banned amines and Chromium VI within EU permissible limits.',
      recommendation: 'Certificate is active and valid for all European ports of entry.',
      analyzedAt: '2024-12-08T15:21:40Z',
      disclaimer: 'AI-assisted review — statutory EU customs verification may still be required.'
    }
  },
  {
    id: 'doc-4',
    projectId: 'EXP-2025-0142',
    type: 'Bill of Lading / Airway Bill',
    fileName: 'CMA_CGM_Ocean_Bill_of_Lading_MAEU928419.pdf',
    fileSize: '410 KB',
    status: 'Verified',
    uploadedBy: 'Arjun Mehta',
    uploadedAt: '2024-12-12T16:10:00Z'
  },
  {
    id: 'doc-5',
    projectId: 'EXP-2025-0142',
    type: 'Marine Cargo Insurance Policy',
    fileName: 'New_India_Assurance_Marine_Open_Cover_9142.pdf',
    fileSize: '520 KB',
    status: 'Verified',
    expiryDate: '2025-03-31',
    uploadedBy: 'Vikram Singhania',
    uploadedAt: '2024-12-11T12:00:00Z'
  },
  {
    id: 'doc-6',
    projectId: 'EXP-2025-0164',
    type: 'Product Test Certificate (REACH / RoHS / FDA)',
    fileName: 'Draft_Tannery_Analysis_Preliminary.pdf',
    fileSize: '180 KB',
    status: 'Needs Correction',
    uploadedBy: 'Vikram Singhania',
    uploadedAt: '2024-12-07T14:00:00Z',
    aiReview: {
      documentType: 'In-House Laboratory Test Note',
      completenessScore: 42,
      detectedFields: [
        { field: 'Tannery Batch ID', value: 'T-2024-88', present: true },
        { field: 'Formaldehyde Content', value: 'Reported', present: true },
        { field: 'NABL / ISO 17025 Accredited Stamp', value: 'Missing', present: false },
        { field: 'EU REACH SVHC Declaration', value: 'Incomplete', present: false }
      ],
      missingFields: ['NABL Accredited Testing Stamp', 'Chromium VI EN ISO 17075-1 Test', 'Lead and Cadmium Assay'],
      issues: [
        { severity: 'high', message: 'In-house test sheet is not acceptable by Italian customs without NABL/ILAC laboratory certification.' },
        { severity: 'high', message: 'Missing Chromium VI extraction under EN ISO 17075 protocol.' }
      ],
      explanation: 'Italian customs will reject raw hide imports without an accredited third-party lab test confirming REACH SVHC compliance.',
      recommendation: 'Resubmit sample to CLRI (Central Leather Research Institute) or SGS/Intertek for formal NABL test report.',
      analyzedAt: '2024-12-07T14:05:00Z',
      disclaimer: 'AI-assisted review — official verification may still be required.'
    },
    reviewerComments: 'Ananya (Consultant): In-house certificate will cause goods to be held at Genoa. NABL certificate mandatory.'
  }
];

const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 'sh-1',
    projectId: 'EXP-2025-0142',
    trackingNumber: '#EXP-2025-0142',
    blNumber: 'MAEU928419',
    vesselName: 'Hamburg Express (CMA CGM)',
    carrierName: 'CMA CGM Line / JNPT Freight Forwarders',
    carrierContact: 'Arjun Mehta (CHA License: 11/2014)',
    carrierPhone: '+91 98332 99014',
    origin: 'JNPT (Mumbai, Nhava Sheva)',
    destination: 'Port of Hamburg, Germany',
    shippingMode: 'Sea',
    status: 'In Transit',
    packageCount: 25,
    grossWeightKg: 685.5,
    volumeCbm: 4.8,
    estimatedFreightCost: 2850,
    departureDate: '2024-12-14',
    estimatedArrivalDate: '2024-12-28',
    events: [
      {
        id: 'ev-1',
        title: 'Export Documentation Approved',
        description: 'Commercial Invoice, Packing list, and COO verified by CHA.',
        location: 'Palghar & Mumbai Regional DGFT',
        timestamp: '11 Dec 2024 • 10:23 AM',
        completed: true
      },
      {
        id: 'ev-2',
        title: 'Customs Cleared at JNPT',
        description: 'Shipping bill assessment completed; Let Export Order (LEO) granted.',
        location: 'JNPT Nhava Sheva Port, Terminal 4',
        timestamp: '12 Dec 2024 • 02:45 PM',
        completed: true
      },
      {
        id: 'ev-3',
        title: 'In Transit — Arabian Sea',
        description: 'Vessel Hamburg Express departed JNPT; en route via Red Sea / Cape route.',
        location: 'Arabian Sea (Coordinates: 18.9°N, 71.4°E)',
        timestamp: '14 Dec 2024 • 11:30 AM',
        completed: true,
        current: true
      },
      {
        id: 'ev-4',
        title: 'Expected Port of Hamburg',
        description: 'Customs inward clearance and container offload at Altenwerder.',
        location: 'Port of Hamburg, Germany',
        timestamp: '28 Dec 2024 • --:--',
        completed: false
      }
    ]
  },
  {
    id: 'sh-2',
    projectId: 'EXP-2025-0158',
    trackingNumber: '#EXP-2025-0158',
    carrierName: 'Maersk Logistics India',
    carrierContact: 'Vikram Logistic Desk',
    origin: 'Palghar (via JNPT)',
    destination: 'London Gateway, UK',
    shippingMode: 'Sea',
    status: 'Booking Confirmed',
    packageCount: 40,
    grossWeightKg: 520,
    volumeCbm: 3.6,
    estimatedFreightCost: 2200,
    departureDate: '2025-01-05',
    estimatedArrivalDate: '2025-01-24',
    events: [
      {
        id: 'ev-201',
        title: 'Order Created & Booking Locked',
        description: 'Container slot reserved on Maersk Gibraltar.',
        location: 'JNPT Freight Desk',
        timestamp: '10 Dec 2024 • 04:00 PM',
        completed: true,
        current: true
      }
    ]
  }
];

const INITIAL_RULES: ExportRule[] = [
  {
    id: 'rule-1',
    productCategory: 'Leather & Finished Goods',
    destinationCountry: 'Germany',
    requirementType: 'Compliance',
    title: 'EU REACH Chemical Compliance (Chromium VI & Azo Dyes)',
    description: 'Leather articles must not release aromatic amines above 30 mg/kg or Chromium VI above 3 mg/kg according to Regulation (EC) No 1907/2006.',
    priority: 'High',
    source: 'EU Official Journal Regulation 1907/2006 (Annex XVII)',
    active: true
  },
  {
    id: 'rule-2',
    productCategory: 'Leather & Finished Goods',
    destinationCountry: 'Germany',
    requirementType: 'Labelling',
    title: 'German Textile & Leather Labelling Act (Textilkennzeichnungsgesetz)',
    description: 'Requires unequivocal disclosure of animal origin: "Contains non-textile parts of animal origin" in German language.',
    priority: 'High',
    source: 'Federal Ministry for Economic Affairs, Germany',
    active: true
  },
  {
    id: 'rule-3',
    productCategory: 'Leather & Finished Goods',
    destinationCountry: 'Germany',
    requirementType: 'Packaging',
    title: 'German Packaging Act (VerpackG / LUCID Registry)',
    description: 'Importers and manufacturers must register packaging materials with LUCID register and ensure recyclable carton markings.',
    priority: 'Medium',
    source: 'Zentrale Stelle Verpackungsregister (ZSVR)',
    active: true
  },
  {
    id: 'rule-4',
    productCategory: 'All Products',
    destinationCountry: 'All Countries',
    requirementType: 'Packaging',
    title: 'ISPM-15 Heat-Treated Wooden Pallets Compliance',
    description: 'Solid wood packaging must be heat-treated (HT to 56°C for 30 min) and debarked with IPPC wheat-ear stamp.',
    priority: 'High',
    source: 'International Plant Protection Convention (IPPC)',
    active: true
  },
  {
    id: 'rule-5',
    productCategory: 'Raw Tanned Leather',
    destinationCountry: 'Italy',
    requirementType: 'Compliance',
    title: 'Italian Sanitary & CITES Exemption Verification',
    description: 'Raw/semi-finished hides must have veterinary health certificate and CITES non-endangered declaration.',
    priority: 'High',
    source: 'Ministry of Health, Rome',
    active: true
  },
  {
    id: 'rule-6',
    productCategory: 'Agro & Food Products',
    destinationCountry: 'United States',
    requirementType: 'Compliance',
    title: 'US FDA Food Facility Registration & Prior Notice',
    description: 'Facility must have valid FDA Registration number and file electronic Prior Notice before vessel arrival.',
    priority: 'High',
    source: 'US FDA Food Safety Modernization Act (FSMA)',
    active: true
  },
  {
    id: 'rule-7',
    productCategory: 'All Products',
    destinationCountry: 'All Countries',
    requirementType: 'Insurance',
    title: 'Institute Cargo Clauses (A) Marine Insurance',
    description: 'Mandatory CIF / CIP comprehensive cargo coverage for cross-border maritime transit.',
    priority: 'High',
    source: 'Institute of London Underwriters / IRDAI India',
    active: true
  }
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'usr-1',
    projectId: 'EXP-2025-0142',
    type: 'info',
    title: 'Vessel in Transit: Arabian Sea',
    message: 'Hamburg Express passed coordinates 18.9°N, 71.4°E. Estimated Hamburg ETA remains 28 Dec 2024.',
    read: false,
    createdAt: '2024-12-14T11:30:00Z'
  },
  {
    id: 'notif-2',
    userId: 'usr-1',
    projectId: 'EXP-2025-0164',
    type: 'alert',
    title: 'High Risk Alert: Italy Sample Shipment',
    message: 'In-house test sheet flagged for missing NABL/ILAC accreditation. Action required to prevent customs detention in Genoa.',
    read: false,
    createdAt: '2024-12-13T10:05:00Z'
  },
  {
    id: 'notif-3',
    userId: 'usr-1',
    projectId: 'EXP-2025-0158',
    type: 'success',
    title: 'UK Batch Readiness Score: 94/100',
    message: 'All buyer documentation and packaging checks completed for British Retail Consortium.',
    read: true,
    createdAt: '2024-12-12T16:00:00Z'
  }
];

const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log-1',
    projectId: 'EXP-2025-0142',
    userId: 'usr-1',
    userName: 'Vikram Singhania',
    action: 'Project Created',
    description: 'Export Project "EU Autumn Batch: Premium Handbags" created with destination Germany.',
    timestamp: '2024-11-20T10:00:00Z'
  },
  {
    id: 'log-2',
    projectId: 'EXP-2025-0142',
    userId: 'usr-1',
    userName: 'Vikram Singhania',
    action: 'Document Uploaded',
    description: 'Uploaded Commercial_Invoice_EXP-0142_v2.pdf for AI analysis.',
    timestamp: '2024-12-10T11:00:00Z'
  },
  {
    id: 'log-3',
    projectId: 'EXP-2025-0142',
    userId: 'usr-2',
    userName: 'Ananya Sharma',
    action: 'Document Verified',
    description: 'Verified Commercial Invoice and SGS REACH chemical test certificate.',
    timestamp: '2024-12-10T14:30:00Z'
  },
  {
    id: 'log-4',
    projectId: 'EXP-2025-0142',
    userId: 'usr-3',
    userName: 'Arjun Mehta',
    action: 'Customs Cleared & LEO Granted',
    description: 'Shipping bill filed on ICEGATE; customs examination passed and Let Export Order generated.',
    timestamp: '2024-12-12T14:45:00Z'
  },
  {
    id: 'log-5',
    projectId: 'EXP-2025-0142',
    userId: 'usr-3',
    userName: 'Arjun Mehta',
    action: 'Vessel Departure',
    description: 'Container loaded onto Hamburg Express (CMA CGM) at JNPT Nhava Sheva.',
    timestamp: '2024-12-14T11:30:00Z'
  }
];

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Error reading database file, initializing with seed data:', e);
    }

    const initialData: DatabaseSchema = {
      users: INITIAL_USERS,
      businesses: [INITIAL_BUSINESS],
      projects: INITIAL_PROJECTS,
      requirements: [],
      documents: INITIAL_DOCUMENTS,
      shipments: INITIAL_SHIPMENTS,
      rules: INITIAL_RULES,
      notifications: INITIAL_NOTIFICATIONS,
      auditLogs: INITIAL_AUDIT_LOGS
    };

    this.saveData(initialData);
    return initialData;
  }

  private saveData(data: DatabaseSchema) {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file:', e);
    }
  }

  // Users
  getUsers() { return this.data.users; }
  getUserById(id: string) { return this.data.users.find(u => u.id === id); }
  getUserByEmail(email: string) { return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  createUser(user: User) {
    this.data.users.push(user);
    this.saveData(this.data);
    return user;
  }

  // Business
  getBusiness(id: string = 'biz-1') {
    return this.data.businesses.find(b => b.id === id) || this.data.businesses[0];
  }
  updateBusiness(id: string, updates: Partial<Business>) {
    const idx = this.data.businesses.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.data.businesses[idx] = { 
        ...this.data.businesses[idx], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      this.saveData(this.data);
      return this.data.businesses[idx];
    }
    return null;
  }

  // Projects
  getProjects(businessId: string = 'biz-1') {
    return this.data.projects.filter(p => p.businessId === businessId);
  }
  getAllProjects() {
    return this.data.projects;
  }
  getProjectById(id: string) {
    return this.data.projects.find(p => p.id === id);
  }
  createProject(project: ExportProject) {
    this.data.projects.unshift(project);
    this.addAuditLog(project.id, 'usr-1', 'Vikram Singhania', 'Project Created', `Started new export project "${project.name}" for ${project.destinationCountry}.`);
    this.saveData(this.data);
    return project;
  }
  updateProject(id: string, updates: Partial<ExportProject>) {
    const idx = this.data.projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.projects[idx] = { 
        ...this.data.projects[idx], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      this.saveData(this.data);
      return this.data.projects[idx];
    }
    return null;
  }
  deleteProject(id: string) {
    this.data.projects = this.data.projects.filter(p => p.id !== id);
    this.saveData(this.data);
    return true;
  }

  // Documents
  getDocuments(projectId?: string) {
    if (projectId) {
      return this.data.documents.filter(d => d.projectId === projectId);
    }
    return this.data.documents;
  }
  getMasterDocuments(businessId: string = 'biz-1') {
    return this.data.documents.filter(d => d.projectId === `MASTER-${businessId.toUpperCase()}` || d.projectId === 'MASTER-BIZ-1');
  }
  syncMasterDocumentsToProject(projectId: string, businessId: string = 'biz-1') {
    const masterDocs = this.getMasterDocuments(businessId);
    const existingForProject = this.getDocuments(projectId);
    const added: DocumentRecord[] = [];

    for (const mDoc of masterDocs) {
      const alreadyHas = existingForProject.some(e => e.type === mDoc.type && e.fileName === mDoc.fileName);
      if (!alreadyHas) {
        const copy: DocumentRecord = {
          ...mDoc,
          id: `doc-sync-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          projectId: projectId,
          uploadedAt: new Date().toISOString()
        };
        this.data.documents.push(copy);
        added.push(copy);
      }
    }
    if (added.length > 0) {
      this.saveData(this.data);
    }
    return this.getDocuments(projectId);
  }
  getDocumentById(id: string) {
    return this.data.documents.find(d => d.id === id);
  }
  saveDocument(doc: DocumentRecord) {
    const idx = this.data.documents.findIndex(d => d.id === doc.id);
    if (idx !== -1) {
      this.data.documents[idx] = doc;
    } else {
      this.data.documents.push(doc);
    }
    this.saveData(this.data);
    return doc;
  }
  deleteDocument(id: string) {
    this.data.documents = this.data.documents.filter(d => d.id !== id);
    this.saveData(this.data);
    return true;
  }

  // Shipments
  getShipments(projectId?: string) {
    if (projectId) {
      return this.data.shipments.filter(s => s.projectId === projectId);
    }
    return this.data.shipments;
  }
  getShipmentById(id: string) {
    return this.data.shipments.find(s => s.id === id || s.trackingNumber === id);
  }
  saveShipment(shipment: Shipment) {
    const idx = this.data.shipments.findIndex(s => s.id === shipment.id);
    if (idx !== -1) {
      this.data.shipments[idx] = shipment;
    } else {
      this.data.shipments.push(shipment);
    }
    this.saveData(this.data);
    return shipment;
  }

  // Rules
  getRules() { return this.data.rules; }
  addRule(rule: ExportRule) {
    this.data.rules.push(rule);
    this.saveData(this.data);
    return rule;
  }
  updateRule(id: string, updates: Partial<ExportRule>) {
    const idx = this.data.rules.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.data.rules[idx] = { ...this.data.rules[idx], ...updates };
      this.saveData(this.data);
      return this.data.rules[idx];
    }
    return null;
  }
  deleteRule(id: string) {
    this.data.rules = this.data.rules.filter(r => r.id !== id);
    this.saveData(this.data);
    return true;
  }

  // Notifications
  getNotifications(userId: string = 'usr-1') {
    return this.data.notifications.filter(n => n.userId === userId);
  }
  markNotificationRead(id: string) {
    const n = this.data.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      this.saveData(this.data);
    }
    return n;
  }

  // Audit Logs
  getAuditLogs(projectId?: string) {
    if (projectId) {
      return this.data.auditLogs.filter(a => a.projectId === projectId);
    }
    return this.data.auditLogs;
  }
  addAuditLog(projectId: string, userId: string, userName: string, action: string, description: string) {
    const log: AuditLogItem = {
      id: 'log-' + Date.now(),
      projectId,
      userId,
      userName,
      action,
      description,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(log);
    this.saveData(this.data);
    return log;
  }

  // Roadmap Overrides
  getRoadmapOverrides(projectId: string): Record<number, { status: RequirementStatus; nextAction?: string }> {
    if (!this.data.roadmapOverrides) this.data.roadmapOverrides = {};
    return this.data.roadmapOverrides[projectId] || {};
  }

  setRoadmapStepStatus(projectId: string, stepId: number, status: RequirementStatus, nextAction?: string) {
    if (!this.data.roadmapOverrides) this.data.roadmapOverrides = {};
    if (!this.data.roadmapOverrides[projectId]) this.data.roadmapOverrides[projectId] = {};
    
    this.data.roadmapOverrides[projectId][stepId] = {
      status,
      nextAction: nextAction || (status === 'Completed' ? 'Milestone Completed & Verified' : 'In Progress')
    };

    this.saveData(this.data);
    this.addAuditLog(
      projectId,
      'usr-1',
      'Vikram Singhania',
      'Roadmap Step Updated',
      `Milestone Step ${stepId} marked as "${status}".`
    );
  }

  applyRoadmapOverrides(projectId: string, roadmap: RoadmapStep[]): RoadmapStep[] {
    const overrides = this.getRoadmapOverrides(projectId);
    if (!overrides || Object.keys(overrides).length === 0) {
      return roadmap;
    }
    return roadmap.map(step => {
      if (overrides[step.id]) {
        return {
          ...step,
          status: overrides[step.id].status,
          nextAction: overrides[step.id].nextAction || step.nextAction
        };
      }
      return step;
    });
  }
}

export const db = new DatabaseService();
