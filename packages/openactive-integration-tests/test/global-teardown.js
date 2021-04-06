const axios = require('axios');

const MICROSERVICE_BASE = `http://localhost:${process.env.PORT || 3000}`;

async function pause() {
  await axios.post(`${MICROSERVICE_BASE}/pause`, {
    timeout: 1000 * 30,
  });

  return true;
}

module.exports = async () => {
  try {
    console.log('Pausing broker microservice...');
    await pause();
  } catch (error) {
    throw new Error('The broker microservice is unreachable. This is a pre-requisite for the test suite. \n' + error);
  }
};
