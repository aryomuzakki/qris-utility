import { test, expect, describe } from "bun:test";
import { convertQRIS, convertToStatic } from "../converter";
import { parseQRIS } from "../parser";
import { validateQRIS } from "../validator";

const MOCK_STATIC_QRIS = "00020101021126660014ID.CO.QRIS.WWW01189360091100000000000215ID10200000000000303UMI51440014ID.CO.QRIS.WWW0215ID10200000000000303UMI5204581253033605802ID5919QRIS MOCK TEST GIDH6013JAKARTA SELAT6105121106304DF8C";

describe("converter", () => {
  test("converts static to dynamic with amount", () => {
    const dynamic = convertQRIS(MOCK_STATIC_QRIS, { amount: 15000 });
    
    const parsed = parseQRIS(dynamic);
    
    expect(parsed.method).toBe("dynamic");
    expect(parsed.amount).toBe("15000");
    // Verify CRC is correct
    const expectedCrc = dynamic.slice(-4);
    expect(parsed.crc).toBe(expectedCrc);
  });
  
  test("adds fixed fee correctly", () => {
    const dynamic = convertQRIS(MOCK_STATIC_QRIS, { amount: 15000, fee: { type: "fixed", value: 2000 } });
    
    const parsed = parseQRIS(dynamic);
    
    expect(parsed.amount).toBe("15000");
    expect(parsed.tipIndicator).toBe("fixed");
    expect(parsed.tipFixed).toBe("2000");
  });

  test("converts dynamic to static by stripping amount and fee", () => {
    const dynamicWithFee = convertQRIS(MOCK_STATIC_QRIS, {
      amount: 50000,
      fee: { type: "percentage", value: 1.5 },
    });
    
    const staticResult = convertToStatic(dynamicWithFee);
    const parsed = parseQRIS(staticResult);
    
    expect(parsed.method).toBe("static");
    expect(parsed.amount).toBeUndefined();
    expect(parsed.tipIndicator).toBeUndefined();
    expect(parsed.tipPercentage).toBeUndefined();
    expect(parsed.tipFixed).toBeUndefined();
    
    const validation = validateQRIS(staticResult);
    expect(validation.valid).toBe(true);
    expect(staticResult.slice(-4)).toBe(parsed.crc);
  });
});
