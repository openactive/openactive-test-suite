const { GetDatasetSite } = require('./get-dataset-site');
const { GetMatch } = require('./get-match');
const { TestInterfaceAction } = require('./test-interface-action');
const { Common } = require('./common');
const { OpenIDConnectFlow } = require('./open-id-connect-flow');

module.exports = {
  GetDatasetSite,
  GetMatch,
  TestInterfaceAction,
  Common,
  OpenIDConnectFlow,
};
