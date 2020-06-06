const names = {
  "core": "Core",
  "core|availability-check": "Availability Check",
  "core|availability-check|availability-confirmed": "Occupancy in C1 and C2 matches feed",
  "core|availability-check|conflicting-seller": "SellerMismatchError for inconsistent Sellers of OrderItems",
  "core|availability-check|feature-required-noop": "Feature required",
  "core|dataset-site": "Dataset Site",
  "core|dataset-site|dataset-site-jsonld-valid": "Dataset Site JSON-LD valid",
  "core|dataset-site|feature-required-noop": "Feature required",
  "payment": "Payment",
  "payment|simple-book-with-payment": "Simple Booking of paid opportunities",
  "payment|simple-book-with-payment|with-payment-property": "Successful booking with payment property",
  "payment|simple-book-with-payment|no-paid-bookable-sessions": "No paid bookable sessions"
}

function lookup(name) {
  let val = names[name];
  if (val) return val;

  return `!!!${name}!!!`
}

function reverse(name) {

}

module.exports = {
  lookup,
  reverse
}
