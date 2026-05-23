export default async function handler(req, res) {

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");

  // ✅ Dono support karega
  // ?query=03001234567
  // ?search=03001234567

  const input =
    req.query.query ||
    req.query.search;

  // ✅ Validation
  if (!input || !/^[0-9]{11,13}$/.test(input)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid Number",
      watermark: "Yasir Tanveer"
    });
  }

  try {

    // =========================
    // 🔥 BOTH APIs SAME TIME
    // =========================

    const api1 = fetch(
      `https://sim-api.fakcloud.tech/?q=${input}`
    ).then(res => res.json());

    const api2 = fetch(
      `https://sim-info-api.wasif-ali.workers.dev/?search=${input}`
    ).then(res => res.json());

    // ✅ Jo API pehle response de
    const data = await Promise.race([
      api1,
      api2
    ]);

    // =========================
    // 📦 Extract Records
    // =========================

    const records =
      data?.data?.records ||
      data?.data ||
      data?.records ||
      [];

    // ❌ No Record
    if (!records.length) {
      return res.status(404).json({
        status: "error",
        message: "No Record Found",
        watermark: "Yasir Tanveer"
      });
    }

    // =========================
    // 🧹 Clean Data
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
        null
    }));

    // =========================
    // ✅ Response
    // =========================

    return res.status(200).json({
      status: "success",

      meta: {
        count: cleanData.length,
        api: "DB-MODS API v4",
        developer: "Yasir Tanveer",
        timestamp: new Date().toISOString()
      },

      data: cleanData,

      watermark: {
        owner: "Yasir Tanveer",
        note: "Powered by Yasir Tanveer"
      }

    });

  } catch (err) {

    return res.status(500).json({
      status: "error",
      message: "Both APIs Failed",
      error: err.message,
      watermark: "Yasir Tanveer"
    });

  }

}
