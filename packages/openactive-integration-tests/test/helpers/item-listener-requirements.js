// TODO3 import this type from broker
/**
 * @typedef {{
 *   jsonPath: string;
 *   checkType: "anyNotEquals";
 *   checkValue: unknown;
 * }} ItemListenerRequirement
 */

const ItemListenerRequirementRecipes = {
  /**
   * Use this to specifically wait for an OrderItem to change its status from
   * OrderItemConfirmed to something else.
   * This is useful for cancellation tests, where (TODO3 continue)
   *
   * @returns {ItemListenerRequirement}
   */
  nonConfirmedOrderItem() {
    return {
      jsonPath: '$.data.orderedItem[*].orderItemStatus',
      checkType: 'anyNotEquals',
      checkValue: 'https://openactive.io/OrderItemConfirmed',
    };
  },
};

module.exports = {
  ItemListenerRequirementRecipes,
};
