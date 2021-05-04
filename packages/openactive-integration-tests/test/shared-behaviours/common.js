const { expect } = require('chai');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../helpers/flow-stages/fetch-opportunities').OrderItem} OrderItem
 * @typedef {import('../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
 * @typedef {InstanceType<import('../helpers/request-state')['RequestState']>} RequestState
 * @typedef {InstanceType<import('../shared-behaviours/c1')['C1']>} C1
 * @typedef {InstanceType<import('../shared-behaviours/c2')['C2']>} C2
 * @typedef {InstanceType<import('../shared-behaviours/b')['B']>} B
 * @typedef {import('../helpers/flow-stages/book-recipe').BookRecipe} BookRecipe
 */

class Common {
  // TODO remove these top 2 functions now that all tests uses FlowStages
  /**
   * Note: This generates an it() block. Therefore, this must be run within a describe() block.
   *
   * @param {OpportunityCriteria[]} orderItemCriteria
   * @param {RequestState} state
   * @param {C1 | C2 | B} stage
   * @param {() => any} orderAccessor
   * @param {string} name Used for the it() test description
   * @param {(feedOrderItem: any, responseOrderItem: any, responseOrderItemErrorTypes: any) => void} cb
   */
  static itForOrderItem(orderItemCriteria, state, stage, orderAccessor, name, cb) {
    this.itForOrderItemByControl(orderItemCriteria, state, stage, orderAccessor, name, cb, name, cb);
  }

  /**
   * Note: This generates an it() block. Therefore, this must be run within a describe() block.
   *
   * @param {OpportunityCriteria[]} orderItemCriteria
   * @param {RequestState} state
   * @param {C1 | C2 | B} stage
   * @param {() => any} orderAccessor
   * @param {string} testName Used for the it() test description for order item criteria which are not controls
   * @param {(feedOrderItem: any, responseOrderItem: any, responseOrderItemErrorTypes: any) => void} testCb
   * @param {string} controlName Used for the it() test description for order item criteria which are controls
   * @param {(feedOrderItem: any, responseOrderItem: any, responseOrderItemErrorTypes: any) => void} controlCb
   */
  static itForOrderItemByControl(orderItemCriteria, state, stage, orderAccessor, testName, testCb, controlName, controlCb) {
    orderItemCriteria.forEach((c, i) => {
      it(`OrderItem at position ${i} ${c.control ? controlName : testName}`, () => {
        if (stage) stage.expectResponseReceived();

        const feedOrderItem = state.orderItems[i];

        expect(orderAccessor().orderedItem).to.be.an('array');

        const responseOrderItem = orderAccessor().orderedItem.find(x => x.position === feedOrderItem.position);

        const responseOrderItemErrorTypes = (responseOrderItem.error || []).map(x => x['@type']);

        const cb = c.control ? controlCb : testCb;

        cb(feedOrderItem, responseOrderItem, responseOrderItemErrorTypes);
      });
    });
  }

  /**
   * Run a check against each OrderItem in an Orders API response. Each OrderItem from the API response
   * can also be checked against the associated item from the feed.
   *
   * Unlike itForEachOrderItemByControl(), these checks do not discriminate between control and non-control OrderItems.
   * Therefore, use this simpler function in a test which does not have a separate "control" opportunity criteria.
   *
   * Note: This generates an it() block. Therefore, this must be run within a describe() block.
   *
   * @param {object} args
   * @param {OpportunityCriteria[]} args.orderItemCriteriaList List of Order Item Criteria as provided by
   *   FeatureHelper.
   * @param {() => OrderItem[]} args.getFeedOrderItems OrderItems as received from the feed (e.g. using the
   *   FetchOpportunitiesFlowStage)
   * @param {() => ChakramResponse} args.getOrdersApiResponse HTTP response from an Orders API that includes
   *   OrderItems in the `.orderedItem` field. e.g. C1, C2 or B.
   * @param {() => ChakramResponse} [args.getBookFirstStageResponse] The first stage of the book process for this
   *   flow. This will be B or P.
   *
   *   Use this arg iff getOrdersApiResponse is a B response.
   *
   *   Common.itForEachOrderItemByControl uses OrderItem `position`s in order to align with the Opportunities
   *   found in the feed. B does not return `position`s in its OrderItems if it happens after P - however, P
   *   stores the `position`s and the `@id`s. These can therefore be used to figure out the `position`s of the
   *   B OrderItems, which will have the same `@id`s.
   * @param {string} testName Label used for it() block.
   * @param {(feedOrderItem: OrderItem, apiResponseOrderItem: any) => void} cb Callback which runs assertions
   *   on the OrderItems.
   */
  static itForEachOrderItem({
    orderItemCriteriaList,
    getFeedOrderItems,
    getOrdersApiResponse,
    getBookFirstStageResponse,
  }, testName, cb) {
    Common.itForEachOrderItemByControl({
      orderItemCriteriaList,
      getFeedOrderItems,
      getOrdersApiResponse,
      getBookFirstStageResponse,
    }, testName, cb, testName, cb);
  }

  /**
   * Run a check against each OrderItem in an API response. Each OrderItem from the API response
   * can also be checked against the associated item from the feed.
   *
   * You can define a different check to run if the OrderItem is a control.
   *
   * * Note: This generates an it() block. Therefore, this must be run within a describe() block.
   *
   * @param {object} args
   * @param {OpportunityCriteria[]} args.orderItemCriteriaList List of Order Item Criteria as provided by
   *   FeatureHelper.
   * @param {() => OrderItem[]} args.getFeedOrderItems OrderItems as received from the feed (e.g. using the
   *   FetchOpportunitiesFlowStage)
   * @param {() => ChakramResponse} args.getOrdersApiResponse HTTP response from an Orders API that includes
   *   OrderItems in the `.orderedItem` field. e.g. C1, C2 or B.
   * @param {() => ChakramResponse} [args.getBookFirstStageResponse] The first stage of the book process for this
   *   flow. This will be B or P.
   *
   *   Use this arg iff getOrdersApiResponse is a B response.
   *
   *   Common.itForEachOrderItemByControl uses OrderItem `position`s in order to align with the Opportunities
   *   found in the feed. B does not return `position`s in its OrderItems if it happens after P - however, P
   *   stores the `position`s and the `@id`s. These can therefore be used to figure out the `position`s of the
   *   B OrderItems, which will have the same `@id`s.
   * @param {string} testName Label used for it() block when checking non-control OrderItems.
   * @param {string} controlTestName Label used for it() blocks when checking control OrderItems.
   * @param {(feedOrderItem: OrderItem, apiResponseOrderItem: any, apiResponseOrderItemErrorTypes: string[]) => void} cb Callback which runs assertions
   *   on non-control OrderItems.
   * @param {(feedOrderItem: OrderItem, apiResponseOrderItem: any, apiResponseOrderItemErrorTypes: string[]) => void} controlCb Callback which runs assertions
   *   on control OrderItems.
   */
  static itForEachOrderItemByControl({
    orderItemCriteriaList,
    getFeedOrderItems,
    getOrdersApiResponse,
    getBookFirstStageResponse,
  }, testName, cb, controlTestName, controlCb) {
    /* This test checks a pre-condition of the subsequent tests for each OrderItem - that the number
    of OrderItems is balanced with the number of Order Item Criteria */
    it('Should have the same number of OrderItems as criteria', () => {
      const feedOrderItems = getFeedOrderItems();
      expect(feedOrderItems)
        .to.have.lengthOf.above(0)
        .and.to.have.lengthOf(orderItemCriteriaList.length);
      const apiResponseOrderedItem = getOrdersApiResponse().body.orderedItem;
      expect(apiResponseOrderedItem).to.be.an('array')
        .that.has.lengthOf.above(0)
        .and.has.lengthOf(orderItemCriteriaList.length);
    });
    orderItemCriteriaList.forEach((orderItemCriteria, i) => {
      const thisTestName = orderItemCriteria.control ? controlTestName : testName;

      it(`OrderItem at position ${i} - ${thisTestName}`, () => {
        const feedOrderItem = getFeedOrderItems()[i];
        const apiResponseOrderItem = getOrderItemAtPositionXFromOrdersApiResponse(
          feedOrderItem.position,
          getOrdersApiResponse(),
          getBookFirstStageResponse && getBookFirstStageResponse(),
        );
        // const apiResponseOrderItem = getOrdersApiResponse().body.orderedItem.find(orderItem => (
        //   orderItem.position === feedOrderItem.position
        // ));
        // chai why are you like this -.-
        // eslint-disable-next-line no-unused-expressions
        expect(apiResponseOrderItem).to.not.be.null
          .and.to.not.be.undefined;
        const apiResponseOrderItemErrorTypes = (apiResponseOrderItem.error || []).map(error => error['@type']);
        const thisCb = orderItemCriteria.control ? controlCb : cb;

        thisCb(feedOrderItem, apiResponseOrderItem, apiResponseOrderItemErrorTypes);
      });
    });
  }
}

/**
 * @param {number} position
 * @param {ChakramResponse} ordersApiResponse
 * @param {ChakramResponse} [bookFirstStageResponse] Use iff ordersApiResponse is a B response.
 */
function getOrderItemAtPositionXFromOrdersApiResponse(position, ordersApiResponse, bookFirstStageResponse) {
  if (!bookFirstStageResponse) {
    return ordersApiResponse.body.orderedItem.find(orderItem => orderItem.position === position);
  }
  /* The item with position `position` will be the one that satisfies the primary test opportunity criteria (and
  therefore is online).
  Now, B will not return positions in its OrderItems if it happens after P. So, we use the output from the first
  book stage (which will be either P or B) to get the `@id` of the position=`position` OrderItem, and then we can find
  that OrderItem in B */
  const orderItemIdOfPositionX = bookFirstStageResponse.body.orderedItem
    .find(orderItem => orderItem.position === position)['@id'];
  const orderItemWithSameId = ordersApiResponse.body.orderedItem.find(orderItem => (
    orderItem['@id'] === orderItemIdOfPositionX));
  return orderItemWithSameId;
}

module.exports = {
  Common,
};
