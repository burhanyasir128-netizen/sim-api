export default async function handler(req, res) {

  // =========================
  // ⚡ ULTRA FAST + SECURE API
  // =========================

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
  res.setHeader("Content-Type", "application/json");

  // =========================
  // ✅ ONLY GET
  // =========================

  if (req.method !== "GET") {

    return res.status(405).json({
      success: false,
      message: "Method Not Allowed"
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
    typeof number !== "string" ||
    !/^[0-9]{11,13}$/.test(number)
  ) {

    return res.status(400).json({
      success: false,
      message: "Invalid Number"
    });

  }

  try {

    // =========================
    // ⚡ FAST FETCH
    // =========================

    const response = await fetch(
      `https://sim-info-api.wasif-ali.workers.dev/?search=${number}`,
      {
        headers: {
          accept: "application/json"
        },

        // ⚡ KEEP CONNECTION FAST
        cache: "no-store"
      }
    );

    // =========================
    // ❌ API FAILED
    // =========================

    if (!response.ok) {

      return res.status(502).json({
        success: false,
        message: "API Failed"
      });

    }

    const data = await response.json();

    // =========================
    // ❌ NO RECORD
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
    // ⚡ RETURN DIRECT DATA
    // =========================

    return res.status(200).json({

      success: true,

      count: data.count,

      records: data.records,

      response_time: `${Date.now()}ms`

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
