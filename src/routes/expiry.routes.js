// import express from "express";
// import axios from "axios";
// import { parse } from "csv-parse/sync";

// const expiryRouter = express.Router();

// let instrumentsCache = [];
// let lastFetchTime = null;

// // Load instruments dump (Zerodha) with cache
// async function loadInstruments() {
//   const now = Date.now();

//   if (
//     instrumentsCache.length &&
//     lastFetchTime &&
//     now - lastFetchTime < 60 * 60 * 1000 // cache valid for 1 hr
//   ) {
//     return instrumentsCache;
//   }

//   const response = await axios.get("https://api.kite.trade/instruments");

//   // Parse CSV properly
//   const records = parse(response.data, {
//     columns: true,
//     skip_empty_lines: true,
//   });

//   instrumentsCache = records.map((row) => ({
//     instrument_token: row.instrument_token,
//     exchange_token: row.exchange_token,
//     tradingsymbol: row.tradingsymbol,
//     name: row.name,
//     expiry: row.expiry,
//     strike: row.strike,
//     instrument_type: row.instrument_type,
//     segment: row.segment,
//     exchange: row.exchange,
//   }));

//   lastFetchTime = now;
//   return instrumentsCache;
// }

// // API endpoint → get NIFTY option expiries
// expiryRouter.get("/nifty-expiries", async (req, res) => {
//   try {
//     const instruments = await loadInstruments();

//     // Filter only NIFTY Options (CE/PE)
//     const niftyOptions = instruments.filter(
//       (inst) =>
//         inst.segment === "NFO-OPT" &&
//         inst.name === "NIFTY" && // strictly NIFTY only
//         (inst.instrument_type === "CE" || inst.instrument_type === "PE")
//     );

//     // Extract unique expiry dates
//     const expiries = [...new Set(niftyOptions.map((i) => i.expiry))].sort();

//     res.json({ symbol: "NIFTY 50", expiries });
//   } catch (err) {
//     console.error("Error fetching expiries:", err.message);
//     res.status(500).json({ error: "Failed to fetch expiry dates" });
//   }
// });

// export default expiryRouter;

// // src/routes/instruments.js
// import express from "express";
// import axios from "axios";
// import { kc } from "./auth.route.js";

// const expiryRouter = express.Router();

// let instrumentsCache = [];
// let lastFetchTime = null;

// // Load instruments dump
// async function loadInstruments() {
//   const now = Date.now();
//   if (
//     instrumentsCache.length &&
//     lastFetchTime &&
//     now - lastFetchTime < 60 * 60 * 1000
//   ) {
//     return instrumentsCache;
//   }

//   const response = await axios.get("https://api.kite.trade/instruments");
//   const rows = response.data.split("\n").slice(1);
//   const instruments = rows.map((line) => {
//     const cols = line.split(",");
//     return {
//       instrument_token: cols[0],
//       exchange_token: cols[1],
//       tradingsymbol: cols[2],
//       name: cols[3],
//       expiry: cols[5],
//       strike: parseFloat(cols[6]),
//       instrument_type: cols[9],
//       segment: cols[10],
//       exchange: cols[11],
//     };
//   });

//   instrumentsCache = instruments;
//   lastFetchTime = now;
//   return instruments;
// }

// // API → NIFTY option expiries
// expiryRouter.get("/nifty-expiries", async (req, res) => {
//   try {
//     const instruments = await loadInstruments();

//     const niftyOptions = instruments.filter(
//       (inst) =>
//         inst.segment === "NFO-OPT" &&
//         inst.name === "NIFTY" &&
//         (inst.instrument_type === "CE" || inst.instrument_type === "PE")
//     );

//     const expiries = [...new Set(niftyOptions.map((i) => i.expiry))].sort();
//     res.json({ symbol: "NIFTY 50", expiries });
//   } catch (err) {
//     console.error("Error fetching expiries:", err);
//     res.status(500).json({ error: "Failed to fetch expiry dates" });
//   }
// });

// // API → Options by expiry
// expiryRouter.get("/nifty-options", async (req, res) => {
//   try {
//     const { expiry } = req.query;
//     if (!expiry) return res.status(400).json({ error: "expiry is required" });

//     const instruments = await loadInstruments();
//     const niftyOptions = instruments.filter(
//       (inst) =>
//         inst.segment === "NFO-OPT" &&
//         inst.name === "NIFTY" &&
//         inst.expiry === expiry &&
//         (inst.instrument_type === "CE" || inst.instrument_type === "PE")
//     );

