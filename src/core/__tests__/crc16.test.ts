import { test, expect, describe } from "bun:test";
import { calculateCRC16 } from "../crc16";

describe("crc16", () => {
  test("calculates correct CRC16-CCITT-FALSE", () => {
    // Standard test vector
    const input = "00020101021126660014ID.CO.QRIS.WWW01189360091100000000000215ID10200000000000303UMI51440014ID.CO.QRIS.WWW0215ID10200000000000303UMI5204581253033605802ID5919QRIS MOCK TEST GIDH6013JAKARTA SELAT6105121106304";
    const crc = calculateCRC16(input);
    expect(crc).toBe("DF8C");
  });
});
