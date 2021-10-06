// Remaining TODOs (TODO TODO TODO)
// - [x] Make work with all other tests (e.g. accept-proposal-book seems not to work)
//   * [x] Leasing
// - [x] How to make Assert C1/C2 stage output show in logs (maybe genericise BookRecipe similar to below draft)
// - [x] Pass lint/TS
// - [x] Validation tests for Assert stages
// - Couple remaining TODOs
// - more complicated use cases:
//   * book-and-seller-replace-items: Test switched out OrderItems
//   * amending-order-quote tests: Test switched out OrderItems
//   * order-deletion tests: Assert capacity goes up after deletion.
//   * leasing: Assert Capacity changes in batched tests. Might be complicated..
const { last } = require('lodash');
const { assertIsNotNullish } = require('../asserts');

/**
 * @typedef {import('./flow-stage').UnknownFlowStageType} UnknownFlowStageType
 */

/**
 * @template {{ [stageName: string]: UnknownFlowStageType | FlowStageRun<any> }} TStages
 */
class FlowStageRun {
  /**
   * @param {TStages} stagesByName
   * @param {(keyof TStages)[]} stageSequence
   */
  constructor(stagesByName, stageSequence) {
    this._stagesByName = stagesByName;
    this._stageSequence = stageSequence;
    // @ts-expect-error not sure why it thinks stageSequence could be numbers when TStage's spec uses string keys
    this._flattenedStages = FlowStageRun.getFlattenedStages(this._stagesByName, this._stageSequence);
  }

  getFlattenedStages() {
    return this._flattenedStages;
  }

  getLastStage() {
    return last(this._flattenedStages);
  }

  /**
   * @template {keyof TStages} TStageName
   * @param {TStageName} stageName
   */
  getStage(stageName) {
    return this._stagesByName[stageName];
  }

  /**
   * @param {{ [stageName: string]: UnknownFlowStageType | FlowStageRun<any> }} stagesByName
   * @param {string[]} stageSequence
   * @returns {UnknownFlowStageType[]}
   */
  static getFlattenedStages(stagesByName, stageSequence) {
    /** @type {UnknownFlowStageType[]} */
    // // @ts-expect-error TODO fix
    const stages = stageSequence.flatMap((stageName) => {
      const stage = stagesByName[stageName];
      assertIsNotNullish(stage);
      if (stage instanceof FlowStageRun) {
        return stage.getFlattenedStages();
      }
      return [stage];
    });
    return stages;
  }
}

//   /**
//    * Create a new FlowStageRun which runs all the stages in `firstFlowStageRun` followed by all the stages in
//    * `nextFlowStageRun`
//    *
//    * @template {{ [stageName: string]: UnknownFlowStageType }} TFirstStages
//    * @template {{ [stageName: string]: UnknownFlowStageType }} TNextStages
//    * @param {FlowStageRun<TFirstStages>} firstFlowStageRun
//    * @param {FlowStageRun<TNextStages>} nextFlowStageRun
//    * @returns {FlowStageRun<TFirstStages & TNextStages>}
//    */
//   static concat(firstFlowStageRun, nextFlowStageRun) {
//     // @ts-expect-error
//     expect(intersection(firstFlowStageRun._stageSequence, nextFlowStageRun._stageSequence))
//       .to.have.lengthOf(0, 'Cannot concat FlowStageRuns which have the same stage names');
//     // TODO also assert that next.firstStage.prereq is first.lastStage
//     const concatedStagesByName = {
//       ...firstFlowStageRun._stagesByName,
//       ...nextFlowStageRun._stagesByName,
//     };
//     const concatedStageSequence = [...firstFlowStageRun._stageSequence, ...nextFlowStageRun._stageSequence];
//     return new FlowStageRun(concatedStagesByName, concatedStageSequence);
//   }
// }

/**
 * @typedef {FlowStageRun<any>} AnyFlowStageRun
 */

module.exports = {
  FlowStageRun,
};