//     res.json({ options: niftyOptions });
//   } catch (err) {
//     console.error("Error fetching options:", err);
//     res.status(500).json({ error: "Failed to fetch options" });
//   }
// });

// // API → LTP for given tradingsymbols
// expiryRouter.post("/option-prices", async (req, res) => {
//   try {
//     const { symbols } = req.body; // expect ["NFO:NIFTY24SEP24000CE", ...]
//     if (!symbols || !symbols.length) {
//       return res.status(400).json({ error: "symbols array required" });
//     }

//     const quotes = await kc.getQuote(symbols);
//     const result = symbols.map((s) => ({
//       symbol: s,
//       ltp: quotes[s]?.last_price || null,
//     }));

//     res.json({ prices: result });
//   } catch (err) {
//     console.error("Error fetching LTP:", err);
//     res.status(500).json({ error: "Failed to fetch option prices" });
//   }
// });

// export default expiryRouter;

import express from "express";
import axios from "axios";
import { parse } from "csv-parse/sync";
import { kc } from "../routes/auth.route.js"; // make sure KiteConnect is initialized

const expiryRouter = express.Router();

let instrumentsCache = [];
let lastFetchTime = null;

// Load instruments dump (Zerodha) with cache
async function loadInstruments() {
  const now = Date.now();

  if (
    instrumentsCache.length &&
    lastFetchTime &&
    now - lastFetchTime < 60 * 60 * 1000 // cache valid for 1 hr
  ) {
    return instrumentsCache;
  }

  const response = await axios.get("https://api.kite.trade/instruments");

  // Parse CSV properly
  const records = parse(response.data, {
    columns: true,
    skip_empty_lines: true,
  });

  instrumentsCache = records.map((row) => ({
    instrument_token: row.instrument_token,
    exchange_token: row.exchange_token,
    tradingsymbol: row.tradingsymbol,
    name: row.name,
    expiry: row.expiry,
    strike: parseFloat(row.strike),
    instrument_type: row.instrument_type,
    segment: row.segment,
    exchange: row.exchange,
  }));

  lastFetchTime = now;
  return instrumentsCache;
}

// ✅ API endpoint → get NIFTY option expiries
expiryRouter.get("/nifty-expiries", async (req, res) => {
  try {
    const instruments = await loadInstruments();

    // Filter only NIFTY Options (CE/PE)
    const niftyOptions = instruments.filter(
      (inst) =>
        inst.segment === "NFO-OPT" &&
        inst.name === "NIFTY" &&
        (inst.instrument_type === "CE" || inst.instrument_type === "PE")
    );

    // Extract unique expiry dates
    const expiries = [...new Set(niftyOptions.map((i) => i.expiry))].sort();

    res.json({ symbol: "NIFTY 50", expiries });
  } catch (err) {
    console.error("Error fetching expiries:", err.message);
    res.status(500).json({ error: "Failed to fetch expiry dates" });
  }
});

// ✅ API endpoint → get NIFTY options by expiry
expiryRouter.get("/nifty-options", async (req, res) => {
  try {
    const { expiry } = req.query;
    if (!expiry) {
      return res.status(400).json({ error: "expiry is required" });
    }

    const instruments = await loadInstruments();
    const niftyOptions = instruments.filter(
      (inst) =>
        inst.segment === "NFO-OPT" &&
        inst.name === "NIFTY" &&
        inst.expiry === expiry &&
        (inst.instrument_type === "CE" || inst.instrument_type === "PE")
    );

    res.json({ options: niftyOptions });
  } catch (err) {
    console.error("Error fetching options:", err.message);
    res.status(500).json({ error: "Failed to fetch options" });
  }
});

// ✅ API endpoint → get LTP (Last Traded Price) for given option symbols
expiryRouter.post("/option-prices", async (req, res) => {
  try {
    const { symbols } = req.body; // expect ["NFO:NIFTY24SEP24000CE", ...]
    if (!symbols || !symbols.length) {
      return res.status(400).json({ error: "symbols array required" });
    }
    // Call Kite Connect quotes API
    const quotes = await kc.getQuote(symbols);

    const result = symbols.map((s) => ({
      symbol: s,
      ltp: quotes[s]?.last_price || null,
    }));

    res.json({ prices: result });
  } catch (err) {
    console.error("Error fetching LTP:", err.message);
    res.status(500).json({ error: "Failed to fetch option prices" });
  }
});

export default expiryRouter;
