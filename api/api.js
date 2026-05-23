export default async function handler(req, res) {

  // =========================
  // ✅ CORS
  // =========================

  res.setHeader("Access-Control-Allow-Origin", "*");

  // =========================
  // ✅ INPUT
  // =========================

  const input =
    req.query.query ||
    req.query.search ||
    req.query.number;

  // =========================
  // ✅ VALIDATION
  // =========================

  if (!input || !/^[0-9]{11,13}$/.test(input)) {

    return res.status(400).json({
      success: false,
      message: "Invalid Number"
    });

  }

  try {

    // =========================
    // 🚀 API CALL
    // =========================

    const response = await fetch(
      `https://sim-info-api.wasif-ali.workers.dev/?search=${input}`
    );

    const data = await response.json();

    // =========================
    // ❌ NO RECORD
    // =========================

    if (
      !data.success ||
      !data.records ||
      !data.records.length
    ) {

      return res.status(404).json({
        success: false,
        message: "No Record Found"
      });

    }

    // =========================
    // ✅ FINAL RESPONSE
    // =========================

    return res.status(200).json({

      success: true,

      count: data.count,

      records: data.records.map(item => ({

        name: item.name || null,

        mobile: item.mobile || null,

        cnic: item.cnic || null,

        address: item.address || null,

        network: item.network || null

      })),

      developer: "Yasir Tanveer",

      api: "SIM INFO API",

      timestamp: new Date().toISOString()

    });

  } catch (err) {

    // =========================
    // ❌ ERROR
    // =========================

    return res.status(500).json({

      success: false,

      message: "Server Error",

      error: err.message

    });

  }

}
