import { setupBrowserAutomationRoutes } from "./browser-automation-for-auth";
import { recordWithIntercept } from "./request-intercept";
import { logWithIntercept } from "./request-intercept";
import OpenActiveOpenIdTestClient = require("./client");
import OpenActiveTestAuthKeyManager = require("./auth-key-manager");
import FatalError = require("./fatal-error");
export { setupBrowserAutomationRoutes, recordWithIntercept, logWithIntercept, OpenActiveOpenIdTestClient, OpenActiveTestAuthKeyManager, FatalError };
