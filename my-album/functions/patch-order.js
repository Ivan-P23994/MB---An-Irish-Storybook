const CD_UNIT = 15.00;

const COUNTRY_TO_GROUP = {
  IE: "IE_NI",
  GB: "GB",
  NL: "EU", BE: "EU", FR: "EU", ES: "EU", PT: "EU", DE: "EU",
  US: "US",
  AU: "NZ_AU", NZ: "NZ_AU",
};

const SHIPPING = {
  IE_NI: 5.50,
  GB:    7.50,
  EU:    12.00,
  US:    17.00,
  NZ_AU: 17.00,
};

function fmt(n) { return n.toFixed(2); }

export async function onRequestPost(context) {
  const { request } = context;
  const { countryCode, qty: rawQty } = await request.json();
  const qty = Math.max(1, Math.min(99, parseInt(rawQty, 10) || 1));

  const group = COUNTRY_TO_GROUP[countryCode];

  if (!group) {
    return new Response(JSON.stringify({ error: "not_supported" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const shippingAmt = SHIPPING[group];
  const cdTotal = CD_UNIT * qty;
  const total   = cdTotal + shippingAmt;

  return Response.json({
    patches: [
      {
        op: "replace",
        path: "/purchase_units/@reference_id=='default'/amount",
        value: {
          currency_code: "EUR",
          value: fmt(total),
          breakdown: {
            item_total: { currency_code: "EUR", value: fmt(cdTotal) },
            shipping:   { currency_code: "EUR", value: fmt(shippingAmt) },
          },
        },
      },
    ],
  });
}
