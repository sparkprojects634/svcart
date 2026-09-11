export default async function handler(req, res) {
  const { path = [] } = req.query;
  const method = req.method;

  const target = `https://dashboard.svcart.shop/api.php${path.length ? "?" + path.join("&") : ""}`;

  try {
    const response = await fetch(target, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.API_KEY,   // 🔑 must be set in .env.local
        "Origin": "http://localhost:3000",  // 🔧 send origin explicitly
      },
      body: method === "POST" || method === "PUT" ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
