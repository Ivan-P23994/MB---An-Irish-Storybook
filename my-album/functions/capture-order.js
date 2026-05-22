export async function onRequestPost(context) {
  const { env, request } = context;

  const { orderID } = await request.json();

  const auth = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`);

  const tokenRes = await fetch(
    "https://api-m.paypal.com/v1/oauth2/token",
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

  const captureRes = await fetch(
    `https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`,
      },
    }
  );

  const capture = await captureRes.json();

  return Response.json(capture);
}
