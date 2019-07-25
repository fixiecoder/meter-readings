const database = require('../services/database');
const { mapReadingsToResponse } = require('../libs/readings');

async function getMeterDetails({ serialNumber, customerId }) {
  const sql = `SELECT meters.serial_number, registers.registerId, meters.MPXN, customers_meters.customerId
    FROM meters
    INNER JOIN registers ON meters.serial_number = registers.serial_number
    INNER JOIN customers_meters ON meters.serial_number = customers_meters.serial_number
    WHERE meters.serial_number = ${serialNumber}
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
console.log(result)
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
  // let sql = `SELECT readings.read_date, supply_points.type, readings.serial_number, registers.registerId, meters.MPXN, customers_meters.customerId
  //   FROM readings
  //   INNER JOIN meters ON meters.serial_number = readings.serial_number
  //   INNER JOIN supply_points ON readings.MPXN = supply_points.MPXN
  //   INNER JOIN registers ON readings.serial_number = registers.serial_number
  //   INNER JOIN customers_meters ON readings.serial_number = customers_meters.serial_number
  //   WHERE readings.serial_number = ${serialNumber}
  //   AND customers_meters.customerId = ${customerId}
  // `;

  const sql = `SELECT readings.*, supply_points.type AS mpxnType  FROM readings
    INNER JOIN meters ON readings.serial_number = meters.serial_number
    INNER JOIN supply_points ON readings.MPXN = supply_points.MPXN
    WHERE readings.serial_number = ${serialNumber}
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