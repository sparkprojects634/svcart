export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {
    const {
      search = "",
      per_page = "20",
      page = "1",
    } = req.query;

    const consumerKey =
      process.env.WOOCOMMERCE_CONSUMER_KEY;

    const consumerSecret =
      process.env.WOOCOMMERCE_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
      return res.status(500).json({
        message:
          "WooCommerce API credentials are not configured.",
      });
    }

    const params = new URLSearchParams({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      per_page,
      page,
      status: "publish",
    });

    if (search.trim()) {
      params.set("search", search.trim());
    }

    const response = await fetch(
      `https://dashboard.svcart.shop/wp-json/wc/v3/products?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("WooCommerce API error:", error);

    return res.status(500).json({
      message: "Failed to fetch products.",
    });
  }
}