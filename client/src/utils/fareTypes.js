/**
 * Centralized Fare Types & Concessions Configuration on Frontend
 * Mirrors the backend configuration for instantaneous responsive UI price feedback.
 */
export const FARE_TYPES = {
  Regular: {
    name: "Regular",
    code: "REG",
    discountPercent: 0,
    description: "Standard commercial fare with standard baggage allowance",
    badge: "Standard",
    icon: "🧳",
    requiresVerification: false,
  },
  Student: {
    name: "Student",
    code: "STU",
    discountPercent: 10,
    description: "10% off base fare for verified students with valid institute ID",
    badge: "10% OFF",
    icon: "🎓",
    requiresVerification: true,
    verificationField: "studentId",
    verificationLabel: "University / Student ID Number",
    placeholder: "e.g. STU-UNIV-2026-981",
  },
  "Armed Forces": {
    name: "Armed Forces",
    code: "DEF",
    discountPercent: 15,
    description: "15% concession for active defense personnel and veterans",
    badge: "15% OFF",
    icon: "🎖️",
    requiresVerification: true,
    verificationField: "defenseId",
    verificationLabel: "Military / Defense Service ID",
    placeholder: "e.g. DEF-SERV-84920",
  },
  "Senior Citizen": {
    name: "Senior Citizen",
    code: "SNR",
    discountPercent: 12,
    description: "12% concession for senior passengers aged 60 years or above",
    badge: "12% OFF",
    icon: "👴",
    requiresVerification: true,
    verificationField: "seniorAgeProof",
    verificationLabel: "Government Age Verification ID (Age 60+)",
    placeholder: "e.g. AADHAAR / PASSPORT with DOB",
  },
};

/**
 * Calculates fare breakdown accurately based on database flight price and fare type.
 *
 * @param {number} unitPrice - Authoritative base fare per seat
 * @param {number} seatCount - Number of reserved seats
 * @param {string} fareType - One of the FARE_TYPES keys
 * @returns {object} { baseFare, discountPercent, discountAmount, totalAmount }
 */
export const calculateFareBreakdown = (unitPrice, seatCount, fareType = "Regular") => {
  const config = FARE_TYPES[fareType] || FARE_TYPES.Regular;
  const baseFare = Math.round(Number(unitPrice || 0) * Number(seatCount || 1));
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
