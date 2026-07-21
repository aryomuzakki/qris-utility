import type { QRISData } from "@core/types";
import { getAcquirerInfo } from "@core/index";

interface Props {
  data: QRISData;
}

const CURRENCY_MAP: Record<string, string> = {
  "360": "IDR (Rupiah)",
  "840": "USD (Dollar)",
};

const MCC_MAP: Record<string, string> = {
  "4111": "Transportation",
  "4121": "Taxi",
  "4814": "Telecommunication",
  "5311": "Department Store",
  "5411": "Grocery Store",
  "5499": "Food Store",
  "5812": "Restaurant / Eating Places",
  "5814": "Fast Food",
  "5912": "Pharmacy",
  "5999": "Retail Store",
  "7299": "Other Services",
  "8011": "Medical",
  "8999": "Professional Services",
};

const CRITERIA_MAP: Record<string, string> = {
  UMI: "Usaha Mikro (UMI)",
  UKE: "Usaha Kecil (UKE)",
  UME: "Usaha Menengah (UME)",
  UBE: "Usaha Besar (UBE)",
  URE: "Usaha Regular (URE)",
  SPBU: "Stasiun Pengisian Bahan Bakar Umum (SPBU)",
  BLU: "Badan Layanan Umum (BLU)",
  PSO: "Public Service Obligation (PSO)",
  G2P: "Government to People (G2P)",
  P2G: "People to Government (P2G)",
};

function ASTViewer({
  elements,
  depth = 0,
}: {
  elements: import("@core/types").TLV[];
  depth?: number;
}) {
  if (!elements || elements.length === 0) return null;

  return (
    <div
      className={`space-y-2 ${depth > 0 ? "pl-4 mt-2 border-l-2 border-gray-200 dark:border-gray-700" : ""}`}
    >
      {elements.map((el, i) => (
        <div key={`${el.tag}-${i}`} className="text-xs">
          <div className="flex items-start gap-2">
            <span className="font-mono text-primary-600 dark:text-primary-400 font-semibold bg-primary-50 dark:bg-primary-900/30 px-1.5 py-0.5 rounded">
              {el.tag}
            </span>
            <div className="flex-1">
              <div className="font-medium text-gray-700 dark:text-gray-300">
                {el.name} <span className="text-gray-400 font-normal">(len: {el.length})</span>
              </div>
              {(!el.children || el.children.length === 0) && (
                <div className="mt-1 font-mono text-gray-600 dark:text-gray-400 break-all bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded">
                  {el.value}
                </div>
              )}
            </div>
          </div>
          {el.children && el.children.length > 0 && (
            <ASTViewer elements={el.children} depth={depth + 1} />
          )}
        </div>
      ))}
    </div>
  );
}

export function QRISInfo({ data }: Props) {
  const merchantInfo = data.merchantAccountInfo?.[0];
  const issuer = merchantInfo?.globallyUniqueId ?? "-";

  const nnsCode = data.merchantAccountInfoDomestic?.globalID?.substring(0, 8);
  const nnsInfo = nnsCode ? getAcquirerInfo(nnsCode) : undefined;

  const nmid = data.merchantAccountInfoCentralRepository;
  const criteria =
    data.merchantAccountInfo?.find((i) => i.tag === "51")?.merchantCriteria ??
    data.merchantAccountInfoDomestic?.type;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white dark:bg-gray-900 overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-900/50">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <svg
              className="w-4 h-4 text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
            QRIS Information
          </h2>
        </div>
        <div className="divide-y">
          <InfoRow label="Merchant" value={data.merchantName} />
          {nmid && <InfoRow label="NMID" value={nmid} />}
          <InfoRow label="City" value={data.merchantCity} />
          <InfoRow label="Postal Code" value={data.postalCode} />
          <InfoRow label="Issuer" value={issuer} />
          {data.merchantAccountInfoDomestic?.globalID && (
            <InfoRow label="Acquirer ID" value={data.merchantAccountInfoDomestic.globalID} />
          )}
          <InfoRow label="NNS Code" value={nnsCode} />
          {nnsInfo && (
            <>
              <InfoRow label="Acquirer" value={`${nnsInfo.name} `} />
              {nnsInfo.product && (
                <InfoRow label="Acquirer Product Name" value={`${nnsInfo.product}`} />
              )}
            </>
          )}
          {criteria && criteria !== "-" && (
            <InfoRow label="Criteria" value={CRITERIA_MAP[criteria] ?? criteria} />
          )}
          {data.additionalData?.terminalLabel && (
            <InfoRow label="Terminal ID" value={data.additionalData.terminalLabel} />
          )}
          <InfoRow
            label="Method"
            value={
              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  data.method === "static"
                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                    : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                }`}
              >
                {data.method === "static" ? "Static" : "Dynamic"}
              </span>
            }
          />
          <InfoRow
            label="Category"
            value={MCC_MAP[data.merchantCategoryCode] ?? data.merchantCategoryCode}
          />
          <InfoRow label="Currency" value={CURRENCY_MAP[data.currency] ?? data.currency} />
          {data.amount && (
            <InfoRow label="Amount" value={`Rp ${Number(data.amount).toLocaleString("id-ID")}`} />
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-white dark:bg-gray-900 overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-900/50">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <svg
              className="w-4 h-4 text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
              />
            </svg>
            Raw TLV Tree
          </h2>
        </div>
        <div className="p-4 max-h-[60dvh] xl:max-h-none overflow-y-auto">
          <ASTViewer elements={data.raw} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="px-4 py-2.5 flex items-center justify-between gap-4">
      <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
      <span className="text-sm font-medium text-right truncate">{value}</span>
    </div>
  );
}
