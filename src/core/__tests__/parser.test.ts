import { test, expect, describe } from "bun:test";
import { parseQRIS, parseTLV } from "../parser";

const MOCK_QRIS = "00020101021126660014ID.CO.QRIS.WWW01189360091100000000000215ID10200000000000303UMI51440014ID.CO.QRIS.WWW0215ID10200000000000303UMI5204581253033605802ID5919QRIS MOCK TEST GIDH6013JAKARTA SELAT6105121106304DF8C";

describe("parser", () => {
  test("parseTLV should extract raw AST", () => {
    const raw = parseTLV(MOCK_QRIS);
    expect(raw.length).toBeGreaterThan(0);
    const tag00 = raw.find((t) => t.tag === "00");
    expect(tag00).toBeDefined();
    expect(tag00?.value).toBe("01");
  });

  test("parseQRIS should extract structured and secondary mapping", () => {
    const parsed = parseQRIS(MOCK_QRIS);
    
    expect(parsed.version).toBe("01");
    expect(parsed.method).toBe("static");
    expect(parsed.currency).toBe("360");
    expect(parsed.countryCode).toBe("ID");
    expect(parsed.merchantName).toBe("QRIS MOCK TEST GIDH");
    expect(parsed.merchantCity).toBe("JAKARTA SELAT");
    
    // AST intact
    expect(parsed.raw).toBeArray();
    expect(parsed.raw.length).toBeGreaterThan(0);
    
    // Secondary mappings
    expect(parsed.merchantAccountInfoDomestic).toBeDefined();
    expect(parsed.merchantAccountInfoDomestic?.reverseDomain).toBe("ID.CO.QRIS.WWW");
  });
});
