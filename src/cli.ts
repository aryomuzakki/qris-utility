import { createInterface } from "readline";
import {
  parseQRIS,
  convertQRIS,
  convertToStatic,
  validateQRIS,
  getAcquirerInfo,
  getMCCInfo,
  getMerchantCriteriaInfo,
} from "./core/index";

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string): Promise<string> =>
  new Promise((resolve) => rl.question(q, (a) => resolve(a.trim())));

async function main() {
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   QRIS Utility CLI v0.1.0                    ║");
  console.log("║   Toolkit for Indonesian QRIS Standards      ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  const qris = await ask("[?] Input QRIS string: ");

  if (!qris) {
    console.log("[✗] No QRIS string provided.");
    rl.close();
    process.exit(1);
  }

  const validation = validateQRIS(qris);
  if (!validation.valid) {
    console.log("\n[✗] Invalid QRIS:");
    validation.errors.forEach((e) => console.log(`    - ${e}`));
    rl.close();
    process.exit(1);
  }

  const parsed = parseQRIS(qris);
  const nnsCode = parsed.merchantAccountInfoDomestic?.globalID?.substring(0, 8);
  const acquirer = nnsCode ? getAcquirerInfo(nnsCode) : undefined;
  const mcc = getMCCInfo(parsed.merchantCategoryCode);
  const criteriaCode =
    parsed.merchantAccountInfo?.find((i) => i.tag === "51")?.merchantCriteria ??
    parsed.merchantAccountInfoDomestic?.type;
  const criteria = criteriaCode ? getMerchantCriteriaInfo(criteriaCode) : undefined;

  console.log("\n[✓] QRIS Parsed:");
  console.log(`    Merchant : ${parsed.merchantName || "-"}`);
  if (parsed.merchantAccountInfoCentralRepository) {
    console.log(`    NMID     : ${parsed.merchantAccountInfoCentralRepository}`);
  }
  console.log(`    City     : ${parsed.merchantCity || "-"}`);
  if (acquirer) {
    console.log(`    Acquirer : ${acquirer.name}${acquirer.product ? ` (${acquirer.product})` : ""}`);
  }
  if (criteria) {
    console.log(`    Criteria : ${criteria.nameId}`);
  }
  if (mcc) {
    console.log(`    Category : ${mcc.nameId} (${parsed.merchantCategoryCode})`);
  }
  console.log(`    Method   : ${parsed.method}`);
  console.log(
    `    Currency : ${parsed.currency === "360" ? "IDR" : parsed.currency}`,
  );

  if (parsed.amount) {
    console.log(`    Amount   : Rp ${Number(parsed.amount).toLocaleString("id-ID")}`);
  }
  if (parsed.tipIndicator === "fixed" && parsed.tipFixed) {
    console.log(`    Tip/Fee  : Rp ${Number(parsed.tipFixed).toLocaleString("id-ID")} (Fixed)`);
  } else if (parsed.tipIndicator === "percentage" && parsed.tipPercentage) {
    console.log(`    Tip/Fee  : ${parsed.tipPercentage}% (Percentage)`);
  }

  if (parsed.method === "dynamic") {
    console.log("\n[?] Select action:");
    console.log("    1. Update Dynamic QRIS (modify amount & fee)");
    console.log("    2. Convert to Static QRIS (strip amount & fee)");
    console.log("    3. Exit");

    const action = await ask("\n[?] Choice (1/2/3): ");

    if (action === "2") {
      const result = convertToStatic(qris);
      console.log("\n╔══════════════════════════════════════════════╗");
      console.log("║   Converted to Static QRIS                   ║");
      console.log("╚══════════════════════════════════════════════╝");
      console.log(`\n${result}\n`);
      rl.close();
      return;
    }

    if (action !== "1") {
      console.log("\nExiting.");
      rl.close();
      return;
    }
  } else {
    const proceed = await ask("\n[?] Convert this static QRIS to Dynamic? (y/n): ");
    if (proceed.toLowerCase() !== "y") {
      console.log("\nExiting.");
      rl.close();
      return;
    }
  }

  const amountStr = await ask("\n[?] Input nominal (Rupiah): ");
  const amount = parseInt(amountStr, 10);
  if (isNaN(amount) || amount <= 0) {
    console.log("[✗] Invalid amount.");
    rl.close();
    process.exit(1);
  }

  const useFee = await ask("[?] Add service fee? (y/n): ");

  let fee: { type: "fixed" | "percentage"; value: number } | undefined;

  if (useFee.toLowerCase() === "y") {
    const feeType = await ask("[?] Fixed or Percentage? (f/p): ");
    if (feeType.toLowerCase() === "f") {
      const feeVal = await ask("[?] Fee amount (Rupiah): ");
      fee = { type: "fixed", value: parseFloat(feeVal) };
    } else if (feeType.toLowerCase() === "p") {
      const feeVal = await ask("[?] Fee percentage: ");
      fee = { type: "percentage", value: parseFloat(feeVal) };
    }
  }

  const result = convertQRIS(qris, { amount, fee });

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   Result                                     ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log(`\n${result}\n`);

  rl.close();
}

main();


