const originalEmitWarning = process.emitWarning;

let suppressed = false;

/**
 * Don't emit the NODE_TLS_REJECT_UNAUTHORIZED warning.
 * https://github.com/cypress-io/cypress/pull/5256
 */
function silentlyAllowInsecureConnections() {
  if (suppressed) {
    return;
  }

  suppressed = true;

  process.emitWarning = (warning, ...args) => {
    if (typeof warning === 'string' && warning.indexOf('NODE_TLS_REJECT_UNAUTHORIZED') > -1) {
      // node will only emit the warning once
      // https://github.com/nodejs/node/blob/82f89ec8c1554964f5029fab1cf0f4fad1fa55a8/lib/_tls_wrap.js#L1378-L1384
      process.emitWarning = originalEmitWarning;

      return null;
    }

    return originalEmitWarning.call(process, warning, ...args);
  };

  // This should be silent
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

module.exports = {
  silentlyAllowInsecureConnections,
};
