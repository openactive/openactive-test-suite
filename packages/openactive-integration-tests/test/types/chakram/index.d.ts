/**
 * Fill in the TypeScript interface for chakram, which does not have TypeScript
 * definitions.
 * This is a minimal set of types to allow the tests to compile.
 * TODO: If completed, this could be submitted to
 * https://github.com/DefinitelyTyped/DefinitelyTyped
 */
declare module 'chakram' {
  import { IncomingMessage } from 'http';
  import { Options } from 'request';

  /** See http://dareid.github.io/chakram/jsdoc/global.html#ChakramResponse */
  export interface ChakramResponse {
    /** An error when applicable */
    error?: Error;
    /** An http.IncomingMessage object */
    response: IncomingMessage;
    /**
     * The response body. Typically a JSON object unless the json option has been set to
     * false, in which case will be either a String or Buffer
     */
    body: any;
    /** A tough cookie jar */
    jar: object;
    /** The request's original URL */
    url: string;
    /** The time taken to make the request (including redirects) at millisecond resolution */
    responseTime: number;
  }

  // `url` is required in request's options, but is not needed in chakram,
  // because `url` is provided as a separate argument to params
  export type RequestOptions = Omit<Options, 'url'>;

  export type RequestMethod = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE';

  export function request(method: RequestMethod, url: string, params: RequestOptions): Promise<ChakramResponse>;
  export function wait(): Promise<void>;
  // TODO Either detail this or use the more fully featured and already-typed chai.expect()
  export function expect(x: any): any;
}
