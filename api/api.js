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
  // ⚡ FAST FETCH
  // =========================

  const fastFetch = async (url) => {

    try {

      const response = await fetch(url);

      if (!response.ok) return null;

      return await response.json();

    } catch {

      return null;

    }

  };

  try {

    // =========================
    // 🚀 BOTH APIs SAME TIME
    // =========================

    const [api1, api2] = await Promise.allSettled([

      fastFetch(
        `https://sim-api.fakcloud.tech/?q=${input}`
      ),

      fastFetch(
        `https://sim-info-api.wasif-ali.workers.dev/?search=${input}`
      )

    ]);

    let records = [];

    // =========================
    // ✅ FIRST API FORMAT
    // =========================

    if (
      api1.status === "fulfilled" &&
      api1.value?.data?.length
    ) {

      records = api1.value.data.map(item => ({

        phone: item.phone || null,
        name: item.name || null,
        cnic: item.cnic || null,
        address: item.address || null,
        network: item.network || null

      }));

    }

    // =========================
    // ✅ SECOND API FORMAT
    // =========================

    else if (
      api2.status === "fulfilled" &&
      api2.value?.records?.length
    ) {

      records = api2.value.records.map(item => ({

        phone: item.mobile || null,
        name: item.name || null,
        cnic: item.cnic || null,
        address: item.address || null,
        network: item.network || null

      }));

    }

    // =========================
    // ❌ NO DATA
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
