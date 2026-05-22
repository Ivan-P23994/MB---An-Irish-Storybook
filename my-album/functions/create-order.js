const CD_PRICE = "15.00";

const SHIPPING = {
  IE_NI: { amount: "5.50",  total: "20.50" },
  GB:    { amount: "7.50",  total: "22.50" },
  EU:    { amount: "12.00", total: "27.00" },
  US:    { amount: "17.00", total: "32.00" },
  NZ_AU: { amount: "17.00", total: "32.00" },
};

export async function onRequestPost(context) {
  const { env, request } = context;

  const { country } = await request.json();
  const shipping = SHIPPING[country];

  if (!shipping) {
    return new Response(JSON.stringify({ error: "Invalid country" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

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
        purchase_units: [
          {
            reference_id: "default",
            amount: {
              currency_code: "EUR",
              value: shipping.total,
              breakdown: {
                item_total: { currency_code: "EUR", value: CD_PRICE },
                shipping:   { currency_code: "EUR", value: shipping.amount },
              },
            },
            description: "An Irish Songbook — Physical CD",
            items: [
              {
                name: "An Irish Songbook",
                unit_amount: { currency_code: "EUR", value: CD_PRICE },
                quantity: "1",
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
