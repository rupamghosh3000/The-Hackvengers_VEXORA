export type UserRole = 'msme' | 'consultant' | 'logistics' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessId?: string;
  language: 'en' | 'hi' | 'mr';
  avatar?: string;
  title?: string;
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  gstNumber?: string;
  gstStatus: 'Verified' | 'Pending' | 'Missing';
  iecNumber?: string;
  iecStatus: 'Verified' | 'Pending' | 'Missing';
  udyamNumber?: string;
  businessType: 'Manufacturer Exporter' | 'Merchant Exporter' | 'Service Provider';
  products: string[];
  yearsInOperation: number;
  exportExperience: 'First-time Exporter' | 'Occasional Exporter' | 'Regular Exporter';
  createdAt: string;
  updatedAt: string;
}

export type ShippingMode = 'Sea' | 'Air' | 'Road' | 'Courier';

export interface ExportProject {
  id: string;
  businessId: string;
  name: string;
  productId: string;
  productName: string;
  productCategory: string;
  hsCode: string;
  description: string;
  origin: string;
  destinationCountry: string;
  destinationCity: string;
  destinationPort: string;
  quantity: number;
  unit: string;
  estimatedValue: number;
  currency: 'INR' | 'USD' | 'EUR';
  shippingMode: ShippingMode;
  buyerName: string;
  buyerCompany: string;
  buyerContact?: string;
  buyerAddress?: string;
  readinessScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Draft' | 'In Preparation' | 'Compliance Review' | 'Ready to Export' | 'In Transit' | 'Delivered';
  targetShipmentDate: string;
  createdAt: string;
  updatedAt: string;
}

export type RequirementType = 'Business' | 'Document' | 'Compliance' | 'Packaging' | 'Labelling' | 'Buyer' | 'Logistics' | 'Customs' | 'Insurance';
export type RequirementStatus = 'Not Started' | 'In Progress' | 'Under Review' | 'Completed' | 'Blocked';
export type Priority = 'High' | 'Medium' | 'Low';

export interface Requirement {
  id: string;
  projectId: string;
  type: RequirementType;
  title: string;
  description: string;
  priority: Priority;
  status: RequirementStatus;
  source: string;
  dueDate?: string;
  assignedTo?: string;
  completedAt?: string;
}

export type DocumentType = 
  | 'IEC Certificate'
  | 'GST Certificate'
  | 'Commercial Invoice'
  | 'Packing List'
  | 'Purchase Order'
  | 'Certificate of Origin (COO)'
  | 'Product Test Certificate (REACH / RoHS / FDA)'
  | 'Phytosanitary / Quality Certificate'
  | 'Bill of Lading / Airway Bill'
  | 'Shipping Bill / ICEGATE LEO'
  | 'Marine Cargo Insurance Policy'
  | 'Other';

export type DocumentStatus = 'Missing' | 'Uploaded' | 'Under Review' | 'Verified' | 'Needs Correction' | 'Expired';

export interface AIDocumentAnalysis {
  documentType: string;
  completenessScore: number;
  detectedFields: { field: string; value?: string; present: boolean }[];
  missingFields: string[];
  issues: { severity: 'low' | 'medium' | 'high'; message: string }[];
  explanation: string;
  recommendation: string;
  analyzedAt: string;
  disclaimer: string;
  aiStatus?: 'success' | 'unavailable' | 'manual_entry';
  fallbackReason?: string;
  isManualEntry?: boolean;
}

export interface DocumentRecord {
  id: string;
  projectId: string;
  type: DocumentType;
  fileName: string;
  fileSize?: string;
  fileUrl?: string;
  status: DocumentStatus;
  expiryDate?: string;
  referenceNumber?: string;
  issuingAuthority?: string;
  declaredHsCode?: string;
  declaredValue?: string;
  uploadedBy: string;
  uploadedAt: string;
  aiReview?: AIDocumentAnalysis;
  reviewerComments?: string;
  verifiedAt?: string;
}

export interface RoadmapStep {
  id: number;
  stepNumber: number;
  title: string;
  category: RequirementType;
  description: string;
  status: RequirementStatus;
  priority: Priority;
  estimatedDuration: string;
  estimatedCost?: string;
  requiredDocuments: string[];
  responsibleParty: string;
  nextAction: string;
}

export interface CostBreakdown {
  productValue: number;
  packagingCost: number;
  freightCost: number;
  insuranceCost: number;
  documentationCost: number;
  customsCharges: number;
  portHandlingCharges: number;
  totalEstimatedCost: number;
  currency: 'INR' | 'USD' | 'EUR';
}

export interface TimelineBreakdown {
  documentationDays: number;
  certificationDays: number;
  packagingDays: number;
  logisticsPreparationDays: number;
  customsDays: number;
  insuranceDays: number;
  shippingTransitDays: number;
  totalPreparationDays: number;
  totalEstimatedDays: number;
  targetDate: string;
  estimatedDeliveryDate: string;
}

export interface RiskFactor {
  id: string;
  category: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  impact: string;
  recommendedAction: string;
  resolved: boolean;
}

export interface TrackingEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  completed: boolean;
  current?: boolean;
}

export interface Shipment {
  id: string;
  projectId: string;
  trackingNumber: string;
  blNumber?: string;
  containerNumber?: string;
  sealNumber?: string;
  icegateShippingBill?: string;
  vesselName?: string;
  vesselImo?: string;
  carrierName: string;
  carrierContact?: string;
  carrierPhone?: string;
  origin: string;
  destination: string;
  shippingMode: ShippingMode;
  status: 'Booking Confirmed' | 'Customs Cleared' | 'In Transit' | 'Arrived at Destination' | 'Delivered';
  currentLocation?: string;
  coordinates?: string;
  speedKnots?: number;
  packageCount: number;
  grossWeightKg: number;
  volumeCbm: number;
  estimatedFreightCost: number;
  departureDate: string;
  estimatedArrivalDate: string;
  events: TrackingEvent[];
}

export interface ExportRule {
  id: string;
  productCategory: string;
  destinationCountry: string;
  requirementType: RequirementType;
  title: string;
  description: string;
  priority: Priority;
  source: string;
  active: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  projectId?: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  timestamp: string;
}
