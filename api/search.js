export default async function handler(req, res) {

  // =========================
  // 🔒 SECURITY
  // =========================

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  // =========================
  // 🚫 BLOCK NON-GET METHODS
  // =========================

  if (req.method !== "GET") {

    return res.status(403).json({
      success: false,
      message: "Access Denied"
    });

  }

  // =========================
  // 🚫 BLOCK DIRECT FILE ACCESS
  // =========================

  const userAgent = req.headers["user-agent"] || "";

  if (
    userAgent.includes("curl") ||
    userAgent.includes("Postman") ||
    userAgent.includes("python") ||
    userAgent.includes("wget")
  ) {

    return res.status(403).json({
      success: false,
      message: "Code nikalne ki koshish mat karo 🙂"
    });

  }

  // =========================
  // ✅ INPUT
  // =========================

  const number =
    req.query.query ||
    req.query.search ||
    req.query.number;

  // =========================
  // ✅ VALIDATION
  // =========================

  if (
    !number ||
    !/^[0-9]{11,13}$/.test(number)
  ) {

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
    // ✅ RESPONSE
    // =========================

    return res.status(200).json({

      success: true,

      count: data.count,

      records: data.records,

      developer: "Yasir Tanveer",

      timestamp: new Date().toISOString()

    });

  } catch (err) {

    // =========================
    // ❌ ERROR
    // =========================

    return res.status(500).json({

      success: false,

      message: "Server Error"

    });

  }

}
