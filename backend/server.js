import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Handle __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Simple in-memory cache
const cache = new Map();
const requestStats = { total: 0, cached: 0, apiCalls: 0, lastReset: Date.now() };

function setCache(key, data, ttl = 10 * 60 * 1000) { // default 10 min
  cache.set(key, { data, expiry: Date.now() + ttl });
}

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

async function fetchWithRetry(url, retries = 3, backoff = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);

      if (response.status === 429) {
        console.warn(`Rate limited by API. Retrying in ${backoff / 1000} seconds...`);
        await new Promise(res => setTimeout(res, backoff));
        backoff *= 2;
        continue;
      }

      if (!response.ok) throw new Error(`API request failed with status: ${response.status}`);

      return await response.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(res => setTimeout(res, backoff));
      backoff *= 2;
    }
  }
}

async function fetchWithCache(url, cacheKey, ttl) {
  const cached = getCache(cacheKey);
  if (cached) {
    console.log(`Serving ${cacheKey} from cache`);
    return cached;
  }

  try {
    const data = await fetchWithRetry(url);
    setCache(cacheKey, data, ttl);
    return data;
  } catch (err) {
    console.error(`Error fetching ${url}:`, err);
    const cached = getCache(cacheKey);
    if (cached) {
      console.warn(`Serving stale cache for ${cacheKey}`);
      return cached;
    }
    throw err;
  }
}

// API ROUTES

// General coin prices
app.get("/api/coins", async (req, res) => {
  requestStats.total++;
  const { currency = "usd" } = req.query;
  const key = `coins_${currency}`;
  const cached = getCache(key);
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=100&page=1&sparkline=false`;

  if (cached) {
    console.log(`Serving prices from cache (${currency})`);
    return res.json(cached);
  }

  try {
    const data = await fetchWithCache(url, key, 2 * 60 * 1000); // cache 2 min
    res.json(data);
    console.log(`Fetched prices from API (${currency})`);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch coins" });
  }
});

// 2. Single coin details
app.get("/api/coin/:id", async (req, res) => {
  requestStats.total++;
  const { id } = req.params;
  const { currency = "usd" } = req.query;
  const key = `coin_${id}_${currency}`;
  const cached = getCache(key);

  if (cached) {
    console.log(`Serving coin details from cache (${id}, ${currency})`);
    return res.json(cached);
  }

  try {
    const url = `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
    const response = await fetch(url);
    const data = await response.json();
    setCache(key, data, 10 * 60 * 1000); // cache 10 min
    res.json(data);
    console.log(`Fetched coin details from API (${id}, ${currency})`);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch coin details" });
  }
});

// 3. Coin history
app.get("/api/coin/:id/history", async (req, res) => {
  const { id } = req.params;
  const { days = 30, currency = "usd" } = req.query;
  const key = `coin_${id}_history_${currency}_${days}`;
  const cached = getCache(key);

  if (cached) {
    console.log(`Serving coin history from cache (${id}, ${currency}, ${days})`);
    return res.json(cached);
  }

  try {
    const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=${currency}&days=${days}`;
    const response = await fetch(url);
    const data = await response.json();
    setCache(key, data, 10 * 60 * 1000); // cache 10 min
    res.json(data);
    console.log(`Fetched coin history from API (${id}, ${currency}, ${days})`);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch coin history" });
  }
});

// 4. Trending coins
app.get("/api/trending", async (req, res) => {
  const { currency = "usd" } = req.query;
  const key = `trending_${currency}`;
  const cached = getCache(key);
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=gecko_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`;

  if (cached) {
    console.log(`Serving trending coins from cache (${currency})`);
    return res.json(cached);
  }

  try {
    const data = await fetchWithCache(url, key, 30 * 60 * 1000, res); // cache 30 min
    res.json(data);
    console.log(`Fetched trending coins from API (${currency})`);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trending coins" });
  }
});

// 5. Request stats
app.get("/api/stats", (req, res) => {
  const hitrate = requestStats.total ? ((requestStats.cached / requestStats.total) * 100).toFixed(2) : 0;

  res.json({
    request: {
      totalRequests: requestStats.total,
      cachedResponses: requestStats.cached,
      apiCalls: requestStats.apiCalls,
      cacheHitRate: `${hitrate}%`
    },
    cache: {
      size: cache.size,
      keys: Array.from(cache.keys())
    },
    uptime: {
      hours: ((Date.now() - requestStats.lastReset) / 1000 * 60 * 60).toFixed(2),
      lastReset: new Date(requestStats.lastReset).toISOString()
    }
  });
}); 

// 6. Clear cache (for testing)
app.post("/api/clear-cache", (req, res) => {
  const startSize = cache.size;
  cache.clear();
  res.json({
    message: `Cache cleared`,
    clearedEntries: startSize
  });
});

// Serve frontend (Production)
const frontendBuildPath = path.join(__dirname, "../frontend/build");

if (process.env.NODE_ENV === "production" && fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));

  // app.get("*", (req, res) => {
  //   res.sendFile(path.join(frontendBuildPath, "index.html"));
  // });
}
else if (process.env.NODE_ENV === "production") {
  console.warn("Frontend build directory not found. Make sure to build the frontend.");
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});