/** A single TLV (Tag-Length-Value) element from a QRIS payload */
interface TLV {
    tag: string;
    name: string;
    length: number;
    value: string;
    children?: TLV[];
}
interface MerchantAccountInformationID {
    reverseDomain: string;
    globalID: string;
    id: string;
    type: string;
}
interface AdditionalData {
    billNumber?: string;
    mobileNumber?: string;
    storeLabel?: string;
    loyaltyNumber?: string;
    referenceLabel?: string;
    customerLabel?: string;
    terminalLabel?: string;
    purposeOfTransaction?: string;
    additionalConsumerDataRequest?: string;
    merchantTaxID?: string;
    merchantChannel?: string;
    paymentSystemSpecific?: TLV[];
    rfu?: TLV[];
}
interface MerchantInformationLanguage {
    languagePreference: string;
    merchantNameAltLanguage: string;
    merchantCityAltLanguage?: string;
    rfu?: TLV[];
}
/** Parsed QRIS data in a human-friendly structure */
interface QRISData {
    version: string;
    method: "static" | "dynamic";
    merchantAccountInfoDomestic?: MerchantAccountInformationID;
    merchantAccountInfoCentralRepository?: string;
    merchantAccountInfo?: MerchantAccountInfo[];
    merchantCategoryCode: string;
    currency: string;
    amount?: string;
    tipIndicator?: "prompt" | "fixed" | "percentage";
    tipFixed?: string;
    tipPercentage?: string;
    countryCode: string;
    merchantName: string;
    merchantCity: string;
    postalCode: string;
    additionalData?: AdditionalData;
    merchantInformationLanguage?: MerchantInformationLanguage;
    crc: string;
    raw: TLV[];
}
interface MerchantAccountInfo {
    tag: string;
    globallyUniqueId: string;
    merchantId?: string;
    merchantCriteria?: string;
    fields: TLV[];
}
interface ConvertOptions {
    amount: number;
    fee?: {
        type: "fixed" | "percentage";
        value: number;
    };
}
interface ValidationResult {
    valid: boolean;
    errors: string[];
}

/**
 * Parse a raw TLV string into an array of TLV elements.
 */
declare function parseTLV(data: string, parentTag?: string): TLV[];
/**
 * Parse a QRIS string into a structured QRISData object.
 */
declare function parseQRIS(qrisString: string): QRISData;

/**
 * Convert a static QRIS string to dynamic by injecting amount and optional fee.
 *
 * Steps:
 * 1. Parse the TLV structure
 * 2. Change Point of Initiation Method from "11" (static) to "12" (dynamic)
 * 3. Insert/replace Transaction Amount (tag 54)
 * 4. Optionally insert Tip Indicator (tag 55) and fee value (tag 56/57)
 * 5. Recalculate CRC16 checksum
 */
declare function convertQRIS(qrisString: string, options: ConvertOptions): string;
/**
 * Convert a dynamic (or static) QRIS string to a clean static QRIS.
 *
 * Steps:
 * 1. Parse the TLV structure
 * 2. Change Point of Initiation Method (tag 01) to "11" (static)
 * 3. Strip Transaction Amount (tag 54)
 * 4. Strip Tip Indicator (tag 55), Fixed Fee (tag 56), and Percentage Fee (tag 57)
 * 5. Recalculate CRC16 checksum
 */
declare function convertToStatic(qrisString: string): string;

/**
 * Validate a QRIS string for structural correctness.
 */
declare function validateQRIS(qrisString: string): ValidationResult;

/**
 * Calculate CRC16-CCITT checksum for QRIS/EMVCo QR codes.
 * Polynomial: 0x1021, Init: 0xFFFF
 */
declare function calculateCRC16(str: string): string;

interface AcquirerInfo {
    name: string;
    product: string;
}
/**
 * Get the Acquirer name and product based on an 8-digit NNS code.
 */
declare function getAcquirerInfo(nnsCode: string): AcquirerInfo | null;

