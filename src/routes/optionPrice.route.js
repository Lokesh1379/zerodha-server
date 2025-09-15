// API → LTP for given tradingsymbols
expiryRouter.post("/option-prices", async (req, res) => {
  try {
    const { symbols } = req.body; // expect ["NFO:NIFTY24SEP24000CE", ...]
    if (!symbols || !symbols.length) {
      return res.status(400).json({ error: "symbols array required" });
    }

    const quotes = await kc.getQuote(symbols);
    const result = symbols.map((s) => ({
      symbol: s,
      ltp: quotes[s]?.last_price || null,
    }));

    res.json({ prices: result });
  } catch (err) {
    console.error("Error fetching LTP:", err);
    res.status(500).json({ error: "Failed to fetch option prices" });
  }
});

export default expiryRouter;
