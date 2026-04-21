export default async function handler(req, res) {
  // CORS (allow all)
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { query } = req.query;

  // ✅ Validation (11–13 digits only)
  if (!query || !/^[0-9]{11,13}$/.test(query)) {
    return res.status(400).json({
      status: "error",
      message: "بیٹا کوڈ نہیں نکلے گا جا کر اپنا کام کرو",
      watermark: "DB-MODS API"
    });
  }

  try {
    // 🔗 Original API call
    const apiRes = await fetch(`https://sim-api.fakcloud.tech/?q=${query}`);
    const data = await apiRes.json();

    const records = data?.data?.records || [];

    // 🧹 Clean Data
    const cleanData = records.map(item => ({
      phone: item.phone || null,
      name: item.full_name || null,
      cnic: item.cnic || null,
      address: item.address || null
    }));

    // ✅ Final Response
    return res.status(200).json({
      status: "success",
      meta: {
        count: cleanData.length,
        api: "DB-MODS API v1",
        developer: "Apna Developer",
        timestamp: new Date().toISOString()
      },
      data: cleanData,

      // 🔥 Watermark
      watermark: {
        owner: "DB-MODS",
        note: "Powered by DB-MODS API"
      }
    });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      watermark: "DB-MODS API"
    });
  }
}
