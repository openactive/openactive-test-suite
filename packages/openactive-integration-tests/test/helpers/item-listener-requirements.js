// TODO2 import this type from broker
/**
 * @typedef {{
 *   jsonPath: string;
 *   checkType: 'allNotEqual' | `atLeastNNotEqual`;
 *   checkValue: unknown;
 *   checkArgs?: {
 *     n?: number;
 *   };
 * }} ListenerItemRequirement
 */

const ListenerItemRequirementRecipes = {
  /**
   * Use this to specifically wait for an OrderItem to change its status from
   * OrderItemConfirmed to something else.
   * This is useful for cancellation tests, where (TODO2 continue)
   *
   * @param {number} n - The number of OrderItems that must not be confirmed.
   * @returns {ListenerItemRequirement}
   */
  nonConfirmedOrderItems(n) {
    return {
      jsonPath: '$.data.orderedItem[*].orderItemStatus',
      checkType: 'atLeastNNotEqual',
      checkValue: 'https://openactive.io/OrderItemConfirmed',
      checkArgs: {
        n,
      },
    };
  },
  /**
   * Use this to specifically wait for ALL OrderItems to change their status
   * from OrderItemConfirmed to something else.
   *
   * This is useful for cancellation tests, where (TODO2 continue)
   *
   * @returns {ListenerItemRequirement}
   */
  allNonConfirmedOrderItems() {
    return {
      jsonPath: '$.data.orderedItem[*].orderItemStatus',
      checkType: 'allNotEqual',
      checkValue: 'https://openactive.io/OrderItemConfirmed',
    };
  },
};

module.exports = {
  ListenerItemRequirementRecipes,
};
