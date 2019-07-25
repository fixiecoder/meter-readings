# Meter Readings

I have used a sqlite database to back this server. The relational data for the customers, meters, registers, supply points is built on initial run and populated with mock data. An empty readings table is also created.

## Prepopulated data and schema

Each all data is realted through foreign keys. Data could be further normalised but due to time constraints I have left it at this level.

### Customers
```
 customerId | firstname | lastname
------------|-----------|----------
 1          | Dave      | Lister
 2          | Arnold    | Rimmer
 2          | Kristine  | Kochanski
```

### Meters
```
 serialNumber | MPXN
--------------|-------
 123458       | 98765
 123459       | 98766
 123460       | 98767
 123461       | 98768
 123462       | 98769
 123463       | 98770
```

### Supply points
```
 MPXN  | type
-------|------
 98765 | MPAN 
 98766 | MPRN
 98767 | MPAN
 98768 | MPRN
 98769 | MPAN
 98770 | MPRN
```


### Registers
```
 serialNumber | MPXN
--------------|-------
 123458       | 11112
 123458       | 11113
 123459       | 11114
 123459       | 11115
 123460       | 11116
 123460       | 11117
 123461       | 11118
 123461       | 11119
 123462       | 11120
 123462       | 11121
 123463       | 11122
 123463       | 11123
```

### Customer meters
```
 serialNumber | MPXN
--------------|-------
 123458       | 1
 123459       | 1
 123460       | 2
 123461       | 2
 123462       | 3
 123463       | 3
```

## Routes

### Submit reading

`POST /meter-read`;

Example body:

```
{
    "customerId": "1",
    "serialNumber": "123458",
    "mpan": "98765",
    "read": [
        {"type": "ANYTIME", "registerId": 11112, "value": "2729"},
        {"type": "NIGHT", "registerId": 11113, "value": "2892"}
    ],
    "readDate": "2019-04-07T10:01:15+00:00Z"
}
```

The above meter reading should successfully be added to the database after being validated. Validation is currently limited to checking that the meter belongs to the customer and that the `registerId`s belong to the meter.

If a dupliate reading is submitted it will be rejected, a duplicate is a reading that has the same customerId, meter serial number, MPXN and readDate.

### Get customer readings

`GET /meter-read/customer/:customerId/meter/:serialNumber`

Returns an array of readings in the same format that they were submitted.