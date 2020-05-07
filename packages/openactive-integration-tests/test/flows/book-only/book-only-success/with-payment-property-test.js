const chakram = require("chakram");
const expect = chakram.expect;

const {Logger} = require("../../../helpers/logger");
const {RequestState} = require("../../../helpers/request-state");
const {FlowHelper} = require("../../../helpers/flow-helper");
const sharedValidationTests = require("../../../shared-behaviours/validation");
const {C1} = require("../../../shared-behaviours/c1");
const {C2} = require("../../../shared-behaviours/c2");
const {B} = require("../../../shared-behaviours/B");

let testConfiguration = {
  testFeature: 'simple-book-with-payment',
  testName: 'with-payment-property',
  testDescription: 'A successful end to end booking.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityNotBookableViaAvailableChannel',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable'
};


describe("Book Only" /*orderItemCriteria*/, function() {
  describe(`Book Only Success for random`, function() {
    const logger = new Logger(testConfiguration.testName, this, {
      description: `A successful end to end booking.`
    });
  
    const state = new RequestState(logger);
    const flow = new FlowHelper(state);
  
    beforeAll(async function() {
      await state.createOpportunity(orderItemCriteria);
      await flow.getMatch();
  
      return chakram.wait();
    });
  
    afterAll(async function() {
      await state.deleteOpportunity();
  
      await testHelper.deleteOrder(state.uuid, {
        sellerId: state.sellerId
      });
      return chakram.wait();
    });
  
    //if (state.eventFound) {
      describe("C1", function() {
        (new C1({state, flow, logger, testConfiguration}))
          .beforeSetup()
          .successChecks()
          .validationTests();
          
      });
  
      describe("C2", function() {
        (new C2({state, flow, logger, testConfiguration}))
        .beforeSetup()
        .successChecks()
        .validationTests();
      });
  
      describe("B", function() {
        (new B({state, flow, logger, testConfiguration}))
        .beforeSetup()
        .successChecks()
        .validationTests();
      });
    //}
  });
});
