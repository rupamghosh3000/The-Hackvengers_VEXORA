import { Shipment, TrackingEvent } from '../../src/types';
import { db } from '../db';

/**
 * Standard interface for Logistics Providers (Mock or Real Carrier/Aggregator API).
 * Enables seamless swapping with providers like Project44, Freightos, Flexport, or Port Community Systems.
 */
export interface LogisticsProvider {
  providerName: string;
  getTracking(query: string): Promise<Shipment | null>;
  getShipmentById(id: string): Promise<Shipment | null>;
  listShipments(projectId?: string): Promise<Shipment[]>;
  updateShipmentStatus(shipmentId: string, status: Shipment['status'], comment?: string): Promise<Shipment | null>;
  updateShipmentEta(shipmentId: string, newEta: string): Promise<Shipment | null>;
  simulateNextMilestone(shipmentId: string): Promise<{ shipment: Shipment; newEvent: TrackingEvent } | null>;
  sendChaMessage(shipmentId: string, sender: string, message: string): Promise<{ sender: string; text: string; time: string; reply?: string }>;
}

export class MockLogisticsProvider implements LogisticsProvider {
  public providerName = 'ExportPilot Mock Maritime & Customs Logistics Provider (JNPT Nhava Sheva)';

  // Potential milestone steps to simulate transit progression
  private transitMilestonePipeline: Omit<TrackingEvent, 'id' | 'timestamp' | 'completed' | 'current'>[] = [
    {
      title: 'Bab-el-Mandeb Strait Escort Corridor',
      description: 'Naval international escort convoy checkpoint passed; heading North through Red Sea.',
      location: 'Southern Red Sea (Coordinates: 12.58°N, 43.33°E)'
    },
    {
      title: 'Suez Canal Transit Convoy Entry',
      description: 'Vessel entered northbound convoy lane under Suez Canal Authority pilotage.',
      location: 'Suez Canal (Coordinates: 29.97°N, 32.55°E)'
    },
    {
      title: 'Port Said Checkpoint — Mediterranean Entrance',
      description: 'Canal transit completed; entering Eastern Mediterranean sea corridor.',
      location: 'Port Said Maritime Zone (Coordinates: 31.26°N, 32.30°E)'
    },
    {
      title: 'Strait of Gibraltar Passage',
      description: 'Vessel navigated Gibraltar waters; continuing northeast toward English Channel.',
      location: 'Strait of Gibraltar (Coordinates: 35.98°N, 5.50°W)'
    },
    {
      title: 'Berthing at Port of Hamburg (Waltershof)',
      description: 'Vessel alongside Berth 3 at Hamburger Hafen; container offloading initiated.',
      location: 'Port of Hamburg (DEHAM), Germany'
    },
    {
      title: 'Customs Clear & Outward Gate Passed',
      description: 'German customs clearance verified; released to European inland road freight.',
      location: 'Hamburg Logistics Hub 4, Germany'
    }
  ];

  constructor() {
    this.seedInitialRealisticShipments();
  }

  private seedInitialRealisticShipments() {
    // Ensure the primary demo shipment has realistic details
    const existing = db.getShipmentById('sh-1');
    if (existing) {
      const enriched: Shipment = {
        ...existing,
        trackingNumber: 'EXP-INNSA-HAM-2024-884',
        blNumber: 'MAEU928419',
        containerNumber: 'CMAU-782194-0',
        sealNumber: 'IN-JNPT-CUSTOMS-88912',
        icegateShippingBill: '8839102/2024 (LEO Granted)',
        vesselName: 'Hamburg Express (IMO 9461893)',
        vesselImo: '9461893',
        carrierName: 'CMA CGM Line / Hapag-Lloyd Alliance',
        carrierContact: 'Arjun Mehta (Port CHA License: 11/2014)',
        carrierPhone: '+91 98332 99014',
        currentLocation: 'Arabian Sea Maritime Corridor',
        coordinates: '18.924°N, 71.412°E',
        speedKnots: 16.8,
        packageCount: 120,
        grossWeightKg: 3450,
        volumeCbm: 28.5,
        estimatedFreightCost: 2850,
        departureDate: '2024-12-14',
        estimatedArrivalDate: '2024-12-28'
      };
      db.saveShipment(enriched);
    }
  }

  public async getTracking(query: string): Promise<Shipment | null> {
    if (!query) return null;
    const clean = query.trim().toLowerCase().replace('#', '');
    const shipments = db.getShipments();

    const found = shipments.find(s => 
      s.id.toLowerCase() === clean ||
      s.trackingNumber.toLowerCase().includes(clean) ||
      s.blNumber?.toLowerCase().includes(clean) ||
      s.containerNumber?.toLowerCase().includes(clean) ||
      s.projectId.toLowerCase().includes(clean)
    );

    return found || null;
  }

  public async getShipmentById(id: string): Promise<Shipment | null> {
    return db.getShipmentById(id) || null;
  }

  public async listShipments(projectId?: string): Promise<Shipment[]> {
    return db.getShipments(projectId);
  }

