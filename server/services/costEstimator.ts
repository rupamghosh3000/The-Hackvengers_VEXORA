import { CostBreakdown, ShippingMode } from '../../src/types';

export interface CostEstimateInput {
  productValue: number;
  quantity: number;
  shippingMode: ShippingMode;
  destinationCountry: string;
  packagingGrade?: 'Standard' | 'Heavy Duty / Palletized' | 'Eco-Certified';
  currency?: 'INR' | 'USD' | 'EUR';
}

export function calculateExportCost(input: CostEstimateInput): CostBreakdown {
  const currency = input.currency || 'USD';
  const val = input.productValue;
  const qty = Math.max(1, input.quantity);

  // Packaging cost
  let packUnitRate = 1.60;
  if (input.packagingGrade === 'Heavy Duty / Palletized') packUnitRate = 2.40;
  if (input.packagingGrade === 'Eco-Certified') packUnitRate = 2.90;
  const packagingCost = Math.round(qty * packUnitRate);

  // Freight calculation
  let freightCost = 2850;
  if (input.shippingMode === 'Air') {
    // Air cargo roughly $5.50 per kg or unit estimate
    freightCost = Math.round(qty * 4.80);
  } else if (input.shippingMode === 'Courier') {
    freightCost = Math.round(qty * 12.00);
  } else if (input.shippingMode === 'Road') {
    freightCost = 950;
  } else {
    // Sea mode
    if (input.destinationCountry === 'United States') freightCost = 3800;
    else if (input.destinationCountry === 'United Kingdom' || input.destinationCountry === 'Germany') freightCost = 2850;
    else if (input.destinationCountry === 'United Arab Emirates') freightCost = 1450;
    else freightCost = 2600;
  }

  // Marine Insurance: 0.35% of CIF Value (Product + Freight) + 18% GST
  const cifBase = val + freightCost;
  const insuranceCost = Math.round(cifBase * 0.0035 * 1.18);

  // Regulatory & Documentation: COO, DGFT filing, testing allocation
  const documentationCost = 350;

  // Customs CHA Clearance Charges
  const customsCharges = 220;

  // Port Handling & Terminal Charges (JNPT CFS)
  const portHandlingCharges = input.shippingMode === 'Sea' ? 340 : 180;

  const totalEstimatedCost = Math.round(
    val + packagingCost + freightCost + insuranceCost + documentationCost + customsCharges + portHandlingCharges
  );

  return {
    productValue: val,
    packagingCost,
    freightCost,
    insuranceCost,
    documentationCost,
    customsCharges,
    portHandlingCharges,
    totalEstimatedCost,
    currency
  };
}
