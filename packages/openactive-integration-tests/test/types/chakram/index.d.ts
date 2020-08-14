// TODO: When completed, submit this to DefinitelyTyped
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

  type RequestOptions = Pick<Options, 'headers' | 'body'>;

  export function request(method: string, url: string, params: RequestOptions): Promise<ChakramResponse>;
  export function wait(): Promise<void>;
  // TODO Either detail this or use the more fully featured and already-typed chai.expect()
  export function expect(x: any): any;
}
