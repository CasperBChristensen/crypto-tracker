import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const port = 5000; // backend runs separately from React dev server

app.use(cors()); // allow React frontend to fetch from backend

let cache = null;
let lastFetch = 0;
const CACHE_DURATION = 60 * 1000 * 5; // 5 min
const SYMBOLS = "bitcoin,ethereum,litecoin,xrp,bitcoin-cash";

app.get("/api/prices", async (req, res) => {
  const now = Date.now();

  if (!cache || now - lastFetch > CACHE_DURATION) {
    try {
      console.log("Fetching fresh prices from CoinGecko...");
      const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`;
      const response = await fetch(url);
      cache = await response.json();
      lastFetch = now;
    } catch (error) {
      console.error("Error fetching data:", error);
      return res.status(500).json({ error: "Failed to fetch prices" });
    }
  } else {
    console.log("Serving cached data");
  }
  res.json(cache);
});

app.listen(port, () =>
  console.log(`✅ Backend running at http://localhost:${port}`)
);
