function validateRequest(requestData, modelData) {
  const validationResult = {
    reasons: [],
    isValid: true,
  };
  // if we have no results from the database then the customerId and serial number do not match
  if(!modelData || modelData.length === 0) {
    validationResult.reasons.push({ code: 'CUSTOMERID_AND_SERIAL_NUMBER_DO_NOT_MATCH' });
    validationResult.isValid = false;
    return validationResult;
  }

  // check that the registerIds provided with the read match the registerIds in the database against these meters
  requestData.readings.forEach(meterData => {
    const registerIsValid = modelData.some(registers => meterData.registerId === registers.registerId);
    if(!registerIsValid) {
      validationResult.reasons.push({ code: 'INVALID_REGISTER_ID', data: meterData.registerId });
      validationResult.isValid = false;
    }
  });

  return validationResult;
}

function mapReading(reading) {
  return {
    customerId: reading[0].customerId,
    serialNumber: reading[0].serialNumber,
    [reading[0].mpxnType]: '98765',
    read: reading.map(r =>({ type: r.type, registerId: r.registerId, value: r.value })),
    readDate: reading[0].readDate
  };
}

// sort dates descending (most recent first)
const sortReadings = (a, b) => new Date(b.readDate) - new Date(a.readDate);

function mapReadingsToResponse(readings) {
  const readingsObject = {}
  readings.forEach(reading => {
    if(!readingsObject[reading.readDate]) {
      readingsObject[reading.readDate] = [];
    }
    readingsObject[reading.readDate].push(reading);
  });

  return Object.keys(readingsObject)
    .map(readDate => mapReading(readingsObject[readDate]))
    .sort(sortReadings);
}

module.exports = {
  validateRequest,
  mapReadingsToResponse,
};