var mcc = {
	"4111": {
	name: "Local/Suburban Commuter Passenger Transportation",
	nameId: "Transportasi Penumpang Komuter Lokal",
	category: "Transportation"
},
	"4121": {
	name: "Taxicabs and Limousines",
	nameId: "Taksi dan Transportasi Online",
	category: "Transportation"
},
	"4131": {
	name: "Bus Lines",
	nameId: "Layanan Bus Antarkota/Dalam Kota",
	category: "Transportation"
},
	"4789": {
	name: "Transportation Services Not Elsewhere Classified",
	nameId: "Jasa Transportasi Lainnya",
	category: "Transportation"
},
	"4814": {
	name: "Telecommunication Services",
	nameId: "Layanan Telekomunikasi & Pulsa",
	category: "Utilities & Telecommunication"
},
	"4899": {
	name: "Cable and Other Pay Television Services",
	nameId: "TV Kabel dan Layanan Berlangganan",
	category: "Utilities & Telecommunication"
},
	"4900": {
	name: "Utilities - Electric, Gas, Water, Sanitary",
	nameId: "Utilitas - Listrik (PLN), Gas, Air (PDAM)",
	category: "Utilities & Telecommunication"
},
	"5311": {
	name: "Department Stores",
	nameId: "Toko Serba Ada / Department Store",
	category: "Retail"
},
	"5331": {
	name: "Variety Stores",
	nameId: "Toko Aneka Barang / Grosir",
	category: "Retail"
},
	"5411": {
	name: "Grocery Stores, Supermarkets",
	nameId: "Supermarket, Minimarket, Toko Kelontong",
	category: "Food & Beverage / Retail"
},
	"5422": {
	name: "Freezer and Locker Meat Provisioners",
	nameId: "Toko Daging dan Frozen Food",
	category: "Food & Beverage / Retail"
},
	"5441": {
	name: "Candy, Nut, and Confectionery Stores",
	nameId: "Toko Permen dan Makanan Ringan",
	category: "Food & Beverage / Retail"
},
	"5451": {
	name: "Dairy Products Stores",
	nameId: "Toko Produk Susu & Olahan",
	category: "Food & Beverage / Retail"
},
	"5462": {
	name: "Bakeries",
	nameId: "Toko Roti dan Kue",
	category: "Food & Beverage / Retail"
},
	"5499": {
	name: "Miscellaneous Food Stores - Convenience, Markets, Specialty",
	nameId: "Warung Makan & Toko Makanan Khusus",
	category: "Food & Beverage / Retail"
},
	"5541": {
	name: "Service Stations (with or without ancillary services)",
	nameId: "SPBU / Pom Bensin",
	category: "Automotive & Fuel"
},
	"5542": {
	name: "Automated Fuel Dispensers",
	nameId: "Pengisian Bahan Bakar Otomatis",
	category: "Automotive & Fuel"
},
	"5651": {
	name: "Family Clothing Stores",
	nameId: "Toko Pakaian dan Busana",
	category: "Clothing & Apparel"
},
	"5661": {
	name: "Shoe Stores",
	nameId: "Toko Sepatu & Sandal",
	category: "Clothing & Apparel"
},
	"5811": {
	name: "Caterers",
	nameId: "Katering Makanan",
	category: "Food & Beverage"
},
	"5812": {
	name: "Eating Places and Restaurants",
	nameId: "Restoran, Rumah Makan, Kafe",
	category: "Food & Beverage"
},
	"5813": {
	name: "Drinking Places (Alcoholic Beverages), Bars, Taverns",
	nameId: "Bar, Lounge & Minuman",
	category: "Food & Beverage"
},
	"5814": {
	name: "Fast Food Restaurants",
	nameId: "Restoran Cepat Saji (Fast Food)",
	category: "Food & Beverage"
},
	"5912": {
	name: "Drug Stores and Pharmacies",
	nameId: "Apotek dan Toko Obat",
	category: "Health & Pharmacy"
},
	"5921": {
	name: "Package Stores - Beer, Wine, and Liquor",
	nameId: "Toko Minuman Khusus",
	category: "Retail"
},
	"5942": {
	name: "Book Stores",
	nameId: "Toko Buku & Alat Tulis",
	category: "Retail"
},
	"5943": {
	name: "Stationery Stores, Office and School Supply Stores",
	nameId: "Toko Alat Tulis Kantor (ATK)",
	category: "Retail"
},
	"5977": {
	name: "Cosmetic Stores",
	nameId: "Toko Kosmetik dan Perawatan Kulit",
	category: "Beauty & Personal Care"
},
	"5999": {
	name: "Miscellaneous and Specialty Retail Stores",
	nameId: "Toko Retail / Aneka Toko",
	category: "Retail"
},
	"7011": {
	name: "Hotels, Motels, and Resorts",
	nameId: "Hotel, Motel, Resor, Penginapan",
	category: "Hospitality & Travel"
},
	"7210": {
	name: "Laundry, Cleaning, and Garment Services",
	nameId: "Jasa Laundry & Cuci Pakaian",
	category: "Personal Services"
},
	"7230": {
	name: "Barber and Beauty Shops",
	nameId: "Barbershop dan Salon Kecantikan",
	category: "Beauty & Personal Care"
},
	"7299": {
	name: "Miscellaneous Personal Services",
	nameId: "Layanan Pribadi Lainnya",
	category: "Personal Services"
},
	"7399": {
	name: "Business Services Not Elsewhere Classified",
	nameId: "Jasa Bisnis Lainnya",
	category: "Business Services"
},
	"7832": {
	name: "Motion Picture Theaters",
	nameId: "Bioskop / Teater Film",
	category: "Entertainment"
},
	"7999": {
	name: "Recreation Services",
	nameId: "Layanan Hiburan dan Rekreasi",
	category: "Entertainment"
},
	"8011": {
	name: "Doctors and Physicians",
	nameId: "Dokter dan Praktik Medis",
	category: "Medical & Health"
},
	"8021": {
	name: "Dentists and Orthodontists",
	nameId: "Dokter Gigi & Ortodontis",
	category: "Medical & Health"
},
	"8062": {
	name: "Hospitals",
	nameId: "Rumah Sakit",
	category: "Medical & Health"
},
	"8099": {
	name: "Medical Services and Health Practitioners",
	nameId: "Klinik & Layanan Kesehatan",
	category: "Medical & Health"
},
	"8211": {
	name: "Elementary and Secondary Schools",
	nameId: "Sekolah Dasar dan Menengah (SD/SMP/SMA)",
	category: "Education"
},
	"8220": {
	name: "Colleges, Universities, Professional Schools",
	nameId: "Universitas & Perguruan Tinggi",
	category: "Education"
},
	"8299": {
	name: "Schools and Educational Services Not Elsewhere Classified",
	nameId: "Lembaga Kursus & Pendidikan Lainnya",
	category: "Education"
},
	"8398": {
	name: "Charitable and Social Service Organizations",
	nameId: "Organisasi Sosial, Yayasan Amal & Donasi",
	category: "Donation & Non-Profit"
},
	"8661": {
	name: "Religious Organizations",
	nameId: "Organisasi Keagamaan / Rumah Ibadah",
	category: "Donation & Non-Profit"
},
	"8999": {
	name: "Professional Services Not Elsewhere Classified",
	nameId: "Jasa Profesional Lainnya",
	category: "Professional Services"
},
	"9399": {
	name: "Government Services Not Elsewhere Classified",
	nameId: "Layanan Pemerintahan, Pajak & Retribusi",
	category: "Government & Public Services"
},
	"0742": {
	name: "Veterinary Services",
	nameId: "Jasa Dokter Hewan",
	category: "Agricultural Services"
}
};

