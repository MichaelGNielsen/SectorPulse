import yfinance as yf
import pandas as pd
import os

# Example ETFs for SectorPulse
ETF_WATCHLIST = {
    "Quantum Computing": "QTUM",
    "Rare Earth Elements": "REMX",
    "Clean Energy": "ICLN",
    "Global Tech": "VGT",
    "Emerging Markets": "EEM",
}


def fetch_etf_data(watchlist=ETF_WATCHLIST):
    print("[*] Fetching SectorPulse data for ETFs...")
    results = {}

    for sector, symbol in watchlist.items():
        print(f"[*] Getting data for {sector} ({symbol})...")
        ticker = yf.Ticker(symbol)

        # Get historical data (last 5 days)
        hist = ticker.history(period="5d")

        if not hist.empty:
            current_price = hist["Close"].iloc[-1]
            prev_price = hist["Close"].iloc[-2] if len(hist) > 1 else current_price
            change = ((current_price - prev_price) / prev_price) * 100

            results[symbol] = {
                "sector": sector,
                "price": round(current_price, 2),
                "daily_change_pct": round(change, 2),
                "volume": int(hist["Volume"].iloc[-1]),
            }

    # Save results for NexusCore
    # Check if running in Docker by checking for /app/logs
    data_root = "/app/logs" if os.path.exists("/app/logs") else os.path.join("logs")
    output_dir = os.path.join(data_root, "market")
    os.makedirs(output_dir, exist_ok=True)

    output_file = os.path.join(output_dir, "etf_pulse_latest.json")
    import json

    with open(output_file, "w") as f:
        json.dump(results, f, indent=4)

    print(f"[+] Successfully saved market pulse to {output_file}")
    return results


if __name__ == "__main__":
    fetch_etf_data()
