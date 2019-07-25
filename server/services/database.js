const Promise = require('bluebird');
const sqlite = require('sqlite');

/**
 * This module initilises the database and builds the tables if they do not already exist
 *
 * It also exposes some generic methods for reading and writing to the database
 *   getOne, getAll, insert, which can be used inside the model modules to interact with the database 
 */

const dbPromise = sqlite.open('./db/readings.db', { Promise });
let db;

const TABLES = {
  customers: { name: 'customers' },
  meters: { name: 'meters' },
  supplyPoints: { name: 'supply_points' },
  customersMeters: { name: 'customers_meters' },
  readings: { name: 'readings' },
  registers: { name: 'registers' },
};

const customers = [
  [null, 'Dave', 'Lister'],
  [null, 'Arnold', 'Rimmer'],
  [null, 'kristine', 'kochanski'],
];

const supplyPoints = [
  [98765, 'MPAN'],
  [98766, 'MPRN'],
  [98767, 'MPAN'],
  [98768, 'MPRN'],
  [98769, 'MPAN'],
  [98770, 'MPRN'],
];

const meters = [
  [123458, 98765],
  [123459, 98766],
  [123460, 98767],
  [123461, 98768],
  [123462, 98769],
  [123463, 98770],
];

const registers = [
  [123458, 11112],
  [123458, 11113],
  [123459, 11114],
  [123459, 11115],
  [123460, 11116],
  [123460, 11117],
  [123461, 11118],
  [123461, 11119],
  [123462, 11120],
  [123462, 11121],
  [123463, 11122],
  [123463, 11123],
];

const customersMeters = [
  [123458, 1],
  [123459, 1],
  [123460, 2],
  [123461, 2],
  [123462, 3],
  [123463, 3],
];