var UMI = {
	name: "Micro Business",
	nameId: "Usaha Mikro (UMI)",
	description: "Usaha dengan kriteria mikro berdasarkan regulasi Bank Indonesia (MDR khusus)."
};
var UKE = {
	name: "Small Business",
	nameId: "Usaha Kecil (UKE)",
	description: "Usaha dengan kriteria kecil berdasarkan regulasi Bank Indonesia."
};
var UME = {
	name: "Medium Business",
	nameId: "Usaha Menengah (UME)",
	description: "Usaha dengan kriteria menengah berdasarkan regulasi Bank Indonesia."
};
var UBE = {
	name: "Large Business",
	nameId: "Usaha Besar (UBE)",
	description: "Usaha skala korporasi atau retail besar."
};
var URE = {
	name: "Regular Business",
	nameId: "Usaha Regular (URE)",
	description: "Usaha umum/regular yang tidak masuk kriteria khusus."
};
var SPBU = {
	name: "Gas / Fuel Station",
	nameId: "Stasiun Pengisian Bahan Bakar Umum (SPBU)",
	description: "Merchant penyedia bahan bakar kendaraan bermotor."
};
var BLU = {
	name: "Public Service Agency",
	nameId: "Badan Layanan Umum (BLU)",
	description: "Instansi pemerintah penyedia layanan publik."
};
var PSO = {
	name: "Public Service Obligation",
	nameId: "Public Service Obligation (PSO)",
	description: "Layanan kewajiban pelayanan publik pemerintah."
};
var G2P = {
	name: "Government to People",
	nameId: "Pemerintah ke Masyarakat (G2P)",
	description: "Penyaluran bantuan sosial atau program pemerintah."
};
var P2G = {
	name: "People to Government",
	nameId: "Masyarakat ke Pemerintah (P2G)",
	description: "Pembayaran pajak, retribusi daerah, tilang, paspor, dsb."
};
var DONASI = {
	name: "Donation / Non-Profit",
	nameId: "Donasi Sosial & Keagamaan (DONASI)",
	description: "Organisasi nirlaba, zakat, infak, sedekah, dan rumah ibadah (MDR 0%)."
};
var YAYASAN = {
	name: "Foundation / Social",
	nameId: "Yayasan Sosial (YAYASAN)",
	description: "Lembaga yayasan nirlaba sosial dan keagamaan."
};
var criteria = {
	UMI: UMI,
	UKE: UKE,
	UME: UME,
	UBE: UBE,
	URE: URE,
	SPBU: SPBU,
	BLU: BLU,
	PSO: PSO,
	G2P: G2P,
	P2G: P2G,
	DONASI: DONASI,
	YAYASAN: YAYASAN
};

