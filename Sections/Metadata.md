## Metadata

Metadata is exchanged in STTP as a table of records with attributes. When requesting all of the tables, a structure is returned as follows:

* (Guid) Base Version ID - Identifies a major change that requires a resync of all metadata. This is also used for devices that don't support metadata revision. This value can then be changed with each revision to the metadata.
* (Int32) Latest Version Number - A incrementing change counter when metadata is modified.
* (Int32) Table Count
  * (String) Table Name
  * (Int32) Last Modified Version Number

When requesting data from a Table, the following structure will be returned:

* (String) Table Name - Limited to 100 ASCII characters.
* (Int32) Record Count
  * (Guid) Record Identifier 
  * (Int32) Last Modified Version Number
  * (Int32) Attribute Count 
    * (String) Attribute Name - Limited to 100 ASCII characters.
    * (Int32) Array Index - Defaults to 0. For attributes that support multiple values, these are indexed here.
    * (byte[]) Attribute Value

### Attribute Value Types
When attributes are serialized, they must conform to one of the following encoding methods:

| Prefix | Type | Description |
|:----:|---------|:------:
| 0x00 | Null | A null value. |
| 0x01 | String Numeric | ASCII string that follows the provided format: -289274.283991 Sign is optional, Decimal point is optional. Exponents are not permitted. Commas are not permitted. |
| 0x02 | String DateTime | ASCII string that follows: 2009-06-15T13:45:30.0000000-07:00 or 2009-06-15T13:45:30.0000000Z |
| 0x03 | String Date | ASCII string that follows: 2009-06-15 |
| 0x04 | String Time | ASCII string that follows: 13:45:30.0000000  |
| 0x05 | String | A UTF8 encoded string |
| 0x06 | Single | A 32-bit floating point number encoded Big Endian |
| 0x07 | Double | A 64-bit floating point number encoded Big Endian |
| 0x08 | Decimal | A 128-bit floating point number encoded Big Endian |
| 0x09 | Int32 | A 32-bit integer number encoded Big Endian |
| 0x0A | Int64 | A 64-bit integer number encoded Big Endian |
| 0x0B | Guid | A 128-bit GUID encoded Big Endian |
| 0x0C | Ticks | A 64-bit date/time value encoded Big Endian |

### Measurement Table

For the measurement table, the record identifier will correspond to the Measurement's ID. The following table is a list of all of the optional attributes that can be associated with a measurement.

| Attribute Name | Supports Arrays | Attribute Value Type | Description |
|:----:|---------|:------:|:--------:|-------------|
| DeviceID | N | String \| Guid | The GUID associated with the device record stored in the Device Table |
| PointTag | N | String | A string based unique identifier |
| SignalReference | N | String | A string based unique identifier |
| SignalTypeID | N | String Numberic \| Int32 | A code describing the signal type |
| Adder | N | String Numberic \| Single \| Double \| Decimal | An adjustment factor |
| Multiplier | N | String Numberic \| Single \| Double \| Decimal | An adjustment factor |
| Description | Y | String | A description for this measurement |
| Channel Name | Y | String | C37.118 Channel Name. For Digital types, an array of 16 elements are permitted. |
| ValueType | N | String | C37.118 related signal type. Ex: (STAT\|FREQ\|DFREQ\|PM\|PA\|PR\|PI\|ANALOG\|DIGITAL) |
| PositionIndex | N | String Numeric \| Int32 | C37.118 position index in a PMU frame |

### Device Table

For the device table, the record identifier is the DeviceID. The following table is a list of all of the optional attributes that can be associated with a device.

| Attribute Name | Supports Arrays | Attribute Value Type | Description |
|:----:|---------|:------:|:--------:|-------------|
| Acronym | N | String | A name of the device. |
| Name | N | String | A friendly name of the device |
| Company | N | String | The company who owns the device |
| Protocol | N | String | The protocol the device is communicating with |
| Latitude | N | String Numberic \| Single \| Double \| Decimal | The latitude of the device |
| Longitude | N | String Numberic \| Single \| Double \| Decimal | The location of the device |
| TimeZone | N | String | The time zone for the data |
| FrameRate | N | String | The sample rate |
| FNOM | N | String | C37.118 Nominal Frequency |
| IDCODE | N | String | C37.118 ID Code |
| STN | N | String | C37.118 Station Name |

### Dataset Contents

* Minimum required dataset for STTP operation
* Industry specific dataset extensions (outside scope of this doc)

### Dataset Filtering

* Format of expressions that work against metadata
  * SQL style expressions
  * Regex style expressions
* Application of expressions
  * Metadata reduction (by subscriber)
  * Data point access security

### Dataset Versioning

* Versioned
* Difference based publication

### Dataset Serialization

* Serialization for transport
  * Packet based publication using temporal data point
  * Publisher reduction by access rights and diff-version
  * Subscriber reduction by filter expression
* Serialization to local repository
  * Merging considerations
  * Conflict resolution
  * Ownership control

