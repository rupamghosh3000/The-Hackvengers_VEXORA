import { TimelineBreakdown, ShippingMode } from '../../src/types';

export interface TimelineEstimateInput {
  shippingMode: ShippingMode;
  destinationCountry: string;
  hasCertificates?: boolean;
  targetShipmentDate?: string;
}

export function calculateExportTimeline(input: TimelineEstimateInput): TimelineBreakdown {
  const documentationDays = 3;
  const certificationDays = input.hasCertificates ? 2 : 10;
  const packagingDays = 3;
  const logisticsPreparationDays = 3;
  const customsDays = 2;
  const insuranceDays = 1;

  let shippingTransitDays = 22;
  if (input.shippingMode === 'Air') {
    shippingTransitDays = 4;
  } else if (input.shippingMode === 'Courier') {
    shippingTransitDays = 5;
  } else if (input.shippingMode === 'Road') {
    shippingTransitDays = 6;
  } else {
    // Sea
    if (input.destinationCountry === 'Germany' || input.destinationCountry === 'United Kingdom') {
      shippingTransitDays = 22;
    } else if (input.destinationCountry === 'United States') {
      shippingTransitDays = 28;
    } else if (input.destinationCountry === 'United Arab Emirates') {
      shippingTransitDays = 7;
    } else if (input.destinationCountry === 'Japan') {
      shippingTransitDays = 18;
    }
  }

  // Preparation days before port departure (some tasks run in parallel)
  // Max(certification, documentation) + packaging + customs + logistics buffer
  const totalPreparationDays = Math.max(documentationDays, certificationDays) + packagingDays + customsDays;
  const totalEstimatedDays = totalPreparationDays + shippingTransitDays;

  const baseDate = input.targetShipmentDate ? new Date(input.targetShipmentDate) : new Date();
  const deliveryDateObj = new Date(baseDate.getTime() + shippingTransitDays * 24 * 60 * 60 * 1000);

  return {
    documentationDays,
    certificationDays,
    packagingDays,
    logisticsPreparationDays,
    customsDays,
    insuranceDays,
    shippingTransitDays,
    totalPreparationDays,
    totalEstimatedDays,
    targetDate: baseDate.toISOString().split('T')[0],
    estimatedDeliveryDate: deliveryDateObj.toISOString().split('T')[0]
  };
}