var currencies = {
	"156": {
	code: "CNY",
	name: "Chinese Yuan",
	symbol: "¥",
	decimals: 2
},
	"360": {
	code: "IDR",
	name: "Indonesian Rupiah",
	symbol: "Rp",
	decimals: 2
},
	"392": {
	code: "JPY",
	name: "Japanese Yen",
	symbol: "¥",
	decimals: 0
},
	"410": {
	code: "KRW",
	name: "South Korean Won",
	symbol: "₩",
	decimals: 0
},
	"458": {
	code: "MYR",
	name: "Malaysian Ringgit",
	symbol: "RM",
	decimals: 2
},
	"682": {
	code: "SAR",
	name: "Saudi Riyal",
	symbol: "SR",
	decimals: 2
},
	"702": {
	code: "SGD",
	name: "Singapore Dollar",
	symbol: "S$",
	decimals: 2
},
	"764": {
	code: "THB",
	name: "Thai Baht",
	symbol: "฿",
	decimals: 2
},
	"784": {
	code: "AED",
	name: "UAE Dirham",
	symbol: "AED",
	decimals: 2
},
	"826": {
	code: "GBP",
	name: "British Pound",
	symbol: "£",
	decimals: 2
},
	"840": {
	code: "USD",
	name: "United States Dollar",
	symbol: "$",
	decimals: 2
},
	"978": {
	code: "EUR",
	name: "Euro",
	symbol: "€",
	decimals: 2
},
	"036": {
	code: "AUD",
	name: "Australian Dollar",
	symbol: "A$",
	decimals: 2
}
};

var ID = {
	name: "Indonesia",
	alpha3: "IDN",
	numeric: "360",
	scheme: "QRIS"
};
var SG = {
	name: "Singapore",
	alpha3: "SGP",
	numeric: "702",
	scheme: "NETS / SGQR"
};
var MY = {
	name: "Malaysia",
	alpha3: "MYS",
	numeric: "458",
	scheme: "DuitNow QR"
};
var TH = {
	name: "Thailand",
	alpha3: "THA",
	numeric: "764",
	scheme: "PromptPay"
};
var JP = {
	name: "Japan",
	alpha3: "JPN",
	numeric: "392",
	scheme: "JPQR"
};
var CN = {
	name: "China",
	alpha3: "CHN",
	numeric: "156",
	scheme: "UnionPay / Alipay / WeChat Pay"
};
var US = {
	name: "United States",
	alpha3: "USA",
	numeric: "840",
	scheme: "EMVCo"
};
var countries = {
	ID: ID,
	SG: SG,
	MY: MY,
	TH: TH,
	JP: JP,
	CN: CN,
	US: US
};

interface MCCInfo {
    name: string;
    nameId: string;
    category: string;
}
interface MerchantCriteriaInfo {
    name: string;
    nameId: string;
    description: string;
}
interface CurrencyInfo {
    code: string;
    name: string;
    symbol: string;
    decimals: number;
}
interface CountryInfo {
    name: string;
    alpha3: string;
    numeric: string;
    scheme: string;
}
/**
 * Get Merchant Category Code (MCC) information by 4-digit code.
 */
declare function getMCCInfo(code: string): MCCInfo | null;
/**
 * Get Bank Indonesia Merchant Criteria information by code (e.g. UMI, UKE, UME, UBE, SPBU).
 */
declare function getMerchantCriteriaInfo(code: string): MerchantCriteriaInfo | null;
/**
 * Get Currency information by 3-digit ISO 4217 numeric code (e.g. 360) or 3-letter alpha code (e.g. IDR).
 */
declare function getCurrencyInfo(codeOrAlpha: string): CurrencyInfo | null;
/**
 * Get Country information by 2-letter ISO 3166-1 alpha-2 code (e.g. ID, SG, MY, TH).
 */
declare function getCountryInfo(alpha2Code: string): CountryInfo | null;

export { type AcquirerInfo, type ConvertOptions, type CountryInfo, type CurrencyInfo, type MCCInfo, type MerchantAccountInfo, type MerchantCriteriaInfo, type QRISData, type TLV, type ValidationResult, calculateCRC16, convertQRIS, convertToStatic, countries as countriesData, criteria as criteriaData, currencies as currenciesData, getAcquirerInfo, getCountryInfo, getCurrencyInfo, getMCCInfo, getMerchantCriteriaInfo, mcc as mccData, parseQRIS, parseTLV, validateQRIS };
