import mccData from "./mcc.json";
import criteriaData from "./criteria.json";
import currenciesData from "./currencies.json";
import countriesData from "./countries.json";

export interface MCCInfo {
  name: string;
  nameId: string;
  category: string;
}

export interface MerchantCriteriaInfo {
  name: string;
  nameId: string;
  description: string;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
}

export interface CountryInfo {
  name: string;
  alpha3: string;
  numeric: string;
  scheme: string;
}

/**
 * Get Merchant Category Code (MCC) information by 4-digit code.
 */
export function getMCCInfo(code: string): MCCInfo | null {
  const data = mccData as Record<string, MCCInfo>;
  return data[code] || null;
}

/**
 * Get Bank Indonesia Merchant Criteria information by code (e.g. UMI, UKE, UME, UBE, SPBU).
 */
export function getMerchantCriteriaInfo(code: string): MerchantCriteriaInfo | null {
  const data = criteriaData as Record<string, MerchantCriteriaInfo>;
  return data[code?.toUpperCase()] || null;
}

/**
 * Get Currency information by 3-digit ISO 4217 numeric code (e.g. 360) or 3-letter alpha code (e.g. IDR).
 */
export function getCurrencyInfo(codeOrAlpha: string): CurrencyInfo | null {
  const data = currenciesData as Record<string, CurrencyInfo>;
  if (data[codeOrAlpha]) return data[codeOrAlpha];

  // Lookup by alpha code
  const upper = codeOrAlpha?.toUpperCase();
  for (const item of Object.values(data)) {
    if (item.code === upper) return item;
  }
  return null;
}

/**
 * Get Country information by 2-letter ISO 3166-1 alpha-2 code (e.g. ID, SG, MY, TH).
 */
export function getCountryInfo(alpha2Code: string): CountryInfo | null {
  const data = countriesData as Record<string, CountryInfo>;
  return data[alpha2Code?.toUpperCase()] || null;
}

export { mccData, criteriaData, currenciesData, countriesData };
