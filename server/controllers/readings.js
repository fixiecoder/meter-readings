const readingsModel = require('../model/readings');
const { validateRequest } = require('../libs/readings');

async function submitReading(req, res) {
  try {
    const errs = [];
    const { serialNumber, customerId, mpan, mprn, read, readDate } = req.body;

    if(!serialNumber || !customerId || !(mpan || mprn) || !read || !readDate) {
      errs.push({ err: 'MISSING_VALUES' });
    }

    const params = {
      serialNumber: serialNumber,
      customerId: customerId,
      MPXN: mpan || mprn,
      readings: read,
      readDate: readDate,
    };

    const meterDetails = await readingsModel.getMeterDetails({ serialNumber, customerId });
    const validationResult = validateRequest(params, meterDetails)

    if(!validationResult.isValid) {
      errs.push({ err: 'INVALID_REQUEST', reasons: validationResult.reasons });
    }

    let result;

    if(errs.length === 0) {
      result = await readingsModel.add(params);
      if(result.errs) {
        errs.push(...result.errs);
      }
    }

    console.log(errs)

    if(errs.length > 0) {
      return res.status(400).json(errs);
    }

    return res.json(result);
  } catch(e) {
    console.error(e);
    return res.sendStatus(500);
  }
}

async function getReadings(req, res) {
  const params = {
    serialNumber: req.params.serialNumber,
    customerId: req.params.customerId,
  };

  const result = await readingsModel.getAll(params);
  if(result.err) {
    return res.status(400).json(result.reasons);
  }

  return res.json(result.data);
}

module.exports = {
  submitReading,
  getReadings
};