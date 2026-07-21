import { test, expect, describe } from "bun:test";
import { validateQRIS } from "../validator";

const MOCK_STATIC_QRIS = "00020101021126660014ID.CO.QRIS.WWW01189360091100000000000215ID10200000000000303UMI51440014ID.CO.QRIS.WWW0215ID10200000000000303UMI5204581253033605802ID5919QRIS MOCK TEST GIDH6013JAKARTA SELAT6105121106304DF8C";

describe("validator", () => {
  test("validates a correct QRIS string", () => {
    const res = validateQRIS(MOCK_STATIC_QRIS);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });
  
  test("fails on bad CRC", () => {
    const badCrc = MOCK_STATIC_QRIS.slice(0, -4) + "0000";
    const res = validateQRIS(badCrc);
    expect(res.valid).toBe(false);
    expect(res.errors.some(e => e.includes("CRC mismatch"))).toBe(true);
  });
  
  test("fails if empty", () => {
    const res = validateQRIS("");
    expect(res.valid).toBe(false);
  });
});
