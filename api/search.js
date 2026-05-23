export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const number =
    req.query.query ||
    req.query.search ||
    req.query.number;

  if (!number || !/^[0-9]{11,13}$/.test(number)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Number"
    });
  }

  try {

    const response = await fetch(
      `https://sim-info-api.wasif-ali.workers.dev/?search=${number}`
    );

    const data = await response.json();

    if (!data.success || !data.records?.length) {
      return res.status(404).json({
        success: false,
        message: "No Record Found"
      });
    }

    const result = data.records.map(item => ({
      name: item.name || null,
      mobile: item.mobile || null,
      cnic: item.cnic || null,
      address: item.address || null,
      network: item.network || null
    }));

    // =========================
    // 🔐 BUILD PAYLOAD
    // =========================

    const payload = {
      success: true,
      source: "SIM API",
      data: result,
      developer: "Yasir Tanveer",
      timestamp: Date.now()
    };

    // =========================
    // 🔐 SIGNATURE (INTEGRITY CHECK)
    // =========================

    payload.signature = createSignature(payload);

    return res.status(200).json(payload);

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
}
