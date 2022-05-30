const { merge } = require('lodash');

const sampleRequestConstraints = {
  "test:testOpportunityDataShapeExpression": [
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://openactive.io/remainingUses",
      "valueExpr": {
        "@type": "NumericNodeConstraint",
        "mininclusive": 2
      }
    },
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://openactive.io/isOpenBookingAllowed",
      "valueExpr": {
        "@type": "test:BooleanNodeConstraint",
        "value": true
      }
    },
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://schema.org/startDate",
      "valueExpr": {
        "@type": "test:DateRangeNodeConstraint",
        "minDate": "2022-05-26T12:31:31.136+00:00"
      }
    },
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://schema.org/eventStatus",
      "valueExpr": {
        "@type": "test:OptionNodeConstraint",
        "datatype": "schema:EventStatusType",
        "blocklist": [
          "https://schema.org/EventCancelled",
          "https://schema.org/EventPostponed"
        ]
      }
    }
  ],
  "test:testOfferDataShapeExpression": [
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://openactive.io/openBookingFlowRequirement",
      "valueExpr": {
        "@type": "test:ArrayConstraint",
        "datatype": "oa:OpenBookingFlowRequirement",
        "includesAll": [
          "https://openactive.io/OpenBookingApproval"
        ],
        "excludesAll": [
          "https://openactive.io/OpenBookingAttendeeDetails",
          "https://openactive.io/OpenBookingIntakeForm"
        ]
      }
    },
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://schema.org/price",
      "valueExpr": {
        "@type": "NumericNodeConstraint",
        "mininclusive": 0.01
      }
    },
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://openactive.io/validFromBeforeStartDate",
      "valueExpr": {
        "@type": "test:DateRangeNodeConstraint",
        "maxDate": "2022-05-26T10:31:31.136+00:00",
        "allowNull": true
      }
    },
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://openactive.io/openBookingInAdvance",
      "valueExpr": {
        "@type": "test:OptionNodeConstraint",
        "datatype": "oa:RequiredStatusType",
        "blocklist": [
          "https://openactive.io/Unavailable"
        ]
      }
    }
  ]
};

const broker = {
  "@type": "Organization",
  "name": "Example Broker",
  "url": "https://broker.example.com",
  "description": "A fitness app for imaginary people",
  "logo": {
    "@type": "ImageObject",
    "url": "http://broker.example.com/images/logo.png"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Alan Peacock Way",
    "addressLocality": "Village East",
    "addressRegion": "Middlesbrough",
    "postalCode": "TS4 3AE",
    "addressCountry": "GB"
  }
};

const customer = {
  "@type": "Person",
  "email": "geoffcapes@example.com",
  "telephone": "020 811 8055",
  "givenName": "Geoff",
  "familyName": "Capes"
};

function getSampleRequestConstraints(opportunity) {
  return merge(sampleRequestConstraints, opportunity);
}

function checkpointOne(opportunity, seller, offer) {
  return {
    "@context": "https://openactive.io/",
    "@type": "OrderQuote",
    "brokerRole": "https://openactive.io/AgentBroker",
    "broker": broker,
    "seller": seller["@id"],
    "orderedItem": [
      {
        "@type": "OrderItem",
        "position": 0,
        "acceptedOffer": offer["@id"],
        "orderedItem": opportunity["@id"]
      }
    ]
  };
}

function checkpointTwo(opportunity, seller, offer) {
  return {
    "@context": "https://openactive.io/",
    "@type": "OrderQuote",
    "brokerRole": "https://openactive.io/AgentBroker",
    "broker": broker,
    "seller": seller["@id"],
    "customer": customer,
    "orderedItem": [
      {
        "@type": "OrderItem",
        "position": 0,
        "acceptedOffer": offer["@id"],
        "orderedItem": opportunity["@id"]
      }
    ]
  }
}

function book(opportunity, seller, offer) {
  return {
    "@context": "https://openactive.io/",
    "@type": "Order",
    "brokerRole": "https://openactive.io/AgentBroker",
    "broker": broker,
    "seller": seller["@id"],
    "customer": customer,
    "orderedItem": [
      {
        "@type": "OrderItem",
        "position": 0,
        "acceptedOffer": offer["@id"],
        "orderedItem": opportunity["@id"]
      }
    ]
  }
}

function proposal(opportunity, seller, offer) {
  return {
    "@context": "https://openactive.io/",
    "@type": "OrderProposal",
    "brokerRole": "https://openactive.io/AgentBroker",
    "broker": broker,
    "seller": seller["@id"],
    "customer": customer,
    "orderedItem": [
      {
        "@type": "OrderItem",
        "position": 0,
        "acceptedOffer": offer["@id"],
        "orderedItem": opportunity["@id"]
      }
    ]
  }
}

function proposalUpdate(opportunity, seller, offer) {
  return {
    "@context": "https://openactive.io/",
    "@type": "OrderProposal",
    "orderProposalStatus": "https://openactive.io/CustomerRejected",
    "orderCustomerNote": "Sorry I've actually made other plans, hope you find someone!"
  }
}

function orderCancellation(opportunity, seller, offer) {
  return {
    "@context": "https://openactive.io/",
    "@type": "Order",
    "orderedItem": [
      {
        "@type": "OrderItem",
        "@id": "",
        "orderItemStatus": "https://openactive.io/CustomerCancelled"
      }
    ]
  }
}

function buildSampleRequests(opportunity) {
  const parent = opportunity.superEvent || opportunity.facilityUse;
  const seller = parent.organizer || parent.provider;
  const offer = parent.offers[0]

  return {
    opportunity,
    checkpointOne: checkpointOne(opportunity, seller, offer),
    checkpointTwo: checkpointTwo(opportunity, seller, offer),
    book: book(opportunity, seller, offer),
    proposal: proposal(opportunity, seller, offer),
    proposalUpdate: proposalUpdate(opportunity, seller, offer),
    orderCancellation: orderCancellation(opportunity, seller, offer),
  };
}

module.exports = {
  getSampleRequestConstraints,
  buildSampleRequests,
};
