const database = require('../services/database');
const { mapReadingsToResponse } = require('../libs/readings');

async function getMeterDetails({ serialNumber, customerId }) {
  const sql = `SELECT meters.serialNumber, registers.registerId, meters.MPXN, customers_meters.customerId
    FROM meters
    INNER JOIN registers ON meters.serialNumber = registers.serialNumber
    INNER JOIN customers_meters ON meters.serialNumber = customers_meters.serialNumber
    WHERE meters.serialNumber = ${serialNumber}
    AND customers_meters.customerId = ${customerId}
  `;
  return database.getAll(sql);
}

async function add({ serialNumber, customerId, MPXN, readings, readDate }) {
  const errs = [];
  for (const reading of readings) {
    const result = await database.insert('readings', [
      serialNumber,
      readDate,
      customerId,
      reading.registerId,
      reading.type,
      reading.value,
      MPXN
    ]);

    if(result.err) {
      errs.push(result)
    }
  }

  if(errs.length > 0) {
    return { errs: errs.map((err) => ({ err: 'ERROR_SUBMITTING_READING', reason: err.reason })) };
  }

  return { success: true };
}

async function getAll({ serialNumber, customerId }) {
  const sql = `SELECT readings.*, supply_points.type AS mpxnType  FROM readings
    INNER JOIN meters ON readings.serialNumber = meters.serialNumber
    INNER JOIN supply_points ON readings.MPXN = supply_points.MPXN
    WHERE readings.serialNumber = ${serialNumber}
    AND readings.customerId = ${customerId}
  `;

  const result = await database.getAll(sql);
  return { success: true, data: mapReadingsToResponse(result) };
}

module.exports = {
  add,
  getAll,
  getMeterDetails,
};