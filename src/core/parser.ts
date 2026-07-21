import type { TLV, QRISData, MerchantAccountInfo } from "./types";

/** Map of known EMVCo / QRIS tag IDs to human-readable names */
const TAG_NAMES: Record<string, string> = {
  "00": "Payload Format Indicator",
  "01": "Point of Initiation Method",
  "02": "Visa",
  "03": "Mastercard",
  "04": "Mastercard",
  "15": "Visa",
  "26": "Merchant Account Information",
  "27": "Merchant Account Information",
  "28": "Merchant Account Information",
  "29": "Merchant Account Information",
  "30": "Merchant Account Information",
  "31": "Merchant Account Information",
  "32": "Merchant Account Information",
  "33": "Merchant Account Information",
  "34": "Merchant Account Information",
  "35": "Merchant Account Information",
  "36": "Merchant Account Information",
  "37": "Merchant Account Information",
  "38": "Merchant Account Information",
  "39": "Merchant Account Information",
  "40": "Merchant Account Information",
  "41": "Merchant Account Information",
  "42": "Merchant Account Information",
  "43": "Merchant Account Information",
  "44": "Merchant Account Information",
  "45": "Merchant Account Information",
  "46": "Merchant Account Information",
  "47": "Merchant Account Information",
  "48": "Merchant Account Information",
  "49": "Merchant Account Information",
  "50": "Merchant Account Information",
  "51": "Merchant Account Information",
  "52": "Merchant Category Code",
  "53": "Transaction Currency",
  "54": "Transaction Amount",
  "55": "Tip or Convenience Indicator",
  "56": "Value of Convenience Fee (Fixed)",
  "57": "Value of Convenience Fee (%)",
  "58": "Country Code",
  "59": "Merchant Name",
  "60": "Merchant City",
  "61": "Postal Code",
  "62": "Additional Data Field",
  "63": "CRC",
};

const MAI_DEFAULT_TAG_NAMES: Record<string, string> = {
  "00": "Globally Unique Identifier",
  "01": "Global ID",
  "02": "Merchant ID",
  "03": "Merchant Criteria",
};

const MAI_TAG_26_NAMES: Record<string, string> = {
  "00": "Globally Unique Identifier (Reversed Domain)",
  "01": "Acquirer ID",
  "02": "Merchant ID",
  "03": "Merchant Criteria",
};

const MAI_TAG_51_NAMES: Record<string, string> = {
  "00": "Globally Unique Identifier",
  "01": "Global ID",
  "02": "NMID (National Merchant ID)",
  "03": "Merchant Criteria",
};

const ADDITIONAL_DATA_TAG_NAMES: Record<string, string> = {
  "01": "Bill Number",
  "02": "Mobile Number",
  "03": "Store Label",
  "04": "Loyalty Number",
  "05": "Reference Label",
  "06": "Customer Label",
  "07": "Terminal ID",
  "08": "Purpose of Transaction",
  "09": "Additional Consumer Data Request",
  "10": "Merchant Tax ID",
  "11": "Merchant Channel",
};

const LANG_PREF_TAG_NAMES: Record<string, string> = {
  "00": "Language Preference",
  "01": "Merchant Name (Alt Language)",
  "02": "Merchant City (Alt Language)",
};

/** Tags that contain nested TLV sub-elements */
const NESTED_TAGS = new Set([
  ...Array.from({ length: 26 }, (_, i) => String(i + 26).padStart(2, "0")),
  "62",
  "64",
]);

/**
 * Parse a raw TLV string into an array of TLV elements.
 */
export function parseTLV(data: string, parentTag?: string): TLV[] {
  const elements: TLV[] = [];
  let pos = 0;

  while (pos < data.length) {
    if (pos + 4 > data.length) break;

    const tag = data.substring(pos, pos + 2);
    const length = parseInt(data.substring(pos + 2, pos + 4), 10);

    if (isNaN(length) || pos + 4 + length > data.length) break;

    const value = data.substring(pos + 4, pos + 4 + length);

    let name = TAG_NAMES[tag] ?? `Unknown (${tag})`;
    if (parentTag) {
      const parentNum = parseInt(parentTag, 10);
      if (parentNum >= 26 && parentNum <= 51) {
        if (parentTag === "26") {
          name = MAI_TAG_26_NAMES[tag] ?? `Unknown (${tag})`;
        } else if (parentTag === "51") {
          name = MAI_TAG_51_NAMES[tag] ?? `Unknown (${tag})`;
        } else {
          name = MAI_DEFAULT_TAG_NAMES[tag] ?? `Unknown (${tag})`;
        }
      } else if (parentTag === "62") {
        name = ADDITIONAL_DATA_TAG_NAMES[tag] ?? `Unknown (${tag})`;
      } else if (parentTag === "64") {
        name = LANG_PREF_TAG_NAMES[tag] ?? `Unknown (${tag})`;
      } else {
        name = `Unknown (${tag})`;
      }
    }

    const element: TLV = { tag, name, length, value };

    if (NESTED_TAGS.has(tag)) {
      element.children = parseTLV(value, tag);
    }

    elements.push(element);
    pos += 4 + length;
  }

  return elements;
}

