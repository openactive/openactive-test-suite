const { expect } = require('chai');
const {invertFacilityUseItems, createItemFromSubEvent} = require('../../src/util/item-transforms');

describe('test/utils/item-transforms-test', () => {
  describe('invertFacilityUseItems', () => {
    it('should return the input items when no invertibleFacilityUseItems are present', () => {
      const items = [
        { data: { individualFacilityUse: null } },
        { data: { individualFacilityUse: [] } },
      ];
      const result = invertFacilityUseItems(items);
      expect(result).to.deep.equal(items);
    });

    it('should invert FacilityUse items and concatenate them with other items', () => {
      // Test Objects
      const facilityUseItems = [
        { 
          state: 'updated',
          data: { 
            '@context': 'https://openactive.io/',
            name: 'Facility Use 1',
            '@type': 'FacilityUse', 
            individualFacilityUse: [{ '@type': 'IndividualFacilityUse', '@id': '1' }] 
          } 
        },
        { 
          state: 'updated',
          data: { 
            name: 'Facility Use 2',
            '@context': 'https://openactive.io/',
            '@type': 'FacilityUse', 
            individualFacilityUse: [{ '@type': 'IndividualFacilityUse', '@id': '2' }, { '@type': 'IndividualFacilityUse', '@id': '3' }] 
          } 
        },
      ];
      const otherItems = [
        { data: { '@type': 'FacilityUse', someData: 'value' } },
      ];
      const items = facilityUseItems.concat(otherItems);

      // Test
      const result = invertFacilityUseItems(items);

      // Assertions
      expect(result).to.have.lengthOf(3);

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
      expect(result[1].data.aggregateFacilityUse).to.have.property('name', 'Facility Use 2');
      expect(result[1].data.aggregateFacilityUse).to.not.have.property('@context');

      expect(result[2]).to.equal(otherItems[0]);
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


