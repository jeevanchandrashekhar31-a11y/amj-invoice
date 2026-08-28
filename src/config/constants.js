// src/config/constants.js

export const TAX_RATES = {
  GST_ON_PROFIT_RATE: 0.18,
  TDS_ON_PURCHASE_RATE: 0.02,
};

export const INVOICE_SETTINGS = {
  PREFIX: 'AMJ',
  STARTING_NUMBER: 1, // You can change this if you need to start from a different number
  FINANCIAL_YEAR: '2627', // E.g., '2627' for FY 2026-27
};

export const BANK_DETAILS = {
  BANK_NAME: 'STATE BANK OF INDIA',
  BRANCH: 'AKSHAYANAGAR',
  ACCOUNT_NAME: 'AMJ ENTERPRISES',
  ACCOUNT_NUMBER: '43511719094',
  IFSC: 'SBIN0013159',
};

export const TERMS_AND_CONDITIONS = [
  'Subject to our home Jurisdiction.',
  'Our Responsibility Ceases as soon as goods leave our Premises.',
  'Goods once sold will not be taken back. Delivery Ex-Premises.',
];

// Helper to generate formatted invoice number
export const generateInvoiceNumber = (sequenceNum, prefix = INVOICE_SETTINGS.PREFIX) => {
  // Pad the sequence number with zeros (e.g., 1 -> 072)
  const padded = String(sequenceNum).padStart(3, '0');
  return `${prefix}${padded}`; // Example: AMJ072
};
