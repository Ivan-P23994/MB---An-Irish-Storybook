const CD_PRICE = "15.00";

const COUNTRY_TO_GROUP = {
  IE: "IE_NI",
  GB: "GB",
  NL: "EU", BE: "EU", FR: "EU", ES: "EU", PT: "EU", DE: "EU",
  US: "US",
  AU: "NZ_AU", NZ: "NZ_AU",
};

const SHIPPING = {
  IE_NI: { amount: "5.50",  total: "20.50" },
  GB:    { amount: "7.50",  total: "22.50" },
  EU:    { amount: "12.00", total: "27.00" },
  US:    { amount: "17.00", total: "32.00" },
  NZ_AU: { amount: "17.00", total: "32.00" },
};

export async function onRequestPost(context) {
  const { request } = context;
  const { countryCode } = await request.json();

  const group = COUNTRY_TO_GROUP[countryCode];

  if (!group) {
    return new Response(JSON.stringify({ error: "not_supported" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const shipping = SHIPPING[group];

  return Response.json({
    patches: [
      {
        op: "replace",
        path: "/purchase_units/@reference_id=='default'/amount",
        value: {
          currency_code: "EUR",
          value: shipping.total,
          breakdown: {
            item_total: { currency_code: "EUR", value: CD_PRICE },
            shipping:   { currency_code: "EUR", value: shipping.amount },
          },
        },
      },
    ],
  });
}
