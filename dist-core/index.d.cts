/** A single TLV (Tag-Length-Value) element from a QRIS payload */
interface TLV {
    tag: string;
    name: string;
    length: number;
    value: string;
    children?: TLV[];
}
interface MerchantAccountInformationID {
    reverseDomain: string;
    globalID: string;
    id: string;
    type: string;
}
interface AdditionalData {
    billNumber?: string;
    mobileNumber?: string;
    storeLabel?: string;
    loyaltyNumber?: string;
    referenceLabel?: string;
    customerLabel?: string;
    terminalLabel?: string;
    purposeOfTransaction?: string;
    additionalConsumerDataRequest?: string;
    merchantTaxID?: string;
    merchantChannel?: string;
    paymentSystemSpecific?: TLV[];
    rfu?: TLV[];
}
interface MerchantInformationLanguage {
    languagePreference: string;
    merchantNameAltLanguage: string;
    merchantCityAltLanguage?: string;
    rfu?: TLV[];
}
/** Parsed QRIS data in a human-friendly structure */
interface QRISData {
    version: string;
    method: "static" | "dynamic";
    merchantAccountInfoDomestic?: MerchantAccountInformationID;
    merchantAccountInfoCentralRepository?: string;
    merchantAccountInfo?: MerchantAccountInfo[];
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
    additionalData?: AdditionalData;
    merchantInformationLanguage?: MerchantInformationLanguage;
    crc: string;
    raw: TLV[];
}
interface MerchantAccountInfo {
    tag: string;
    globallyUniqueId: string;
    merchantId?: string;
    merchantCriteria?: string;
    fields: TLV[];
}
interface ConvertOptions {
    amount: number;
    fee?: {
        type: "fixed" | "percentage";
        value: number;
    };
}
interface ValidationResult {
    valid: boolean;
    errors: string[];
}

/**
 * Parse a raw TLV string into an array of TLV elements.
 */
declare function parseTLV(data: string, parentTag?: string): TLV[];
/**
 * Parse a QRIS string into a structured QRISData object.
 */
declare function parseQRIS(qrisString: string): QRISData;

/**
 * Convert a static QRIS string to dynamic by injecting amount and optional fee.
 *
 * Steps:
 * 1. Parse the TLV structure
 * 2. Change Point of Initiation Method from "11" (static) to "12" (dynamic)
 * 3. Insert/replace Transaction Amount (tag 54)
 * 4. Optionally insert Tip Indicator (tag 55) and fee value (tag 56/57)
 * 5. Recalculate CRC16 checksum
 */
declare function convertQRIS(qrisString: string, options: ConvertOptions): string;

/**
 * Validate a QRIS string for structural correctness.
 */
declare function validateQRIS(qrisString: string): ValidationResult;

/**
 * Calculate CRC16-CCITT checksum for QRIS/EMVCo QR codes.
 * Polynomial: 0x1021, Init: 0xFFFF
 */
declare function calculateCRC16(str: string): string;

interface AcquirerInfo {
    name: string;
    product: string;
}
/**
 * Get the Acquirer name and product based on an 8-digit NNS code.
 */
declare function getAcquirerInfo(nnsCode: string): AcquirerInfo | null;

export { type AcquirerInfo, type ConvertOptions, type MerchantAccountInfo, type QRISData, type TLV, type ValidationResult, calculateCRC16, convertQRIS, getAcquirerInfo, parseQRIS, parseTLV, validateQRIS };
