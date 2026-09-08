import { 
  ExportProject, 
  Business, 
  DocumentRecord, 
  Shipment, 
  CostBreakdown, 
  TimelineBreakdown, 
  User, 
  ExportRule,
  NotificationItem,
  AuditLogItem,
  RequirementStatus
} from '../types';
import { ReadinessReport } from '../../server/services/readinessEngine';
import { RoadmapStep, RiskFactor } from '../../server/services/rulesEngine';

export interface ProjectDetailResponse {
  project: ExportProject;
  business: Business;
  documents: DocumentRecord[];
  shipment: Shipment | null;
  readiness: ReadinessReport;
  roadmap: RoadmapStep[];
  risks: RiskFactor[];
  costEstimate: CostBreakdown;
  timelineEstimate: TimelineBreakdown;
}

export const apiClient = {
  // Auth
  async login(email: string): Promise<{ user: User; business: Business }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
    return res.json();
  },

  async register(data: any): Promise<{ user: User; business: Business }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  async getCurrentUser(email?: string): Promise<{ user: User; business: Business }> {
    const query = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await fetch(`/api/auth/me${query}`);
    return res.json();
  },

  // Business
  async updateBusiness(data: Partial<Business>): Promise<Business> {
    const res = await fetch('/api/business', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Projects
  async getProjects(): Promise<ExportProject[]> {
    const res = await fetch('/api/projects');
    return res.json();
  },

  async getProjectDetail(id: string): Promise<ProjectDetailResponse> {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) throw new Error('Project not found');
    return res.json();
  },

  async createProject(data: Partial<ExportProject>): Promise<ExportProject> {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateProject(id: string, data: Partial<ExportProject>): Promise<ExportProject> {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteProject(id: string): Promise<boolean> {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  async updateRoadmapStep(projectId: string, stepId: number, status: RequirementStatus): Promise<{
    success: boolean;
    stepId: number;
    status: RequirementStatus;
    step?: RoadmapStep;
    roadmap: RoadmapStep[];
  }> {
    const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/roadmap/${stepId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update roadmap step');
    return res.json();
  },

  // Documents
  async uploadDocument(projectId: string, data: {
    type: string;
    fileName: string;
    fileSize?: string;
    base64Data?: string;
    mimeType?: string;
    simulateAiFailure?: boolean;
  }): Promise<DocumentRecord> {
    const res = await fetch(`/api/projects/${projectId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async createManualDocument(projectId: string, data: {
    type: string;
    fileName?: string;
    referenceNumber?: string;
    issuingAuthority?: string;
    declaredHsCode?: string;
    declaredValue?: string;
    expiryDate?: string;
    status?: 'Verified' | 'Needs Correction' | 'Under Review';
    checklist?: string[];
    comments?: string;
  }): Promise<DocumentRecord> {
    const res = await fetch(`/api/projects/${projectId}/documents/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateDocument(id: string, data: Partial<DocumentRecord>): Promise<DocumentRecord> {
    const res = await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteDocument(id: string): Promise<boolean> {
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  async syncMasterDocuments(projectId: string): Promise<{ success: boolean; count: number; documents: DocumentRecord[]; readinessScore: number }> {
    const res = await fetch(`/api/projects/${projectId}/documents/sync-master`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to sync master documents');
    return res.json();
  },

  async linkDocumentsByRef(projectId: string, referenceNumber?: string, searchAll?: boolean): Promise<{ success: boolean; linkedCount: number; documents: DocumentRecord[]; readinessScore: number }> {
    const res = await fetch(`/api/projects/${projectId}/documents/link-by-ref`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referenceNumber, searchAll })
    });
    if (!res.ok) throw new Error('Failed to link documents');
    return res.json();
  },

  // Logistics Provider Service
  async trackShipment(query: string): Promise<Shipment> {
    const res = await fetch(`/api/logistics/tracking/${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Shipment not found');
    return res.json();
  },

  async getLogisticsShipments(projectId?: string): Promise<Shipment[]> {
    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    const res = await fetch(`/api/logistics/shipments${query}`);
    return res.json();
  },

  async simulateLogisticsMilestone(shipmentId: string): Promise<{ shipment: Shipment; newEvent: any }> {
    const res = await fetch('/api/logistics/simulate-milestone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shipmentId })
    });
    if (!res.ok) throw new Error('Failed to simulate logistics event');
    return res.json();
  },

  async sendLogisticsMessage(shipmentId: string, sender: string, message: string): Promise<{ sender: string; text: string; time: string; reply?: string }> {
    const res = await fetch('/api/logistics/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shipmentId, sender, message })
    });
    return res.json();
  },

  async updateLogisticsEta(shipmentId: string, newEta: string): Promise<Shipment> {
    const res = await fetch('/api/logistics/eta', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shipmentId, newEta })
    });
    return res.json();
  },

  async updateLogisticsStatus(shipmentId: string, status: Shipment['status'], comment?: string): Promise<Shipment> {
    const res = await fetch('/api/logistics/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shipmentId, status, comment })
    });
    return res.json();
  },

  // Estimators
  async getCostEstimate(projectId: string, input: any): Promise<CostBreakdown> {
    const res = await fetch(`/api/projects/${projectId}/cost-estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    return res.json();
  },

  async getTimelineEstimate(projectId: string, input: any): Promise<TimelineBreakdown> {
    const res = await fetch(`/api/projects/${projectId}/timeline-estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    return res.json();
  },

  // Shipments
  async updateShipment(id: string, data: Partial<Shipment>): Promise<Shipment> {
    const res = await fetch(`/api/shipments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // AI Copilot
  async askCopilot(question: string, projectId?: string, language?: string): Promise<{ answer: string; suggestedQuestions: string[] }> {
    const res = await fetch('/api/ai/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, projectId, language })
    });
    return res.json();
  },

  // Notifications & Audit Logs
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetch('/api/notifications');
    return res.json();
  },

  async markNotificationRead(id: string): Promise<NotificationItem> {
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
    return res.json();
  },

  async getAuditLogs(projectId?: string): Promise<AuditLogItem[]> {
    const query = projectId ? `?projectId=${projectId}` : '';
    const res = await fetch(`/api/audit-logs${query}`);
    return res.json();
  },

  // Admin Rules
  async getAdminRules(): Promise<ExportRule[]> {
    const res = await fetch('/api/admin/rules');
    return res.json();
  },

  async addAdminRule(rule: Partial<ExportRule>): Promise<ExportRule> {
    const res = await fetch('/api/admin/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    });
    return res.json();
  },

  async deleteAdminRule(id: string): Promise<boolean> {
    const res = await fetch(`/api/admin/rules/${id}`, { method: 'DELETE' });
    return res.ok;
  }
};
