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
 * @param {(Entry) => Entry} recordLogEntry
 * @param {string} stage
 * @param {function} actionFn
 */
export function recordWithIntercept(recordLogEntry: (Entry: any) => {
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
}, stage: string, actionFn: Function): Promise<any>;
/**
 * Intecept and output to the console all http requests made during the execution of actionFn
 * This is used primarily for the CLI
 * @param {string} stage
 * @param {function} actionFn
 */
export function logWithIntercept(stage: string, actionFn: Function): Promise<any>;
