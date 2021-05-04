const { GetDatasetSite } = require('./get-dataset-site');
const { GetMatch } = require('./get-match');
const { C1 } = require('./c1');
const { C2 } = require('./c2');
const { B } = require('./b');
const { P } = require('./p');
// const { OrderFeedUpdate } = require('./order-feed-update');
const { TestInterfaceAction } = require('./test-interface-action');
const { Common } = require('./common');
const { OpenIDConnectFlow } = require('./open-id-connect-flow');

module.exports = {
  GetDatasetSite,
  GetMatch,
  C1,
  C2,
  B,
  P,
  // OrderFeedUpdate,
  TestInterfaceAction,
  Common,
  OpenIDConnectFlow,
};
