
const fs = require('fs');
const mkdirp = require('mkdirp')

const FEATURES_ROOT = "./test/features/";

const features = [
  {
    "category": "core",
    "identifier": "opportunity-feed",
    "name": "RPDE Opportunity Feed",
    "required": "Required",
    "description": "Real-time opportunity data",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#definition-of-a-bookable-opportunity-and-offer-pair",
    "requiredCondition": "",
    "tutorial": "https://tutorials.openactive.io/open-booking-sdk/quick-start-guide/storebookingengine/day-2-open-data-feeds"
  },
  {
    "category": "core",
    "identifier": "dataset-site",
    "name": "Dataset Site",
    "required": "Required",
    "description": "Discoverable open data",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#endpoints",
    "requiredCondition": "",
    "tutorial": "https://tutorials.openactive.io/open-booking-sdk/quick-start-guide/storebookingengine/day-2-open-data-feeds"
  },
  {
    "category": "core",
    "identifier": "availability-check",
    "name": "Availability Checking",
    "required": "Required",
    "description": "Runs only C1 and C2, to confirm availability checks work as expected",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#step-by-step-process-description-0",
    "requiredCondition": "",
    "tutorial": "https://tutorials.openactive.io/open-booking-sdk/quick-start-guide/storebookingengine/day-4-c1-and-c2-without-leases"
  },
  {
    "category": "core",
    "identifier": "amending-order-quote",
    "name": "Amending the OrderQuote before B",
    "required": "Required",
    "description": "Allows the basket to be updated for a particular order",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#amending-the-orderquote-before-b",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "core",
    "identifier": "simple-book-free-opportunities",
    "name": "Simple Booking of free opportunities",
    "required": "Required",
    "description": "The most simple form of booking, for free opportunities. Does not check for leases.",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#free-opportunities",
    "requiredCondition": "",
    "tutorial": "https://tutorials.openactive.io/open-booking-sdk/quick-start-guide/storebookingengine/day-5-b-and-delete-order"
  },
  {
    "category": "core",
    "identifier": "order-deletion",
    "name": "Order Deletion Endpoint",
    "required": "Required",
    "description": "Check that Order Deletion correctly soft-deletes an Order that has already been emitted in the Orders feed",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#order-deletion",
    "requiredCondition": "",
    "tutorial": "https://tutorials.openactive.io/open-booking-sdk/quick-start-guide/storebookingengine/day-6-orders-feed"
  },
  {
    "category": "core",
    "identifier": "agent-broker",
    "name": "AgentBroker mode",
    "required": "Required",
    "description": "Support for AgentBroker mode",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#agentbroker",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "payment",
    "identifier": "simple-book-with-payment",
    "name": "Simple Booking with Payment",
    "required": "Optional",
    "description": "The most simple form of booking with payment. Does not check for leases.",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#step-by-step-process-description",
    "requiredCondition": "",
    "tutorial": "https://tutorials.openactive.io/open-booking-sdk/quick-start-guide/storebookingengine/day-5-b-and-delete-order"
  },
  {
    "category": "payment",
    "identifier": "payment-reconciliation-detail-validation",
    "name": "Payment reconciliation detail validation",
    "required": "Optional",
    "description": "Booking with valid, invalid, and missing Payment details",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#payment-reconciliation-detail-validation",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "restriction",
    "identifier": "booking-window",
    "name": "validFromBeforeStartDate booking window",
    "required": "Optional",
    "description": "Duration of window before an opportunity where it is bookable",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#definition-of-a-bookable-opportunity-and-offer-pair",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "cancellation",
    "identifier": "customer-requested-cancellation",
    "name": "Customer Requested Cancellation",
    "required": "Optional",
    "description": "Cancellation triggered by the Customer through the Broker",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#customer-requested-cancellation",
    "requiredCondition": "",
    "tutorial": "https://tutorials.openactive.io/open-booking-sdk/quick-start-guide/storebookingengine/day-7-cancellation"
  },
  {
    "category": "cancellation",
    "identifier": "cancellation-window",
    "name": "latestCancellationBeforeStartDate cancellation window",
    "required": "Optional",
    "description": "A defined window before the event occurs where it can be cancelled without fees",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#customer-requested-cancellation",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "cancellation",
    "identifier": "seller-requested-cancellation",
    "name": "Seller Requested Cancellation",
    "required": "Optional",
    "description": "Cancellation triggered by the Seller through the Booking System",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#seller-requested-cancellation",
    "requiredCondition": "",
    "tutorial": "https://tutorials.openactive.io/open-booking-sdk/quick-start-guide/storebookingengine/day-6-orders-feed"
  },
  {
    "category": "cancellation",
    "identifier": "seller-requested-cancellation-message",
    "name": "cancellationMessage for Seller Requested Cancellation",
    "required": "Optional",
    "description": "A message associated with a Cancellation triggered by the Seller through the Booking System",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#seller-requested-cancellation",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "cancellation",
    "identifier": "seller-requested-replacement",
    "name": "Seller Requested Replacement",
    "required": "Optional",
    "description": "Replacement triggered by the Seller through the Booking System",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#cancellation-replacement-refund-calculation-and-notification",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "leasing",
    "identifier": "named-leasing",
    "name": "Named leasing, including leaseExpires",
    "required": "Optional",
    "description": "Leasing at C2, reserving a space in the opportunity after the Customer has provided their contact information",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#leasing",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "leasing",
    "identifier": "anonymous-leasing",
    "name": "Anonymous leasing, including leaseExpires",
    "required": "Optional",
    "description": "Leasing at C1, reserving a space in the opportunity before the Customer has provided their contact information",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#leasing",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "details-capture",
    "identifier": "customer-details-capture-non-essential",
    "name": "Customer Details non-essential capture",
    "required": "Optional",
    "description": "Support for capturing forename, surname, and telephone number from the Customer. Note these fields cannot be mandatory.",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#customer-details-capture",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "details-capture",
    "identifier": "customer-details-capture-identifier",
    "name": "Customer Details identifier capture",
    "required": "Optional",
    "description": "Support for capturing the Broker's identifier for the customer. Note this field cannot be mandatory.",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#schema-person-for-customer-or-attendee",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "details-capture",
    "identifier": "attendee-details-capture-without-payment",
    "name": "Simple Book without Payment including Attendee Details capture",
    "required": "Optional",
    "description": "Support for capturing attendee details for free opportunities",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#attendee-details-capture",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "details-capture",
    "identifier": "attendee-details-capture-with-payment",
    "name": "Simple Book with Payment including Attendee Details capture",
    "required": "Optional",
    "description": "Support for capturing attendee details for paid opportunities",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#attendee-details-capture",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "details-capture",
    "identifier": "additional-details-capture",
    "name": "Additional Details capture",
    "required": "Optional",
    "description": "Support for capturing additional details ",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#additional-details-capture",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "access",
    "identifier": "access-code",
    "name": "accessCode - manual access codes",
    "required": "Optional",
    "description": "Support for accessCode provided for a successful booking",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#text-based-access-control",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "access",
    "identifier": "access-pass-image",
    "name": "accessPass - Seller provided access control images ",
    "required": "Optional",
    "description": "Support for accessPass provided by the Seller, in the form of an image",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#image-based-access-control",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "access",
    "identifier": "access-pass-barcode-seller-provided",
    "name": "accessPass - Seller provided access control barcodes ",
    "required": "Optional",
    "description": "Support for accessPass provided by the Seller, in the form of a barcode",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#extension-point-for-barcode-based-access-control",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "access",
    "identifier": "access-pass-barcode-broker-provided",
    "name": "accessPass - Broker provided access control barcodes ",
    "required": "Optional",
    "description": "Support for accessPass provided by the Broker, in the form of a barcode",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#extension-point-for-barcode-based-access-control",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "broker-role",
    "identifier": "reseller-broker",
    "name": "ResellerBroker mode",
    "required": "Optional (CR2)",
    "description": "Support for ResellerBroker mode",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#resellerbroker",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "broker-role",
    "identifier": "reseller-broker-tax-calculation",
    "name": "ResellerBroker Business-to-business Tax Calculation",
    "required": "Optional",
    "description": "Tax calculation for ResellerBroker (business-to-business)",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#scope-of-specification",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "broker-role",
    "identifier": "no-broker",
    "name": "NoBroker mode",
    "required": "Optional (CR2)",
    "description": "Support for NoBroker mode, for example for operators to use the Open Booking API to power their own websites",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#nobroker",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "tax",
    "identifier": "business-to-consumer-tax-calculation-net",
    "name": "Business-to-consumer Tax Calculation (TaxNet)",
    "required": "Optional",
    "description": "Tax calculation when the customer is of type Person (business-to-consumer), when the seller has taxMode TaxNet",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#business-to-consumer-tax-calculation-by-booking-system-is-mandatory",
    "requiredCondition": "Required if system provides consumer VAT receipts, for the relevant tax mode",
    "tutorial": ""
  },
  {
    "category": "tax",
    "identifier": "business-to-consumer-tax-calculation-gross",
    "name": "Business-to-consumer Tax Calculation (TaxGross)",
    "required": "Optional",
    "description": "Tax calculation when the customer is of type Person (business-to-consumer), when the seller has taxMode TaxGross",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#business-to-consumer-tax-calculation-by-booking-system-is-mandatory",
    "requiredCondition": "Required if system provides consumer VAT receipts, for the relevant tax mode",
    "tutorial": ""
  },
  {
    "category": "tax",
    "identifier": "business-to-business-tax-calculation-net",
    "name": "Business-to-business Tax Calculation (TaxNet)",
    "required": "Optional",
    "description": "Tax calculation when the customer is of type Organization (business-to-business), when the seller has taxMode TaxNet",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#business-to-business-tax-calculation-by-booking-system-is-optional",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "tax",
    "identifier": "business-to-business-tax-calculation-gross",
    "name": "Business-to-business Tax Calculation (TaxGross)",
    "required": "Optional",
    "description": "Tax calculation when the customer is of type Organization (business-to-business), when the seller has taxMode TaxGross",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#business-to-business-tax-calculation-by-booking-system-is-optional",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "advanced-payment",
    "identifier": "offer-overrides",
    "name": "Offer overrides",
    "required": "Optional",
    "description": "Offer prices overridden to allow for business models with variable pricing",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#offer-overrides",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "advanced-payment",
    "identifier": "dynamic-payment",
    "name": "DynamicPayment",
    "required": "Optional",
    "description": "Support for fully dynamic pricing, where price is not known at the point of purchase",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#dynamicpayment",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "advanced-payment",
    "identifier": "prepayment-optional",
    "name": "prepayment optional",
    "required": "Optional",
    "description": "Support for booking with optional payment",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#booking-without-payment",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "advanced-payment",
    "identifier": "prepayment-unavailable",
    "name": "prepayment not required",
    "required": "Optional",
    "description": "Support for booking without payment (reservation only)",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#booking-without-payment",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "restrictions",
    "identifier": "booking-restrictions",
    "name": "Booking restrictions",
    "required": "Optional",
    "description": "Support for genderRestriction, ageRestriction and additionalAdmissionRestriction",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#booking-restrictions",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "notifications",
    "identifier": "customer-notice-notifications",
    "name": "Customer notice notifications",
    "required": "Optional",
    "description": "Text notifications broadcast to all registered attendees of an opportunity",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#customer-notice-notifications",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "notifications",
    "identifier": "change-of-logistics-notifications",
    "name": "Change of logistics notifications",
    "required": "Optional",
    "description": "Notifications for when an opportunity's name, location, or start/end date/time are updated ",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#change-of-logistics-notifications",
    "requiredCondition": "Required if logistics of event can change",
    "tutorial": ""
  },
  {
    "category": "notifications",
    "identifier": "opportunity-attendance-updates",
    "name": "Opportunity attendance updates",
    "required": "Optional",
    "description": "Allowing the broker to recieve updates for when an attendee attends an event",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#opportunity-attendance-updates",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "access",
    "identifier": "access-code-update-notifications",
    "name": "accessCode update notifications",
    "required": "Optional",
    "description": "Updating accessCode after an opportunity is booked",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#other-notifications",
    "requiredCondition": "Required if accessCode can change",
    "tutorial": ""
  },
  {
    "category": "access",
    "identifier": "access-pass-update-notifications",
    "name": "accessPass update notifications",
    "required": "Optional",
    "description": "Updating accessPass after an opportunity is booked",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#other-notifications",
    "requiredCondition": "Required if accessPass can change",
    "tutorial": ""
  },
  {
    "category": "terms",
    "identifier": "terms-of-service",
    "name": "termsOfService without requiresExplicitConsent",
    "required": "Optional",
    "description": "Displaying terms of service, without requiring consent",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#delivery-of-terms-and-conditions-and-privacy-policy",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "terms",
    "identifier": "terms-of-service-with-consent",
    "name": "termsOfService with requiresExplicitConsent",
    "required": "Optional",
    "description": "Displaying terms of service that require consent",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#delivery-of-terms-and-conditions-and-privacy-policy",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "terms",
    "identifier": "terms-of-service-with-consent-with-date-modified",
    "name": "termsOfService with requiresExplicitConsent and dateModified",
    "required": "Optional",
    "description": "Displaying terms of service that require consent, with a date the terms were modified",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#delivery-of-terms-and-conditions-and-privacy-policy",
    "requiredCondition": "",
    "tutorial": ""
  },
  {
    "category": "booking-partner-authentication",
    "identifier": "booking-partner-authentication",
    "name": "Booking Partner Authentication for Multiple Seller Systems",
    "required": "Optional",
    "description": "OAuth based authentication for Sellers",
    "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#openid-connect-booking-partner-authentication-for-multiple-seller-systems",
    "requiredCondition": "",
    "tutorial": ""
  }
 ];

function renderFeatureJson(f) {
  const json = {
    "category": f.category,
    "identifier": f.identifier,
    "name": f.name,
    "description": f.description,
    "explainer": "",
    "specificationReference": f.specificationReference,
    "required": f.required === 'Required',
    "coverageStatus": "none"
  };
  if (f.requiredCondition) json.requiredCondition = f.requiredCondition;
  if (f.tutorial) json.links = [ { name: '.NET Tutorial', href: f.tutorial } ];
  return JSON.stringify(json, null, 2);
}

features.forEach(f => {
  const filename = `${FEATURES_ROOT}${f.category}/${f.identifier}/feature.json`;
  mkdirp(`${FEATURES_ROOT}${f.category}/${f.identifier}`).then(made => {
    fs.writeFile(filename, renderFeatureJson(f), function(err) {
      if(err) {
          return console.log(err);
      }
    
      console.log("FILE SAVED: " + filename);
    }); 
  });
});