  public async updateShipmentStatus(shipmentId: string, status: Shipment['status'], comment?: string): Promise<Shipment | null> {
    const shipment = db.getShipmentById(shipmentId);
    if (!shipment) return null;

    shipment.status = status;
    if (comment) {
      shipment.events.push({
        id: 'ev-' + Date.now(),
        title: `Status: ${status}`,
        description: comment,
        location: shipment.currentLocation || shipment.origin,
        timestamp: this.formatCurrentTimestamp(),
        completed: true,
        current: true
      });
    }

    db.saveShipment(shipment);
    db.addAuditLog(
      shipment.projectId,
      'usr-3',
      'Arjun Mehta (Logistics CHA)',
      'Shipment Status Updated',
      `Shipment ${shipment.trackingNumber} updated to "${status}". ${comment || ''}`
    );

    return shipment;
  }

  public async updateShipmentEta(shipmentId: string, newEta: string): Promise<Shipment | null> {
    const shipment = db.getShipmentById(shipmentId);
    if (!shipment) return null;

    shipment.estimatedArrivalDate = newEta;
    db.saveShipment(shipment);
    db.addAuditLog(
      shipment.projectId,
      'usr-3',
      'Arjun Mehta (Logistics CHA)',
      'Estimated Arrival (ETA) Updated',
      `ETA for ${shipment.trackingNumber} updated to ${newEta}`
    );

    return shipment;
  }

  public async simulateNextMilestone(shipmentId: string): Promise<{ shipment: Shipment; newEvent: TrackingEvent } | null> {
    const shipment = db.getShipmentById(shipmentId);
    if (!shipment) return null;

    // Find the first uncompleted event or pick next from pipeline
    const pendingEvent = shipment.events.find(e => !e.completed);

    let nextEvent: TrackingEvent;

    if (pendingEvent) {
      pendingEvent.completed = true;
      pendingEvent.timestamp = this.formatCurrentTimestamp();
      nextEvent = pendingEvent;
    } else {
      // Find what step to add from pipeline
      const pipelineIndex = Math.min(
        shipment.events.length - 2,
        this.transitMilestonePipeline.length - 1
      );
      const template = this.transitMilestonePipeline[Math.max(0, pipelineIndex)];

      nextEvent = {
        id: 'ev-' + Date.now(),
        title: template.title,
        description: template.description,
        location: template.location,
        timestamp: this.formatCurrentTimestamp(),
        completed: true,
        current: true
      };
      shipment.events.push(nextEvent);
    }

    // Update current flags
    shipment.events.forEach(e => {
      e.current = (e.id === nextEvent.id);
    });

    // Update coordinates / location
    if (nextEvent.location.includes('Coordinates:')) {
      const match = nextEvent.location.match(/\(([^)]+)\)/);
      if (match) {
        shipment.coordinates = match[1].replace('Coordinates: ', '');
      }
    }
    shipment.currentLocation = nextEvent.location;

    // If destination or inward clearance reached
    if (nextEvent.title.toLowerCase().includes('berthing') || nextEvent.title.toLowerCase().includes('hamburg')) {
      shipment.status = 'Arrived at Destination';
    } else if (nextEvent.title.toLowerCase().includes('gate passed') || nextEvent.title.toLowerCase().includes('delivered')) {
      shipment.status = 'Delivered';
    } else {
      shipment.status = 'In Transit';
    }

    db.saveShipment(shipment);

    db.addAuditLog(
      shipment.projectId,
      'usr-3',
      'Arjun Mehta (Port CHA)',
      'Shipment Milestone Advanced',
      `Live Tracking Event: ${nextEvent.title} at ${nextEvent.location}`
    );

    return { shipment, newEvent: nextEvent };
  }

  public async sendChaMessage(shipmentId: string, sender: string, message: string): Promise<{ sender: string; text: string; time: string; reply?: string }> {
    const time = this.formatCurrentTimestamp();

    // Auto-generate realistic port broker / CHA response based on message content
    let reply = 'Acknowledged Vikram. Port CFS has updated the telematics ledger.';
    const lower = message.toLowerCase();

    if (lower.includes('eta') || lower.includes('when') || lower.includes('arrival')) {
      reply = 'Current nautical computer projects ETA at Hamburg Waltershof on 28 Dec, subject to Suez queue clearance.';
    } else if (lower.includes('customs') || lower.includes('leo') || lower.includes('icegate')) {
      reply = 'ICEGATE Shipping Bill 8839102/2024 has passed all risk assessment checks. LEO is fully intact.';
    } else if (lower.includes('bl') || lower.includes('bill of lading')) {
      reply = 'Bill of Lading MAEU928419 is counter-signed. Original 3/3 sets released by shipping line.';
    } else if (lower.includes('speed') || lower.includes('weather')) {
      reply = 'Sea conditions are calm (Beaufort 3). Vessel cruising at steady 16.8 knots.';
    }

    db.addAuditLog(
      'EXP-2025-0142',
      'usr-1',
      sender,
      'Logistics Dispatch Query',
      `Message to Port CHA: "${message}"`
    );

    return {
      sender,
      text: message,
      time,
      reply
    };
  }

  private formatCurrentTimestamp(): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} • ${timeStr}`;
  }
}

export const logisticsService: LogisticsProvider = new MockLogisticsProvider();
