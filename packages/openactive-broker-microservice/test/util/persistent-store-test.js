const { PersistentStore } = require('../../src/util/persistent-store');

describe('test/util/persistent-store-test', () => {
  const store = new PersistentStore();

  afterEach(async () => {
    await store.clearCaches();
  });

  it('should set some stuff and then get stuff idunno', () => {

  });
});
