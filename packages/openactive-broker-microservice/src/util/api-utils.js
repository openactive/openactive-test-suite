/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {string[]} requiredParamNames
 * @returns {boolean} If true, the required params are included
 */
function error400IfExpressParamsAreMissing(req, res, requiredParamNames) {
  for (const paramName of requiredParamNames) {
    if (!req.params[paramName]) {
      res.status(400).json({
        error: `${paramName} is required`,
      });
      return false;
    }
  }
  return true;
}

module.exports = {
  error400IfExpressParamsAreMissing,
};
