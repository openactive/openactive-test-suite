export const setupBrowserAutomationRoutes: (app: import("express").Application, buttonSelector: string) => void;
export const recordWithIntercept: (recordLogEntry: (Entry: any) => {
    type: "request";
    stage: string;
    request: {
        [k: string]: unknown;
    };
    response?: {
        [k: string]: unknown;
    };
    isPending: boolean;
    duration: number;
}, stage: string, actionFn: Function) => Promise<any>;
export const logWithIntercept: (stage: string, actionFn: Function) => Promise<any>;
export const OpenActiveOpenIdTestClient: {
    new (baseUrl: any): import("./client");
};
export const OpenActiveTestAuthKeyManager: {
    new (log: any, baseUrl: any, sellersConfig: any, bookingPartnerConfig: any): import("./auth-key-manager");
};
export const FatalError: {
    new (message: any): import("./fatal-error");
    captureStackTrace(targetObject: object, constructorOpt?: Function): void;
    prepareStackTrace?: (err: Error, stackTraces: NodeJS.CallSite[]) => any;
    stackTraceLimit: number;
};