/**
 * Parse a QRIS string into a structured QRISData object.
 */
export function parseQRIS(qrisString: string): QRISData {
  const raw = parseTLV(qrisString);

  const findTag = (tag: string, elements: TLV[] = raw) => elements.find((t) => t.tag === tag);

  const methodValue = findTag("01")?.value;
  const method = methodValue === "12" ? "dynamic" : "static";

  const tipIndicatorValue = findTag("55")?.value;
  let tipIndicator: QRISData["tipIndicator"];
  if (tipIndicatorValue === "01") tipIndicator = "prompt";
  else if (tipIndicatorValue === "02") tipIndicator = "fixed";
  else if (tipIndicatorValue === "03") tipIndicator = "percentage";

  // Extract merchant account information (tags 26-51)
  const merchantAccountInfo: MerchantAccountInfo[] = raw
    .filter((t) => {
      const tagNum = parseInt(t.tag, 10);
      return tagNum >= 26 && tagNum <= 51 && t.children;
    })
    .map((t) => {
      const children = t.children ?? [];
      const findChild = (childTag: string) => children.find((c) => c.tag === childTag);

      return {
        tag: t.tag,
        globallyUniqueId: findChild("00")?.value ?? "",
        merchantId: findChild("01")?.value ?? findChild("02")?.value,
        merchantCriteria: findChild("03")?.value,
        fields: children,
      };
    });

  // Extract ID domestic mapping (using the first 26-45 tag that exists)
  const domesticTag = raw.find((t) => {
    const num = parseInt(t.tag, 10);
    return num >= 26 && num <= 45 && t.children;
  });
  
  let merchantAccountInfoDomestic;
  if (domesticTag && domesticTag.children) {
    merchantAccountInfoDomestic = {
      reverseDomain: findTag("00", domesticTag.children)?.value ?? "",
      globalID: findTag("01", domesticTag.children)?.value ?? "",
      id: findTag("02", domesticTag.children)?.value ?? "",
      type: findTag("03", domesticTag.children)?.value ?? "",
    };
  }

  const centralRepoTag = findTag("51");

  // Extract Additional Data
  const addDataTag = findTag("62");
  let additionalData;
  if (addDataTag && addDataTag.children) {
    additionalData = {
      billNumber: findTag("01", addDataTag.children)?.value,
      mobileNumber: findTag("02", addDataTag.children)?.value,
      storeLabel: findTag("03", addDataTag.children)?.value,
      loyaltyNumber: findTag("04", addDataTag.children)?.value,
      referenceLabel: findTag("05", addDataTag.children)?.value,
      customerLabel: findTag("06", addDataTag.children)?.value,
      terminalLabel: findTag("07", addDataTag.children)?.value,
      purposeOfTransaction: findTag("08", addDataTag.children)?.value,
      additionalConsumerDataRequest: findTag("09", addDataTag.children)?.value,
      merchantTaxID: findTag("10", addDataTag.children)?.value,
      merchantChannel: findTag("11", addDataTag.children)?.value,
      paymentSystemSpecific: addDataTag.children.filter((t) => {
        const num = parseInt(t.tag, 10);
        return num >= 50 && num <= 99;
      }),
    };
  }

  // Extract Language Preference
  const langTag = findTag("64");
  let merchantInformationLanguage;
  if (langTag && langTag.children) {
    merchantInformationLanguage = {
      languagePreference: findTag("00", langTag.children)?.value ?? "",
      merchantNameAltLanguage: findTag("01", langTag.children)?.value ?? "",
      merchantCityAltLanguage: findTag("02", langTag.children)?.value,
    };
  }

  return {
    version: findTag("00")?.value ?? "01",
    method,
    
    merchantAccountInfoDomestic,
    merchantAccountInfoCentralRepository: centralRepoTag?.children ? findTag("02", centralRepoTag.children)?.value : centralRepoTag?.value,
    merchantAccountInfo,
    
    merchantCategoryCode: findTag("52")?.value ?? "",
    currency: findTag("53")?.value ?? "360",
    amount: findTag("54")?.value,
    tipIndicator,
    tipFixed: findTag("56")?.value,
    tipPercentage: findTag("57")?.value,
    countryCode: findTag("58")?.value ?? "ID",
    merchantName: findTag("59")?.value ?? "",
    merchantCity: findTag("60")?.value ?? "",
    postalCode: findTag("61")?.value ?? "",
    
    additionalData,
    merchantInformationLanguage,
    
    crc: findTag("63")?.value ?? "",
    raw,
  };
}
