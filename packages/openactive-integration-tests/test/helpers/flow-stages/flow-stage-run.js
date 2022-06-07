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

/**
 * @typedef {FlowStageRun<any>} AnyFlowStageRun
 */

module.exports = {
  FlowStageRun,
};
