import { describe, it, expect } from "bun:test";
import {
  getMCCInfo,
  getMerchantCriteriaInfo,
  getCurrencyInfo,
  getCountryInfo,
  getAcquirerInfo,
} from "../index";

describe("lookups", () => {
  it("resolves merchant category codes (MCC)", () => {
    const restaurant = getMCCInfo("5812");
    expect(restaurant).not.toBeNull();
    expect(restaurant?.name).toContain("Restaurants");
    expect(restaurant?.nameId).toContain("Restoran");

    const grocery = getMCCInfo("5411");
    expect(grocery?.category).toBe("Food & Beverage / Retail");

    expect(getMCCInfo("999999")).toBeNull();
  });

  it("resolves merchant criteria", () => {
    const umi = getMerchantCriteriaInfo("UMI");
    expect(umi).not.toBeNull();
    expect(umi?.nameId).toBe("Usaha Mikro (UMI)");

    const spbu = getMerchantCriteriaInfo("spbu");
    expect(spbu).not.toBeNull();
    expect(spbu?.nameId).toContain("SPBU");

    expect(getMerchantCriteriaInfo("UNKNOWN")).toBeNull();
  });

  it("resolves currency codes", () => {
    const idr = getCurrencyInfo("360");
    expect(idr?.code).toBe("IDR");
    expect(idr?.symbol).toBe("Rp");

    const sgd = getCurrencyInfo("SGD");
    expect(sgd?.code).toBe("SGD");

    expect(getCurrencyInfo("999")).toBeNull();
  });

  it("resolves country codes", () => {
    const id = getCountryInfo("ID");
    expect(id?.name).toBe("Indonesia");
    expect(id?.scheme).toBe("QRIS");

    const my = getCountryInfo("MY");
    expect(my?.name).toBe("Malaysia");
    expect(my?.scheme).toContain("DuitNow");

    expect(getCountryInfo("ZZ")).toBeNull();
  });

  it("resolves acquirer NNS", () => {
    const dana = getAcquirerInfo("93600915");
    expect(dana?.name).toContain("Espay Debit Indonesia Koe");
  });
});