async function checkTableExists(tableName) {
  try {
    const result = await db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`);
    return !!result;
  } catch(e) {
    console.error('CHECK TABLE EXISTS ERROR', e.message);
  }
}

async function createCustomersTable() {
  const table = TABLES.customers.name;
  try {
    const tableExists = await checkTableExists(table);
    if(!tableExists) {
      const result = await db.run(`CREATE TABLE ${table} (customerId INTEGER PRIMARY KEY AUTOINCREMENT, firstname TEXT NOT NULL, lastname TEXT NOT NULL)`);
      console.log(`${table} created successfully`)
      return true;
    }
  } catch(e) {
    console.error(`CREATE ${table} TABLE ERROR`, e.message);
    return false;
  }
}

async function createSupplyPointsTable() {
  const table = TABLES.supplyPoints.name;
  try {
    const tableExists = await checkTableExists(table);
    if(!tableExists) {
      const result = await db.run(`CREATE TABLE ${table} (
        MPXN INTEGER PRIMARY KEY,
        type TEXT NOT NULL
      )`);
      console.log(`${table} created successfully`)
      return true;
    }
  } catch(e) {
    console.error(`CREATE ${table} TABLE ERROR`, e.message);
    return false;
  }
}

async function createMetersTable() {
  const table = TABLES.meters.name;
  try {
    const tableExists = await checkTableExists(table);
    if(!tableExists) {
      const result = await db.run(`CREATE TABLE ${table} (
        serialNumber INTEGER NOT NULL,
        MPXN INTEGER NOT NULL,
        FOREIGN KEY(MPXN) REFERENCES supply_points(MPXN)
        PRIMARY KEY (serialNumber, MPXN)
      )`);
      console.log(`${table} created successfully`)
      return true;
    }
  } catch(e) {
    console.error(`CREATE ${table} TABLE ERROR`, e.message);
    return false;
  }
}

async function createCustomersMetersTable() {
  const table = TABLES.customersMeters.name;
  try {
    const tableExists = await checkTableExists(table);
    if(!tableExists) {
      const result = await db.run(`CREATE TABLE ${table} (
        serialNumber INTEGER NOT NULL,
        customerId INTEGER NOT NULL,
        FOREIGN KEY(serialNumber) REFERENCES meters(serialNumber)
        FOREIGN KEY(customerId) REFERENCES customers(customerId)
        PRIMARY KEY (serialNumber, customerId)
      )`);
      console.log(`${table} created successfully`)
      return true;
    }
  } catch(e) {
    console.error(`CREATE ${table} TABLE ERROR`, e.message);
    return false;
  }
}

async function createRegistersTable() {
  const table = TABLES.registers.name;
  try {
    const tableExists = await checkTableExists(table);
    if(!tableExists) {
      const result = await db.run(`CREATE TABLE ${table} (
        serialNumber INTEGER NOT NULL,
        registerId INTEGER PRIMARY KEY NOT NULL,
        FOREIGN KEY(serialNumber) REFERENCES meters(serialNumber)
      )`);
      console.log(`${table} created successfully`)
      return true;
    }
  } catch(e) {
    console.error(`CREATE ${table} TABLE ERROR`, e.message);
    return false;
  }
}

async function createReadingsTable() {
  const table = TABLES.readings.name;
  try {
    const tableExists = await checkTableExists(table);
    if(!tableExists) {
      const result = await db.run(`CREATE TABLE ${table} (
        serialNumber INTEGER NOT NULL,
        readDate TEXT NOT NULL,
        customerId INTEGER NOT NULL,
        registerId INTEGER NOT NULL,
        type TEXT NOT NULL,
        value INTEGER NOT NULL,
        MPXN INTEGER NOT NULL,
        FOREIGN KEY(MPXN) REFERENCES supplyPoints(MPXN)
        FOREIGN KEY(serialNumber) REFERENCES meters(serialNumber)
        FOREIGN KEY(customerId) REFERENCES customers(customerId)
        FOREIGN KEY(registerId) REFERENCES registers(registerId)
        PRIMARY KEY(customerId, serialNumber, registerId, readDate)
      )`);
      console.log(`${table} created successfully`)
      return true;
    }
  } catch(e) {
    console.error(`CREATE ${table} TABLE ERROR`, e.message);
    return false;
  }
}

async function readRows() {
  const result = await db.all(`SELECT * FROM ${TABLES.customers.name}`);
  return result;
}

async function insert(table, values = []) {
  try {
    const args = values.map(() => '?').join(',');
    const res = await db.run(`INSERT INTO ${table} VALUES (${args})`, values);
    return res;
  } catch(e) {
    if(e.message.includes('UNIQUE constraint failed')) {
      return { err: new Error(`INSERT ERROR: unable to insert into ${table}: ${e.message}`), reason: `Duplicate reading: ${values.join(', ')}` };
    } else {
      return { err: new Error(`INSERT ERROR: unable to insert into ${table}: ${e.message}`) };
    }
  }
}

async function getOne(sql) {
  try {
    return db.get(sql);
  } catch(e) {
    return { err: new Error(`READ ERROR: unable to read from table: ${e.message}`) };
  }
}

async function getAll(sql) {
  try {
    return db.all(sql);
  } catch(e) {
    return { err: new Error(`READ ERROR: unable to read from table: ${e.message}`) };
  }
}

async function addMeter() {
  const res = await insert(TABLES.meters.name, [123458, 98765])
}

async function addMeterPoint() {
  const res = await insert(TABLES.supplyPoints.name, [98765, 'MPAN'])
}

async function testSelect() {
  const table = TABLES.customersMeters.name;
  const sql = `SELECT * FROM ${table}`;
  return getAll(sql);
}

async function getMeterDetails(meterSerialNumber, MPXN) {
  const table1 = TABLES.meters.name;
  const table2 = TABLES.supplyPoints.name;

  const sql = `SELECT ${table1}.MPXN, type, serialNumber
    FROM ${table1} 
    INNER JOIN ${table2}
    ON ${table1}.MPXN = ${table2}.MPXN
    WHERE serialNumber = ${meterSerialNumber}
    AND ${table1}.MPXN = ${MPXN}
  `;

  return getOne(sql);
}

async function init() {
  db = await dbPromise;
  const customersTableCreated = await createCustomersTable();
  const supplyPointsTableCreated = await createSupplyPointsTable();
  const metersTableCreated = await createMetersTable();
  const customersMetersTableCreated = await createCustomersMetersTable();
  const registersTableCreated = await createRegistersTable();
  const readingsTableCreated = await createReadingsTable();

  if(customersTableCreated) {
    for (const customer of customers) {
      await insert(TABLES.customers.name, customer)
    }
  }

  if(supplyPointsTableCreated) {
    for (const meterPoint of supplyPoints) {
      await insert(TABLES.supplyPoints.name, meterPoint)
    }
  }

  if(metersTableCreated) {
    for (const meter of meters) {
      await insert(TABLES.meters.name, meter)
    }
  }

  if(customersMetersTableCreated) {
    for (const customerMeter of customersMeters) {
      await insert(TABLES.customersMeters.name, customerMeter)
    }
  }
  if(registersTableCreated) {
    for (const register of registers) {
      await insert(TABLES.registers.name, register)
    }
  }
}

module.exports = {
  getOne,
  getAll,
  insert,
  init,
};
