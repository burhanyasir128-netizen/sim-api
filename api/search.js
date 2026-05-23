const cache = new Map();

// =========================
// ⚡ CACHE GET/SET
// =========================

function getCache(key) {
  const item = cache.get(key);
  if (!item) return null;

  if (Date.now() > item.expire) {
    cache.delete(key);
    return null;
  }

  return item.data;
}

function setCache(key, data, ttl = 60000) {
  cache.set(key, {
    data,
    expire: Date.now() + ttl
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
  // ⚡ CACHE HIT (0ms response)
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
    // ⚡ FAST API CALL (4s max)
    // =========================

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      `https://sim-info-api.wasif-ali.workers.dev/?search=${number}`,
      {
        signal: controller.signal,
        headers: {
          "accept": "application/json"
        }
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
    // ⚡ CLEAN DATA (FAST MAP)
    // =========================

    const result = data.records.map(item => ({
      name: item.name || null,
      mobile: item.mobile || null,
      cnic: item.cnic || null,
      address: item.address || null,
      network: item.network || null
    }));

    // =========================
    // ⚡ STORE CACHE (FAST NEXT REQUESTS)
    // =========================

    setCache(number, result, 60000); // 60 sec cache

    return res.status(200).json({
      success: true,
      source: "api",
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
