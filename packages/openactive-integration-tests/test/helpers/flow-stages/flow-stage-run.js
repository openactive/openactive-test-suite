// Remaining TODOs (TODO TODO TODO)
// - Cancellation
// - Make work with all other tests (e.g. accept-proposal-book seems not to work)
// - How to make Assert C1/C2 stage output show in logs (maybe genericise BookRecipe similar to below draft)

// // TODO just a draft idea
// /**
//  * @typedef {import('./flow-stage').UnknownFlowStageType} UnknownFlowStageType
//  */

// const { expect } = require('chai');
// const { intersection } = require('lodash');

// /**
//  * @template {{ [stageName: string]: UnknownFlowStageType }} TStages
//  */
// class FlowStageRun {
//   /**
//    * @param {TStages} stagesByName
//    * @param {(keyof TStages)[]} stageSequence
//    */
//   constructor(stagesByName, stageSequence) {
//     this._stagesByName = stagesByName;
//     this._stageSequence = stageSequence;
//   }

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

// module.exports = {
//   FlowStageRun,
// };
