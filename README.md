<p align="center">
  <h1 align="center">QRIS Utility</h1>
  <p align="center">
    A comprehensive toolkit for Indonesian QRIS codes: parse, validate, dynamically inject amounts, and identify acquirers with lossless AST decoding.
  </p>
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#demo">Demo</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#cli-usage">CLI</a> •
    <a href="#api-reference">API</a> •
    <a href="#how-it-works">How It Works</a> •
    <a href="#contributing">Contributing</a>
  </p>
  <p align="center">
    <img src="https://img.shields.io/github/stars/aryomuzakki/qris-utility?style=flat-square" alt="Stars" />
    <img src="https://img.shields.io/github/license/aryomuzakki/qris-utility?style=flat-square" alt="License" />
    <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/react-%2361DAFB.svg?style=flat-square&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  </p>
</p>

---

> **Note:** This project is a hard fork and significant evolution of the original [qris-dinamis](https://github.com/verssache/qris-dinamis) by [verssache](https://github.com/verssache). It has been transformed into a fully modular NPM package with advanced lossless AST parsing, comprehensive NNS mapping, and strongly-typed data structures.

## What is QRIS?

**QRIS** (Quick Response Code Indonesian Standard) is a unified QR code payment standard developed by Bank Indonesia. It enables interoperable payments across all payment providers (GoPay, OVO, DANA, ShopeePay, bank apps, etc.) through a single QR code.

There are two types of QRIS:

| Type        | Description                                                                      |
| ----------- | -------------------------------------------------------------------------------- |
| **Static**  | QR code without a fixed amount — the customer enters the payment amount manually |
| **Dynamic** | QR code with a pre-set amount — the customer simply scans and pays               |

This tool provides everything you need to decode, inspect, and modify QRIS strings programmatically. It can also seamlessly convert **Static → Dynamic** QR codes by injecting a transaction amount (and optional service fee) into the QRIS payload and recalculating the CRC16 checksum.

## Features

- **QRIS Parser** — Decode any QRIS string into a structured, human-readable format (merchant name, city, category, issuer, etc.)
- **AST Tree Viewer** — Parses the full TLV (Tag-Length-Value) structure without data loss. Deeply nested tags (26-51, 62, 64) are handled natively.
- **Acquirer NNS Lookup** — Identifies the Bank or Payment Provider (e.g., BRI, Mandiri, ShopeePay) using the 8-digit NNS code.
- **Static → Dynamic Converter** — Inject amount and optional service fees into a static QRIS.
- **QRIS Validator** — Validate QRIS string structure and CRC16 checksum integrity.
- **QR Image Upload** — Upload or drag & drop a QR code image to extract the QRIS data.
- **Camera Scanner** — Scan QRIS codes directly using your device camera.
- **Clipboard Paste** — Paste a screenshot containing a QR code (Ctrl+V / Cmd+V).
- **QR Code Generator** — Generate a downloadable QR code image from the converted result.
- **Dark / Light Mode** — Follows system preference, toggleable.
- **Responsive Design** — Works seamlessly on desktop and mobile.
- **CLI Tool** — Command-line interface for quick conversions in the terminal.
- **NPM Package** — Can be installed and used in Node.js, browsers, or other JavaScript environments.

## Demo

### Web App

> **[Live Demo](https://qris-utility.muzakki.id)**

### CLI

```
╔══════════════════════════════════════════════╗
║   QRIS Static → Dynamic Converter            ║
╚══════════════════════════════════════════════╝

[?] Input QRIS string: 00020101021126570011ID.DANA.WWW...
[✓] QRIS Parsed:
    Merchant : Warung Sayur
    City     : Kab. Demak
    Method   : static
    Currency : IDR

[?] Input nominal (Rupiah): 25000
[?] Add service fee? (y/n): n

╔══════════════════════════════════════════════╗
║   Result                                     ║
╚══════════════════════════════════════════════╝

00020101021226570011ID.DANA.WWW...6304XXXX
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (Recommended) or Node.js >= 18

### Installation

```bash
git clone https://github.com/aryomuzakki/qris-utility.git
cd qris-utility
bun install
```

### Run Web App (Development)

```bash
bun run dev
```

Opens at `http://localhost:5173`

### Build for Production

This project builds two artifacts: the NPM core library (`dist-core/`) and the React Web App (`dist/`).

```bash
bun run build
bun run preview
```

## Usage as NPM Package

You can install `qris-utility` into your own projects:

```bash
npm install qris-utility
# or
bun add qris-utility
```

## CLI Usage

If you have cloned the repository, you can use the CLI interactively:

```bash
bun run cli
```

The CLI will prompt you for:

1. QRIS string input
2. Transaction amount (Rupiah)
3. Optional service fee (fixed or percentage)

### Quick One-liner with `tsx`

```bash
npx tsx src/cli.ts
```

## API Reference

The core library is exported for programmatic use:

### `parseQRIS(qrisString)`

Parse a QRIS string into a structured object, retaining both typed mappings and the raw TLV AST.

```typescript
import { parseQRIS } from "qris-utility";

const data = parseQRIS("00020101021126570011ID.DANA.WWW...");

console.log(data.merchantName); // "Warung Sayur"
console.log(data.merchantCity); // "Kab. Demak"
console.log(data.method); // "static"
console.log(data.currency); // "360"
```

**Returns:** `QRISData`

| Field                  | Type                    | Description                                 |
| ---------------------- | ----------------------- | ------------------------------------------- |
| `version`              | `string`                | Payload format indicator                    |
| `method`               | `"static" \| "dynamic"` | Point of initiation method                  |
| `merchantName`         | `string`                | Merchant name                               |
| `merchantCity`         | `string`                | Merchant city                               |
| `merchantCategoryCode` | `string`                | MCC code                                    |
| `currency`             | `string`                | Transaction currency code (360 = IDR)       |
| `amount`               | `string?`               | Transaction amount (dynamic only)           |
| `merchantAccountInfo`  | `MerchantAccountInfo[]` | Payment provider details                    |
| `raw`                  | `TLV[]`                 | The fully parsed nested TLV tree (lossless) |

### `getAcquirerInfo(nnsCode)`

Takes an 8-digit NNS code (National Numeric Standard) and returns the corresponding acquirer information.

```typescript
import { getAcquirerInfo } from "qris-utility";

const acquirer = getAcquirerInfo("93600915");
console.log(acquirer?.name); // "PT Espay Debit Indonesia Koe"
console.log(acquirer?.product); // "Dana"
```

### `convertQRIS(qrisString, options)`

Convert a static QRIS to dynamic.

```typescript
import { convertQRIS } from "qris-utility";

// Basic conversion
const result = convertQRIS(qrisString, { amount: 50000 });

// With fixed service fee
const withFee = convertQRIS(qrisString, {
  amount: 50000,
  fee: { type: "fixed", value: 1000 },
});

// With percentage fee
const withPercent = convertQRIS(qrisString, {
  amount: 50000,
  fee: { type: "percentage", value: 2.5 },
});
```

### `validateQRIS(qrisString)`

Validate a QRIS string for structural correctness and CRC integrity.

```typescript
import { validateQRIS } from "qris-utility";

const result = validateQRIS(qrisString);

if (!result.valid) {
  console.log(result.errors);
  // ["CRC mismatch: expected A1B2, got C3D4"]
}
```

### `parseTLV(data)`

Low-level TLV parser for EMVCo QR code payloads. Handles nested tags intelligently.

```typescript
import { parseTLV } from "qris-utility";

const elements = parseTLV(qrisString);
// [{ tag: "00", name: "Payload Format Indicator", length: 2, value: "01" }, ...]
```

## How It Works

QRIS follows the [EMVCo QR Code Specification](https://www.emvco.com/emv-technologies/qrcodes/) using a **TLV (Tag-Length-Value)** encoding:

```
[Tag: 2 digits][Length: 2 digits][Value: variable]
```

### Conversion Process

```
Static QRIS
    │
    ▼
┌─────────────────────────────┐
│ 1. Parse TLV structure      │
│ 2. Change tag 01: 11 → 12   │  (static → dynamic)
│ 3. Insert tag 54: amount     │  (transaction amount)
│ 4. Insert tag 55/56/57: fee  │  (optional service fee)
│ 5. Recalculate CRC16 (6304)  │
└─────────────────────────────┘
    │
    ▼
Dynamic QRIS
```

### Key QRIS Tags

| Tag     | Name                     | Example                           |
| ------- | ------------------------ | --------------------------------- |
| `00`    | Payload Format Indicator | `01`                              |
| `01`    | Point of Initiation      | `11` (static) / `12` (dynamic)    |
| `26-51` | Merchant Account Info    | Contains provider ID, merchant ID |
| `52`    | Merchant Category Code   | `5812` (Restaurant)               |
| `53`    | Currency                 | `360` (IDR)                       |
| `54`    | Transaction Amount       | `50000`                           |
| `55`    | Tip Indicator            | `02` (fixed) / `03` (percentage)  |
| `56`    | Fixed Fee                | `1000`                            |
| `57`    | Percentage Fee           | `2.5`                             |
| `58`    | Country Code             | `ID`                              |
| `59`    | Merchant Name            | `Warung Sayur Bu Sugeng`          |
| `60`    | Merchant City            | `Kab. Demak`                      |
| `63`    | CRC16 Checksum           | `58C7`                            |

## Tech Stack

| Layer         | Technology   |
| ------------- | ------------ |
| Language      | TypeScript   |
| Web Framework | React 19     |
| Build Tool    | Vite & Tsup  |
| Styling       | Tailwind CSS |
| QR Decode     | jsQR         |
| QR Generate   | qrcode       |
| Testing       | bun test     |

## Project Structure

```
qris-utility/
├── src/
│   ├── core/                # Core library (framework-agnostic NPM package)
│   │   ├── types.ts         # Type definitions
│   │   ├── parser.ts        # QRIS TLV parser
│   │   ├── converter.ts     # Static → Dynamic converter
│   │   ├── validator.ts     # QRIS validation
│   │   ├── crc16.ts         # CRC16-CCITT checksum
│   │   ├── nns.json         # Bank Indonesia NNS Acquirer list
│   │   ├── nns.ts           # NNS Lookup helpers
│   │   ├── __tests__/       # Test suite
│   │   └── index.ts         # Public API exports
│   ├── cli.ts               # CLI entry point
│   └── web/                 # React web application
│       ├── App.tsx          # Main app component
│       ├── index.css        # Tailwind styles
│       └── components/      # UI components (QRISInfo, ConvertForm, etc.)
├── package.json
├── tsup.config.ts           # Bundler for the core NPM package
├── tsconfig.json
└── vite.config.ts           # Bundler for the web app
```

## Contributing

Contributions are always welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m "Add my feature"`
4. **Push** to the branch: `git push origin feature/my-feature`
5. **Open** a Pull Request

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/aryomuzakki">Aryo Muzakki</a>
</p>
