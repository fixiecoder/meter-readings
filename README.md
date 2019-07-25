# Meter Readings

I have used a sqlite database to back this server. The relational data for the customers, meters, registers, supply points is built on initial run and populated with mock data. An empty readings table is also created and can be populated by calling:

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