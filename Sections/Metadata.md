## Metadata

Metadata is exchanged in STTP as a table of records with attributes. When requesting all of the tables, a structure is returned as follows:

* (Guid) Base Version ID - Identifies a major change that requires a resync of all metadata. This is also used for devices that don't support metadata revision. This value can then be changed with each revision to the metadata.
* (Int32) Latest Version Number - A incrementing change counter when metadata is modified.
* (Int32) Table Count
  * (Byte) Length of Table Name
  * (String) Table Name
  * (Int32) Last Modified Version Number

When requesting data from a Table, the following structure will be returned:

* (Byte) Length of Table Name
* (String) Table Name - Limited to 100 ASCII characters.
* (Int32) Record Count
  * (Guid) Record Identifier 
  * (Int32) Last Modified Version Number
  * (Int32) Attribute Count 
    * (byte) Attribute Name Length.
    * (String) Attribute Name - Limited to 100 ASCII characters.
    * (Int32) Array Index - Defaults to 0. For attributes that support multiple values, these are indexed here.
    * (Byte) The attribute value code. 
    * (Int16) The size of the Attribute Value.
    * (byte[]) Attribute Value

### Attribute Value Types

When defining each attribute, it's important to identify the type of data that is expected in that field. The wireline
protocol itself will not enforce these requirements, but rather provides encoding mechanisms for transporting the data 
and rules for how items can be converted to the desired type.  

#### Encoding

When attributes are serialized, the value field must be encoded using one of the following encoding types:

| Code | Type | Description |
|:----:|:---------:|------|
| 0x00 | Null | A null value. |
| 0x01 | XML Decimal | Corresponds to xs:decimal |
| 0x02 | XML Integer | Corresponds to xs:integer |
| 0x03 | XML Date | Corresponds to xs:date |
| 0x04 | XML Time | Corresponds to xs:time |
| 0x05 | XML DateTime | Corresponds to xs:dateTime |
| 0x06 | XML Duration | Corresponds to xs:duration |
| 0x07 | XML Boolean | Corresponds to xs:boolean |
| 0x08 | XML Binary | Corresponds to xs:hexBinary |
| 0x09 | XML URI | Corresponds to xs:anyURI |
| 0x0A | XML Base64 | Corresponds to xs:base64Binary |
| 0x0B | String | A UTF8 encoded string |
| 0x0C | Single | A 32-bit floating point number encoded Big Endian |
| 0x0D | Double | A 64-bit floating point number encoded Big Endian |
| 0x0E | Decimal | A 128-bit floating point number encoded Big Endian |
| 0x0F | Int32 | A 32-bit integer number encoded Big Endian |
| 0x10 | Int64 | A 64-bit integer number encoded Big Endian |
| 0X11 | Guid | A 128-bit GUID encoded Big Endian |
| 0x12 | Ticks | A 64-bit date/time value encoded Big Endian |
| 0x13 | Binary | An array binary values |
| 0x14 | Boolean | A boolean value |

#### Defining

The list below defines how the measurement fields can be restricted and what types are permitted under each restriction.

* Integer
  * Supported Types: Null | XML Decimal | XML Integer | Single | Double | Decimal | Int32 | Int64
* Float
  * Supported Types: Null | XML Decimal | XML Integer | Single | Double | Decimal | Int32 | Int64
* Date
  * Supported Types: Null | XML Date | XML Time | XML DateTime | Ticks
* Time
  * Supported Types: Null | XML Date | XML Time | XML DateTime | Ticks
* Date Time
  * Supported Types: Null | XML Date | XML Time | XML DateTime | Ticks
* Duration
  * Supported Types: Null | XML Duration | Ticks
* Boolean
  * Supported Types: Null | XML Boolean | Boolean
* Binary
  * Supported Types: Null | XML Binary | XML Base64 | Binary
* String
  * Supported Types: All since all types can be represented as a string.
* Guid
  * Supported Types: Null | String | Guid


### Measurement Table

For the measurement table, the record identifier will correspond to the Measurement's ID. The following table is a list of all of the optional attributes that can be associated with a measurement.

| Attribute Name   | Supports Arrays | Attribute Value Type | Description |
|:----------------:|:---------------:|:--------------------:|:-----------:|
| DeviceID         | N | Guid    | The GUID associated with the device record stored in the Device Table |
| PointTag         | N | String  | A string based unique identifier |
| SignalReference  | N | String  | A string based unique identifier |
| SignalTypeID     | N | Integer | A code describing the signal type |
| Adder            | N | Float   | An adjustment factor |
| Multiplier       | N | Float   | An adjustment factor |
| Description      | Y | String  | A description for this measurement |
| Channel Name     | Y | String  | C37.118 Channel Name. For Digital types, an array of 16 elements are permitted. |
| Signal Type      | N | String  | C37.118 related signal type. Ex: (STAT\|FREQ\|DFREQ\|PM\|PA\|PR\|PI\|ANALOG\|DIGITAL) |
| PositionIndex    | N | Integer | C37.118 position index in a PMU frame |
| Phase Designation| N | String  | The phase this field is computed from. Ex: A,B,C,0,+,-
| Engineering Units| N | String  | The base units of this field. (Ex: Volts, Amps, Watts)
| Engineering Scale| N | Float   | The scaling factor of these units (Ex: 1, 1000, 1000,000)

### Device Table

For the device table, the record identifier is the DeviceID. The following table is a list of all of the optional attributes that can be associated with a device.

| Attribute Name  | Supports Arrays | Attribute Value Type | Description |
|:--------------: |:---------------:|:--------------------:|:-----------:|
| Acronym         | N | String | A name of the device. |
| Name            | N | String | A friendly name of the device |
| Company         | N | String | The company who owns the device |
| Protocol        | N | String | The protocol the device is communicating with |
| Latitude        | N | Float  | The latitude of the device |
| Longitude       | N | Float  | The location of the device |
| TimeZone        | N | String | The time zone for the data |
| FrameRate       | N | String | The sample rate |
| FNOM            | N | String | C37.118 Nominal Frequency |
| IDCODE          | N | String | C37.118 ID Code |
| STN             | N | String | C37.118 Station Name |
| Nominal Voltage | N | Float  | The factor required to convert this voltage to a per unit base. |
| CT Ratio        | N | Float  | The ratio of a connected CT |
| Rated MVA       | N | Float  | The nominal rating of this device |
| Vendor          | N | String | The vendor of this device |
| Model           | N | String | The model number of this device |
| Equipment Type  | Y | String | The type of equipment this device is monitoring (Ex: Line, Transformer) |
| Substation      | N | String | The substation this device is from |
| Serial Number   | Y | String | Serial numbers or other identifying information about this equipment) |
| In Service Date | Y | Date   | The date this device was put in service |
| Out Service Date| Y | Date  | The date this device was removed from service |

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

