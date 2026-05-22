const CD_UNIT = 15.00;

const SHIPPING = {
  IE_NI: 5.50,
  GB:    7.50,
  EU:    12.00,
  US:    17.00,
  NZ_AU: 17.00,
};

function fmt(n) { return n.toFixed(2); }

export async function onRequestPost(context) {
  const { env, request } = context;

  const { country, qty: rawQty } = await request.json();
  const qty = Math.max(1, Math.min(99, parseInt(rawQty, 10) || 1));
  const shippingAmt = SHIPPING[country];

  if (shippingAmt === undefined) {
    return new Response(JSON.stringify({ error: "Invalid country" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const cdTotal = CD_UNIT * qty;
  const total   = cdTotal + shippingAmt;

  const auth = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`);

  const tokenRes = await fetch(
    "https://api-m.sandbox.paypal.com/v1/oauth2/token",
    {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    }
  );

  const { access_token } = await tokenRes.json();

  const orderRes = await fetch(
    "https://api-m.sandbox.paypal.com/v2/checkout/orders",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        application_context: {
          shipping_preference: "GET_FROM_FILE",
        },
        purchase_units: [
          {
            reference_id: "default",
            amount: {
              currency_code: "EUR",
              value: fmt(total),
              breakdown: {
                item_total: { currency_code: "EUR", value: fmt(cdTotal) },
                shipping:   { currency_code: "EUR", value: fmt(shippingAmt) },
              },
            },
            description: "An Irish Songbook — Physical CD",
            items: [
              {
                name: "An Irish Songbook",
                unit_amount: { currency_code: "EUR", value: fmt(CD_UNIT) },
                quantity: String(qty),
                category: "PHYSICAL_GOODS",
              },
            ],
          },
        ],
      }),
    }
  );

  const order = await orderRes.json();
  return Response.json(order);
}
