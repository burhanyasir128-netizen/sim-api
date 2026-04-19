export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { query } = req.query;

  if (!query || !/^[0-9]{11,13}$/.test(query)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid query"
    });
  }

  try {
    const apiRes = await fetch(`https://sim-api.fakcloud.tech/?q=${query}`);
    const data = await apiRes.json();

    const records = data?.data?.records || [];

    const cleanData = records.map(item => ({
      phone: item.phone,
      name: item.full_name,
      cnic: item.cnic,
      address: item.address
    }));

    return res.status(200).json({
      status: "success",
      count: cleanData.length,
      data: cleanData
    });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
  }
