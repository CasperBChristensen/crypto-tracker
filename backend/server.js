import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const port = 5000; // backend runs separately from React dev server

app.use(cors()); // allow React frontend to fetch from backend

const cache = {};
function setCache(key, data, ttl) {
  cache[key] = {
    data,
    expiry: Date.now() + ttl,
  };
}

function getCache(key) {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    delete cache[key];
    return null;
  }
  return entry.data;
}

// General coin prices
app.get("/api/prices", async (req, res) => {
  const { currency = "usd" } = req.query;
  const key = `prices_${currency}`;
  const cached = getCache(key);
  const now = Date.now();

  if (cached) {
    console.log(`Serving prices from cache (${currency})`);
    return res.json(cached);
  }

  try {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`;
    const response = await fetch(url);
    const data = await response.json();

    setCache(key, data, 60 * 1000); // cache 1 min
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch prices" });
  }
});

// Single coin details
app.get("/api/coin/:id", async (req, res) => {
  const { id } = req.params;
  const key = `coin_${id}`;
  const cached = getCache(key);

  if (cached) {
    console.log("Serving coin details from cached data");
    return res.json(cached);
  }

  try {
    const url = `https://api.coingecko.com/api/v3/coins/${id}?currency=usd`;
    const response = await fetch(url);
    const data = await response.json();

    setCache(key, data, 5 * 60 * 1000); // cache 5 min
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch coin details" });
  }
});

// Historical data for coin
app.get("/api/coin/:id/history", async (req, res) => {
  const { id } = req.params;
  const { days } = req.query; // e.g. ?days=30
  const key = `coin_${id}_history`;
  const cached = getCache(key);

  if (cached) {
    console.log("Serving coin history from cached data");
    return res.json(cached);
  }

  try {
    const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
    const response = await fetch(url);
    const data = await response.json();

    setCache(key, data, 10 * 60 * 1000); // cache 10 min
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch coin history" });
  }
});

// Trending coins
app.get("/api/trending", async (req, res) => {
  const key = "trending";
  const cached = getCache(key);

  if (cached) {
    console.log("Serving trending coins from cached data");
    return res.json(cached);
  }

  try {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=gecko_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`;
    const response = await fetch(url);
    const data = await response.json();

    setCache(key, data, 5 * 60 * 1000); // cache 5 min
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trending coins" });
  }
});

app.listen(port, () =>
  console.log(`✅ Backend running at http://localhost:${port}`)
);
