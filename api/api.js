export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { query } = req.query;

  // ✅ Validation
  if (!query || !/^[0-9]{11,13}$/.test(query)) {
    return res.status(400).json({
      status: "error",
      message: "بیٹا کوڈ نہیں نکلے گا جا کر اپنا کام کرو",
      watermark: "DB-MODS API"
    });
  }

  try {
    let records = [];

    // =========================
    // 🔹 FIRST API
    // =========================
    try {
      const apiRes1 = await fetch(
        `https://sim-api.fakcloud.tech/?q=${query}`
      );

      const data1 = await apiRes1.json();

      records = data1?.data?.records || [];

    } catch (err) {
      console.log("First API Failed");
    }

    // =========================
    // 🔹 SECOND API (Fallback)
    // =========================
    if (!records || records.length === 0) {

      try {
        const apiRes2 = await fetch(
          `https://sim-info-api.wasif-ali.workers.dev/?search=${query}`
        );

        const data2 = await apiRes2.json();

        // Adjust according to second API response
        records = data2?.data || data2?.records || [];

      } catch (err) {
        console.log("Second API Failed");
      }
    }

    // =========================
    // ❌ No Data Found
    // =========================
    if (!records || records.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No record found",
        watermark: "Yasir Tanveer"
      });
    }

    // =========================
    // 🧹 Clean Data
    // =========================
    const cleanData = records.map(item => ({
      phone: item.phone || item.mobile || null,
      name: item.full_name || item.name || null,
      cnic: item.cnic || item.cnic_number || null,
      address: item.address || null
    }));

    // =========================
    // ✅ Final Response
    // =========================
    return res.status(200).json({
      status: "success",
      meta: {
        count: cleanData.length,
        api: "DB-MODS API v2",
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
      message: "Server error",
      error: err.message,
      watermark: "Yasir Tanveer"
    });

  }
}
