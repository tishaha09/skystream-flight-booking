/**
 * Centralized Fare Types & Concession Discount Configuration
 * Used for accurate pricing calculations across booking creation and validation.
 */
export const FARE_TYPES = {
  Regular: {
    name: "Regular",
    code: "REG",
    discountPercent: 0,
    description: "Standard commercial fare with standard cabin & check-in baggage",
    badge: "Standard",
    requiresVerification: false,
  },
  Student: {
    name: "Student",
    code: "STU",
    discountPercent: 10,
    description: "10% off base fare for bona fide students with valid institute ID",
    badge: "10% OFF",
    requiresVerification: true,
    verificationField: "studentId",
    verificationLabel: "University / Student ID Number",
  },
  "Armed Forces": {
    name: "Armed Forces",
    code: "DEF",
    discountPercent: 15,
    description: "15% concession for active serving personnel and veterans",
    badge: "15% OFF",
    requiresVerification: true,
    verificationField: "defenseId",
    verificationLabel: "Military / Defense Service ID",
  },
  "Senior Citizen": {
    name: "Senior Citizen",
    code: "SNR",
    discountPercent: 12,
    description: "12% concession for senior passengers aged 60 years or above",
    badge: "12% OFF",
    requiresVerification: true,
    verificationField: "seniorAgeProof",
    verificationLabel: "Government Age Verification ID (Age 60+)",
  },
};

/**
 * Calculates fare breakdown accurately based on database flight price and fare type.
 *
 * @param {number} unitPrice - Authoritative base fare per seat from database
 * @param {number} seatCount - Number of reserved seats
 * @param {string} fareType - One of the FARE_TYPES keys (Regular, Student, Armed Forces, Senior Citizen)
 * @returns {object} { baseFare, discountPercent, discountAmount, totalAmount }
 */
export const calculateFareBreakdown = (unitPrice, seatCount, fareType = "Regular") => {
  const config = FARE_TYPES[fareType] || FARE_TYPES.Regular;
  const baseFare = Math.round(Number(unitPrice) * Number(seatCount));
  const discountPercent = config.discountPercent || 0;
  const discountAmount = Math.round((baseFare * discountPercent) / 100);
  const totalAmount = Math.max(0, baseFare - discountAmount);

  return {
    fareType: config.name,
    baseFare,
    discountPercent,
    discountAmount,
    totalAmount,
  };
};

export default FARE_TYPES;
