export default async function handler(req, res) {

  // =========================
  // ✅ CORS
  // =========================

  res.setHeader("Access-Control-Allow-Origin", "*");

  // =========================
  // ✅ GET NUMBER
  // =========================

  const number =
    req.query.search ||
    req.query.query ||
    req.query.number;

  // =========================
  // ✅ VALIDATION
  // =========================

  if (!number || !/^[0-9]{11,13}$/.test(number)) {

    return res.status(400).json({
      success: false,
      message: "Invalid Number"
    });

  }

  try {

    // =========================
    // 🚀 API REQUEST
    // =========================

    const response = await fetch(
      `https://sim-info-api.wasif-ali.workers.dev/?search=${number}`
    );

    const data = await response.json();

    // =========================
    // ❌ NO RECORD FOUND
    // =========================

    if (
      !data.success ||
      !data.records ||
      data.records.length === 0
    ) {

      return res.status(404).json({
        success: false,
        message: "No Record Found"
      });

    }

    // =========================
    // ✅ CLEAN RESPONSE
    // =========================

    const records = data.records.map(item => ({

      name: item.name || null,

      mobile: item.mobile || null,

      cnic: item.cnic || null,

      address: item.address || null,

      network: item.network || null

    }));

    // =========================
    // ✅ FINAL RESPONSE
    // =========================

    return res.status(200).json({

      success: true,

      count: records.length,

      records,

      developer: "Yasir Tanveer",

      source: "SIM INFO API",

      timestamp: new Date().toISOString()

    });

  } catch (error) {

    // =========================
    // ❌ SERVER ERROR
    // =========================

    return res.status(500).json({

      success: false,

      message: "Server Error",

      error: error.message

    });

  }

}
