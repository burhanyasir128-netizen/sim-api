const cache = new Map();

// =========================
// ⚡ CACHE SYSTEM
// =========================

function getCache(key) {
  const item = cache.get(key);

  if (!item) return null;

  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }

  return item.data;
}

function setCache(key, data, ttl = 60000) {
  cache.set(key, {
    data,
    expiry: Date.now() + ttl
  });
}

// =========================
// 🚀 HANDLER
// =========================

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const number =
    req.query.query ||
    req.query.search ||
    req.query.number;

  if (!number || !/^[0-9]{11,13}$/.test(number)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Number"
    });
  }

  // =========================
  // ⚡ 1. CACHE HIT (0–5ms)
  // =========================

  const cached = getCache(number);

  if (cached) {
    return res.status(200).json({
      success: true,
      source: "cache",
      data: cached
    });
  }

  try {

    // =========================
    // ⚡ 2. FETCH API
    // =========================

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      `https://sim-info-api.wasif-ali.workers.dev/?search=${number}`,
      {
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        message: "API Error"
      });
    }

    const data = await response.json();

    if (!data.success || !data.records?.length) {
      return res.status(404).json({
        success: false,
        message: "No Record Found"
      });
    }

    // =========================
    // ⚡ 3. CLEAN DATA
    // =========================

    const result = data.records.map(item => ({
      name: item.name || null,
      mobile: item.mobile || null,
      cnic: item.cnic || null,
      address: item.address || null,
      network: item.network || null
    }));

    // =========================
    // ⚡ 4. STORE CACHE (1 min)
    // =========================

    setCache(number, result, 60000);

    // =========================
    // ⚡ RESPONSE
    // =========================

    return res.status(200).json({
      success: true,
      source: "api",
      cached: false,
      data: result
    });

  } catch (err) {

    if (err.name === "AbortError") {
      return res.status(408).json({
        success: false,
        message: "Timeout"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
}
