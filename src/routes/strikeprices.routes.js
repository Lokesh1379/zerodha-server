import express from "express";
import axios from "axios";
import { parse } from "csv-parse/sync";

const optionsRouter = express.Router();

let instrumentsCache = [];
let lastFetchTime = null;

// Load instruments dump (with caching)
async function loadInstruments() {
  const now = Date.now();
  if (
    instrumentsCache.length &&
    lastFetchTime &&
    now - lastFetchTime < 60 * 60 * 1000
  ) {
    return instrumentsCache;
  }

  const response = await axios.get("https://api.kite.trade/instruments");
  const records = parse(response.data, {
    columns: true,
    skip_empty_lines: true,
  });

  instrumentsCache = records.map((row) => ({
    instrument_token: row.instrument_token,
    tradingsymbol: row.tradingsymbol,
    name: row.name,
    expiry: row.expiry,
    strike: Number(row.strike),
    instrument_type: row.instrument_type,
    segment: row.segment,
  }));

  lastFetchTime = now;
  return instrumentsCache;
}

// API: Get NIFTY options for a given expiry
optionsRouter.get("/nifty-options", async (req, res) => {
  try {
    const { expiry } = req.query;

    if (!expiry) {
      return res
        .status(400)
        .json({ error: "Expiry date (YYYY-MM-DD) is required" });
    }

    const instruments = await loadInstruments();

    const niftyOptions = instruments.filter(
      (inst) =>
        inst.segment === "NFO-OPT" &&
        inst.name === "NIFTY" &&
        inst.expiry === expiry &&
        (inst.instrument_type === "CE" || inst.instrument_type === "PE")
    );

    if (!niftyOptions.length) {
      return res.json({
        symbol: "NIFTY 50",
        expiry,
        options: [],
        message: "No options found for this expiry date",
      });
    }

    const optionsData = niftyOptions.map((opt) => ({
      tradingsymbol: opt.tradingsymbol,
      strike: opt.strike,
      type: opt.instrument_type,
      token: opt.instrument_token,
    }));

    // Sort by strike price
    optionsData.sort((a, b) => a.strike - b.strike);

    res.json({
      symbol: "NIFTY 50",
      expiry,
      options: optionsData,
    });
  } catch (err) {
    console.error("Error fetching NIFTY options:", err.message);
    res.status(500).json({ error: "Failed to fetch NIFTY options" });
  }
});

export default optionsRouter;
