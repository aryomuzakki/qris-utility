import nnsData from "./nns.json";

export interface AcquirerInfo {
  name: string;
  product: string;
}

/**
 * Get the Acquirer name and product based on an 8-digit NNS code.
 */
export function getAcquirerInfo(nnsCode: string): AcquirerInfo | null {
  const data = nnsData as Record<string, AcquirerInfo>;
  return data[nnsCode] || null;
}
