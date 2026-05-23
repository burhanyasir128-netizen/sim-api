export default async function handler(req, res) {

  // =========================
  // 🔒 SECURITY HEADERS
  // =========================

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Cache-Control",
    "s-maxage=60, stale-while-revalidate"
  );

  // =========================
  // ✅ ONLY GET METHOD
  // =========================

  if (req.method !== "GET") {

    return res.status(405).json({
      success: false,
      message: "Method Not Allowed"
    });

  }

  // =========================
  // ✅ GET INPUT
  // =========================

  const query =
    req.query.query ||
    req.query.search ||
    req.query.number;

  // =========================
  // ✅ VALIDATION
  // =========================

  if (
    !query ||
    typeof query !== "string" ||
    !/^[0-9]{11,13}$/.test(query)
  ) {

    return res.status(400).json({
      success: false,
      message: "Invalid Number"
    });

  }

  try {

    // =========================
    // ⚡ FAST API FETCH
    // =========================

    const controller = new AbortController();

    // ⏱️ AUTO TIMEOUT
    const timeout = setTimeout(() => {
      controller.abort();
    }, 5000);

    const response = await fetch(
      `https://sim-info-api.wasif-ali.workers.dev/?search=${query}`,
      {
        method: "GET",
        signal: controller.signal,
        headers: {
          "Accept": "application/json"
        }
      }
    );

    clearTimeout(timeout);

    // =========================
    // ❌ API ERROR
    // =========================

    if (!response.ok) {

      return res.status(502).json({
        success: false,
        message: "API Error"
      });

    }

    const data = await response.json();

    // =========================
    // ❌ NO RECORD
    // =========================

    if (
      !data.success ||
      !Array.isArray(data.records) ||
      data.records.length === 0
    ) {

      return res.status(404).json({
        success: false,
        message: "No Record Found"
      });

    }

    // =========================
    // 🧹 CLEAN RESPONSE
    // =========================

    const cleanData = data.records.map(item => ({

      name:
        item.name || null,

      mobile:
        item.mobile || null,

      cnic:
        item.cnic || null,

      address:
        item.address || null,

      network:
        item.network || null

    }));

    // =========================
    // ✅ FINAL RESPONSE
    // =========================

    return res.status(200).json({

      success: true,

      count: cleanData.length,

      data: cleanData,

      developer: "Yasir Tanveer",

      source: "SIM INFO API",

      timestamp: Date.now()

    });

  } catch (err) {

    // =========================
    // ❌ TIMEOUT
    // =========================

    if (err.name === "AbortError") {

      return res.status(408).json({
        success: false,
        message: "Request Timeout"
      });

    }

    // =========================
    // ❌ SERVER ERROR
    // =========================

    return res.status(500).json({

      success: false,

      message: "Server Error"

    });

  }

}
