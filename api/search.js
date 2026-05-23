export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");

  const query =
    req.query.query ||
    req.query.search ||
    req.query.number;

  if (!query || !/^[0-9]{11,13}$/.test(query)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Number"
    });
  }

  try {

    const response = await fetch(
      `https://sim-info-api.wasif-ali.workers.dev/?search=${query}`
    );

    const data = await response.json();

    if (!data.success || !data.records?.length) {

      return res.status(404).json({
        success: false,
        message: "No Record Found"
      });

    }

    return res.status(200).json({

      success: true,

      count: data.count,

      data: data.records,

      developer: "Yasir Tanveer",

      source: "Wasif API",

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
