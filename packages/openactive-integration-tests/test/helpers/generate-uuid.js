const { v5: uuidv5 } = require('uuid');

/**
 * @param {string | null} sellerId
 */
function generateUuid(sellerId = null) {
  return uuidv5(
    'https://www.example.com/example/id/' +
    Math.floor(Math.random() * 100000),
    uuidv5.URL
  ); //TODO: generate uuid v5 based on Seller ID - and fix this so it is unique
}

module.exports = {
  generateUuid,
};
