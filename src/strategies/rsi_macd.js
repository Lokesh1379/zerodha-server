// Simple RSI + MACD strategy

function calculateRSI(closes, period = 14) {
  let gains = 0,
    losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period || 1;
  const rs = avgGain / avgLoss;

  return 100 - 100 / (1 + rs);
}

function calculateEMA(values, period) {
  const k = 2 / (period + 1);
  let ema = values[0];
  for (let i = 1; i < values.length; i++) {
    ema = values[i] * k + ema * (1 - k);
  }
  return ema;
}

function calculateMACD(closes) {
  const ema12 = calculateEMA(closes.slice(-12), 12);
  const ema26 = calculateEMA(closes.slice(-26), 26);
  const macd = ema12 - ema26;
  const signal = calculateEMA([macd], 9);
  return { macd, signal };
}

export function generateSignal(data) {
  if (data.length < 30) return "HOLD";

  const closes = data.map((c) => c.close);
  const rsi = calculateRSI(closes.slice(-15), 14);
  const { macd, signal } = calculateMACD(closes);

  if (rsi < 30 && macd > signal) return "BUY";
  if (rsi > 70 && macd < signal) return "SELL";
  return "HOLD";
}
