// frontend/src/config.js
export const BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? "" // relative (when deployed together)
    : "http://localhost:5000"; // dev backend

export const COINS_LIST = (currency) =>
  `${BACKEND_URL}/api/coins?currency=${currency}`;

export const SINGLE_COIN = (id, currency) =>
  `${BACKEND_URL}/api/coin/${id}?currency=${currency}`;

export const COIN_HISTORY = (id, days, currency) =>
  `${BACKEND_URL}/api/coin/${id}/history?days=${days}&currency=${currency}`;

export const TRENDING_COINS = (currency) =>
  `${BACKEND_URL}/api/trending?currency=${currency}`;
