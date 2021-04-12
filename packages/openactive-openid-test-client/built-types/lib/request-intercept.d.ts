export type Entry = {
    type: 'request';
    stage: string;
    request: {
        [k: string]: unknown;
    };
    response?: {
        [k: string]: unknown;
    };
    isPending: boolean;
    duration: number;
};
/**
 * @typedef {{
 *   type: 'request',
 *   stage: string,
 *   request: {[k: string]: unknown},
 *   response?: {[k: string]: unknown},
 *   isPending: boolean,
 *   duration: number
 * }} Entry
 */
/**
 * Intecept and log all http requests made during the execution of actionFn
 * @template TActionFnResult
 * @param {(Entry) => Entry} recordLogEntry
 * @param {string} stage
 * @param {() => TActionFnResult} actionFn
 * @returns {Promise<TActionFnResult>}
 */
export function recordWithIntercept<TActionFnResult>(recordLogEntry: (Entry: any) => {
    type: 'request';
    stage: string;
    request: {
        [k: string]: unknown;
    };
    response?: {
        [k: string]: unknown;
    };
    isPending: boolean;
    duration: number;
}, stage: string, actionFn: () => TActionFnResult): Promise<TActionFnResult>;
/**
 * Intecept and output to the console all http requests made during the execution of actionFn
 * This is used primarily for the CLI
 * @template TActionFnResult
 * @param {string} stage
 * @param {() => TActionFnResult} actionFn
 */
export function logWithIntercept<TActionFnResult>(stage: string, actionFn: () => TActionFnResult): Promise<TActionFnResult>;
