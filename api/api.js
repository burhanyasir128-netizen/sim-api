export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");

  const input =
    req.query.query ||
    req.query.search ||
    req.query.number;

  // ✅ Validation
  if (!input || !/^[0-9]{11,13}$/.test(input)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Number"
    });
  }

  // =========================
  // ⚡ FETCH FUNCTION
  // =========================

  const fetchAPI = async (url) => {

    try {

      const response = await fetch(url);

      if (!response.ok) {
        return null;
      }

      return await response.json();

    } catch {

      return null;

    }

  };

  try {

    let records = [];

    // =========================
    // 🔥 FIRST API CALL
    // =========================

    const api1 = await fetchAPI(
      `https://sim-api.fakcloud.tech/?q=${input}`
    );

    // ✅ First API Data
    if (api1?.data?.length) {

      records = api1.data.map(item => ({

        phone: item.phone || null,
        name: item.name || null,
        cnic: item.cnic || null,
        address: item.address || null,
        network: item.network || null

      }));

    }

    // =========================
    // 🔄 SECOND API AUTO FALLBACK
    // =========================

    else {

      const api2 = await fetchAPI(
        `https://sim-info-api.wasif-ali.workers.dev/?search=${input}`
      );

      // ✅ Second API Data
      if (api2?.records?.length) {

        records = api2.records.map(item => ({

          phone: item.mobile || null,
          name: item.name || null,
          cnic: item.cnic || null,
          address: item.address || null,
          network: item.network || null

        }));

      }

    }

    // =========================
    // ❌ NO RECORD
    // =========================

    if (!records.length) {

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

      total: records.length,

      developer: "Yasir Tanveer",

      data: records,

      timestamp: new Date().toISOString()

    });

  } catch (err) {

    return res.status(500).json({

      success: false,

      message: "Server Error",

      error: err.message

    });

  }

}
