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
// 🚀 MAIN HANDLER
// =========================

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "public, max-age=60");

  const number =
    req.query.query ||
    req.query.search ||
    req.query.number;

  if (
    !number ||
    typeof number !== "string" ||
    !/^[0-9]{11,13}$/.test(number)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid Number"
    });
  }

  // =========================
  // ⚡ CACHE HIT
  // =========================

  const cached = getCache(number);

  if (cached) {
    return res.status(200).json({
      success: true,
      source: "cache",
      cached: true,
      data: cached,

      developer: {
        name: "Yasir Tanveer",
        note: "Ultra Fast Cache API"
      }
    });
  }

  try {

    // =========================
    // ⚡ API CALL
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
        message: "Upstream API Failed"
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
    // 🧹 CLEAN DATA
    // =========================

    const result = data.records.map(item => ({
      name: item.name || null,
      mobile: item.mobile || null,
      cnic: item.cnic || null,
      address: item.address || null,
      network: item.network || null
    }));

    // =========================
    // ⚡ SAVE CACHE
    // =========================

    setCache(number, result, 60000);

    // =========================
    // ✅ RESPONSE
    // =========================

    return res.status(200).json({
      success: true,
      source: "api",
      cached: false,
      data: result,

      developer: {
        name: "Yasir Tanveer",
        note: "Ultra Fast Cache API"
      }
    });

  } catch (err) {

    if (err.name === "AbortError") {
      return res.status(408).json({
        success: false,
        message: "Request Timeout"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message
    });

  }
}
