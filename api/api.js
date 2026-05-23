export default async function handler(req, res) {

  // =========================
  // ⚡ ULTRA FAST API
  // =========================

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");

  // ✅ Support:
  // ?query=
  // ?search=
  // ?number=

  const input =
    req.query.query ||
    req.query.search ||
    req.query.number;

  // =========================
  // ✅ Validation
  // =========================

  if (!input || !/^[0-9]{11,13}$/.test(input)) {
    return res.status(400).json({
      status: false,
      message: "Invalid Number"
    });
  }

  // =========================
  // 🔥 FAST FETCH FUNCTION
  // =========================

  const fastFetch = async (url) => {

    const controller = new AbortController();

    // ⏱️ Timeout 5 sec
    const timeout = setTimeout(() => {
      controller.abort();
    }, 5000);

    try {

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "accept": "application/json"
        }
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error("API Failed");
      }

      return await response.json();

    } catch (err) {

      return null;

    }
  };

  try {

    // =========================
    // 🚀 BOTH APIs SAME TIME
    // =========================

    const api1 =
      fastFetch(
        `https://sim-api.fakcloud.tech/?q=${input}`
      );

    const api2 =
      fastFetch(
        `https://sim-info-api.wasif-ali.workers.dev/?search=${input}`
      );

    // ✅ Wait both
    const results = await Promise.allSettled([
      api1,
      api2
    ]);

    // =========================
    // 📦 FIND FIRST VALID DATA
    // =========================

    let records = [];

    for (const result of results) {

      if (
        result.status === "fulfilled" &&
        result.value
      ) {

        const data = result.value;

        records =
          data?.data?.records ||
          data?.data ||
          data?.records ||
          [];

        if (records.length) break;
      }
    }

    // =========================
    // ❌ No Data
    // =========================

    if (!records.length) {
      return res.status(404).json({
        status: false,
        message: "No Record Found"
      });
    }

    // =========================
    // 🧹 CLEAN DATA
    // =========================

    const cleanData = records.map(item => ({

      phone:
        item.phone ||
        item.mobile ||
        null,

      name:
        item.full_name ||
        item.name ||
        null,

      cnic:
        item.cnic ||
        item.cnic_number ||
        null,

      address:
        item.address ||
        item.location ||
        null

    }));

    // =========================
    // ✅ SUCCESS RESPONSE
    // =========================

    return res.status(200).json({

      status: true,

      developer: "Yasir Tanveer",

      total: cleanData.length,

      data: cleanData,

      timestamp: Date.now()

    });

  } catch (err) {

    // =========================
    // ❌ SERVER ERROR
    // =========================

    return res.status(500).json({
      status: false,
      message: "Server Error",
      error: err.message
    });

  }

}
