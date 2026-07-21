/** A single TLV (Tag-Length-Value) element from a QRIS payload */
export interface TLV {
  tag: string;
  name: string;
  length: number;
  value: string;
  children?: TLV[];
}

export interface MerchantAccountInformationID {
  reverseDomain: string; // Tag 00
  globalID: string;      // Tag 01
  id: string;            // Tag 02
  type: string;          // Tag 03
}

export interface AdditionalData {
  billNumber?: string;                     // Tag 01
  mobileNumber?: string;                   // Tag 02
  storeLabel?: string;                     // Tag 03
  loyaltyNumber?: string;                  // Tag 04
  referenceLabel?: string;                 // Tag 05
  customerLabel?: string;                  // Tag 06
  terminalLabel?: string;                  // Tag 07
  purposeOfTransaction?: string;           // Tag 08
  additionalConsumerDataRequest?: string;  // Tag 09
  merchantTaxID?: string;                  // Tag 10
  merchantChannel?: string;                // Tag 11
  paymentSystemSpecific?: TLV[];           // Tags 50-99
  rfu?: TLV[];                             // Reserved for Future Use
}

export interface MerchantInformationLanguage {
  languagePreference: string;             // Tag 00
  merchantNameAltLanguage: string;        // Tag 01
  merchantCityAltLanguage?: string;       // Tag 02
  rfu?: TLV[];                            // Tags 03-99
}

/** Parsed QRIS data in a human-friendly structure */
export interface QRISData {
  version: string;
  method: "static" | "dynamic";
  
  // Secondary Structured Mappings
  merchantAccountInfoDomestic?: MerchantAccountInformationID; // Tags 26-45
  merchantAccountInfoCentralRepository?: string; // Tag 51 (NMID)
  merchantAccountInfo?: MerchantAccountInfo[]; // Generic fallback
  
  merchantCategoryCode: string;
  currency: string;
  amount?: string;
  tipIndicator?: "prompt" | "fixed" | "percentage";
  tipFixed?: string;
  tipPercentage?: string;
  countryCode: string;
  merchantName: string;
  merchantCity: string;
  postalCode: string;
  
  additionalData?: AdditionalData; // Tag 62 structured
  merchantInformationLanguage?: MerchantInformationLanguage; // Tag 64
  
  crc: string;
  
  // The raw TLV AST guarantees no data is lost
  raw: TLV[];
}

export interface MerchantAccountInfo {
  tag: string;
  globallyUniqueId: string;
  merchantId?: string;
  merchantCriteria?: string;
  fields: TLV[];
}

export interface ConvertOptions {
  amount: number;
  fee?: {
    type: "fixed" | "percentage";
    value: number;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
