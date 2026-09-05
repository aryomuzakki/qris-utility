import { useState } from "react";
import type { QRISData, ConvertOptions } from "@core/types";

interface Props {
  parsed: QRISData;
  onConvert: (options: ConvertOptions) => void;
  onConvertToStatic: () => void;
}

type Mode = "dynamic" | "static";
type FeeType = "none" | "fixed" | "percentage";

export function ConvertForm({ parsed, onConvert, onConvertToStatic }: Props) {
  const isCurrentlyDynamic = parsed.method === "dynamic";
  const [mode, setMode] = useState<Mode>("dynamic");
  const [amount, setAmount] = useState(parsed.amount ? String(parsed.amount) : "");
  const [feeType, setFeeType] = useState<FeeType>(
    parsed.tipIndicator === "fixed"
      ? "fixed"
      : parsed.tipIndicator === "percentage"
        ? "percentage"
        : "none"
  );
  const [feeValue, setFeeValue] = useState(
    parsed.tipFixed ?? parsed.tipPercentage ?? ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "static" && isCurrentlyDynamic) {
      onConvertToStatic();
      return;
    }

    const amountNum = parseInt(amount, 10);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const options: ConvertOptions = { amount: amountNum };

    if (feeType !== "none" && feeValue) {
      const feeNum = parseFloat(feeValue);
      if (!isNaN(feeNum) && feeNum > 0) {
        options.fee = { type: feeType, value: feeNum };
      }
    }

    onConvert(options);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-white dark:bg-gray-900 overflow-hidden"
    >
      <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
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
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          {isCurrentlyDynamic ? "Convert & Modify QRIS" : "Convert to Dynamic QRIS"}
        </h2>

        {/* Mode Selector - only show if QRIS is dynamic and can be converted back to static */}
        {isCurrentlyDynamic && (
          <div className="flex bg-gray-200/80 dark:bg-gray-800 p-0.5 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setMode("dynamic")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                mode === "dynamic"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Dynamic
            </button>
            <button
              type="button"
              onClick={() => setMode("static")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                mode === "static"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Static
            </button>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {mode === "dynamic" ? (
          <>
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Amount (Rupiah)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  Rp
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  min="1"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            {/* Service Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Service Fee / Tip
              </label>
              <div className="flex gap-2">
                {(["none", "fixed", "percentage"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setFeeType(type);
                      setFeeValue("");
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                      feeType === type
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300"
                        : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {type === "none" ? "None" : type === "fixed" ? "Fixed (Rp)" : "Percent (%)"}
                  </button>
                ))}
              </div>
            </div>

            {feeType !== "none" && (
              <div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    {feeType === "fixed" ? "Rp" : "%"}
                  </span>
                  <input
                    type="number"
                    value={feeValue}
                    onChange={(e) => setFeeValue(e.target.value)}
                    placeholder="0"
                    min="0"
                    step={feeType === "percentage" ? "0.1" : "1"}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              Convert / Update Dynamic QRIS
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-3.5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed border border-gray-200 dark:border-gray-700/60">
              <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Static QRIS Mode
              </p>
              This will strip any fixed amount and service fee tags (Tags 54, 55, 56, 57) and set the initiation method to <strong>Static (11)</strong>. The customer manually inputs the amount in their mobile banking or e-wallet application.
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              Convert to Static QRIS
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
