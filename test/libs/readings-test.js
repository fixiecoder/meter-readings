const { assert } = require('chai');
const { validateRequest } = require('../../server/libs/readings');

const request = { serialNumber: '123458',
  customerId: '1',
  MPXN: '98765',
  readings: [
    { type: 'ANYTIME', registerId: 11112, value: '2729' },
    { type: 'NIGHT', registerId: 11113, value: '2892' }
  ],
  readDate: '2017-11-20T16:19:48+00:00Z'
};

const model = [
  { serial_number: 123458, registerId: 11112, MPXN: 98765, customerId: 1 },
  { serial_number: 123458, registerId: 11113, MPXN: 98765, customerId: 1 },
];

describe('libs', function() {
  describe('validateRequest', function() {
    // many more test cases can be added to this array
    const tests = [
      { model: [], request, expected: { reasons: [{ code: 'CUSTOMERID_AND_SERIAL_NUMBER_DO_NOT_MATCH' }], isValid: false } },
      { model, request, expected: { reasons: [], isValid: true } },
      { model: undefined, request: undefined, expected: { reasons: [{ code: 'CUSTOMERID_AND_SERIAL_NUMBER_DO_NOT_MATCH' }], isValid: false } },
    ];

    tests.forEach((test, i) => {
      it(`#${i} - validateRequest should return isValid = ${test.expected.isValid}`, () => {
        const result = validateRequest(test.request, test.model);
        assert.deepEqual(test.expected, result);
      });
    });

  });
});