const { expect } = require('chai');
const { invertFacilityUseItem, createItemFromSubEvent } = require('../../src/util/item-transforms');

describe('test/utils/item-transforms-test', () => {
  describe('invertFacilityUseItems', () => {
    it('should invert FacilityUse items and concatenate them with other items', () => {
      // Test Objects
      const a = {
        state: 'updated',
        data: {
          '@context': 'https://openactive.io/',
          name: 'Facility Use 1',
          '@type': 'FacilityUse',
          individualFacilityUse: [{ '@type': 'IndividualFacilityUse', '@id': '1' }, { '@type': 'IndividualFacilityUse', '@id': '2' }]
        }
      };

      // Test
      const result = invertFacilityUseItem(a);

      // Assertions
      expect(result).to.have.lengthOf(2);

      expect(result[0]).to.have.property('id', '1');
      expect(result[0].kind).to.equal('IndividualFacilityUse');
      expect(result[0].data).to.have.property('@context', 'https://openactive.io/');
      expect(result[0].data).to.have.property('aggregateFacilityUse');
      expect(result[0].data.aggregateFacilityUse).to.have.property('name', 'Facility Use 1');
      expect(result[0].data.aggregateFacilityUse).to.not.have.property('@context');

      expect(result[1]).to.have.property('id', '2');
      expect(result[1].kind).to.equal('IndividualFacilityUse');
      expect(result[1].data).to.have.property('@context', 'https://openactive.io/');
      expect(result[1].data).to.have.property('aggregateFacilityUse');
      expect(result[1].data.aggregateFacilityUse).to.have.property('name', 'Facility Use 1');
      expect(result[1].data.aggregateFacilityUse).to.not.have.property('@context');
    });
    it('should not invert FacilityUse items if there are no IndividualFacilityUses', () => {
      // Test Objects
      const a = {
        state: 'updated',
        data: {
          '@context': 'https://openactive.io/',
          name: 'Facility Use 1',
          '@type': 'FacilityUse',
        }
      };

      // Test
      const result = invertFacilityUseItem(a);

      // Assertions
      expect(result).to.have.lengthOf(1);

      expect(result[0].data).to.have.property('@context', 'https://openactive.io/');
      expect(result[0].data).to.have.property('name', 'Facility Use 1');
      expect(result[0].data).to.not.have.property('aggregateFacilityUse');
    });
  });

  describe('createItemFromSubEvent', () => {
    it('should create an opportunity item from a subEvent with minimal data', () => {
      // Test Objects
      const subEvent = {
        '@id': 'https://example.com/subEvent/1',
        type: 'ScheduledSession',
      };
      const item = {
        data: {
          '@context': 'https://openactive.io/',
          '@id': 'https://example.com/sessionseries/1',
          '@type': 'SessionSeries',
        },
        modified: '1234',
      };

      // Test
      const opportunityItem = createItemFromSubEvent(subEvent, item);

      // Assertions
      expect(opportunityItem).to.deep.equal({
        id: 'https://example.com/subEvent/1',
        modified: '1234',
        kind: 'ScheduledSession',
        state: 'updated',
        data: {
          '@id': 'https://example.com/subEvent/1',
          type: 'ScheduledSession',
          '@context': 'https://openactive.io/',
          superEvent: 'https://example.com/sessionseries/1',
        },
      });
    });
  });
});


