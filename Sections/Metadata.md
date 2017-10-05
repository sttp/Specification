## Metadata

Metadata is exchanged in STTP as a table of records with attributes. The complete list of tables available from an STTP publisher may be requested over the command channel. When requesting all of the tables, a structure is returned as follows:

### Table Types
Three types of tables are defined in STTP.
* DataPoint Table - The DataPoint Table conveys metadata related to an STTP data point. Each publisher shall maintain one DataPoint Table. The name of the table shall be 'DataPoint'. The publisher shall maintain one unique record with the DataPoint Table for each data point defined.
> :todo: Define complex data structure and complex data structure mapping in definitions section. A CDSM may be either 'built-in' or 'user-defined'. 'Built-in' CDSMs may differ by industry. In the electric power industry, an example of a 'built-in' CDSM is a phasor.
* CDSM Table - A CDSM Table conveys metadata about a complex data structure. A publisher may maintain from zero to 2^15 CDSM tables. A CDSM table shall only describe a CDSM defined at the publisher, and each record within the CDSM Table shall uniquely describe a corresponding mapping. An example of a CDSM in the transportation industry may be 'location', which is defined with two floating point values named 'latitude' and 'longitude'. Carrying forward this example, the desription attribute for a record within the Position Table might be, 'Location of Truck #42'.
* Resource Table - A Resource Table conveys metadata related to a resource available in the publisher's asset base. A publisher may maintain from zero to 2^15 resource tables to describe the desired asset hierarchy. A resource is any asset, whether hardware, software or physical, that relates to a data point transmitted over the wire. The simplest example of a resource is a sensor, or the transducer used to digitize a measured value.

### Command Channel Responses

* (Guid) Base Version ID - Identifies a major change that requires a resync of all metadata. This is also used for devices that don't support metadata revision. This value can then be changed with each revision to the metadata.
* (Int32) Latest Version Number - A incrementing change counter when metadata is modified.
* (Int32) Table Count
  * (Byte) Length of Table Name
  * (String) Table Name
  * (Int8) Table Type - Limited to 0:DataPoint, 1:CDSM, 2: Resource.
  * (Int32) Last Modified Version Number

The list of attributes available in a given table may be requested over the command channel. When requesting attributes from a table, the following structure will be returned:

* (Byte) Length of Table Name
* (String) Table Name - Limited to 100 ASCII characters.
* (Int8) Table Type - Limited to 0:DataPoint, 1:CDSM, 2: Resource.
* (Int32) Latest Version Number
* (Int32) Record Count
* (Int32) Attribute Count 
  * (byte) Length of Attribute Name
  * (String) Attribute Name - Limited to 100 ASCII characters.
  * (Byte) Attribute Value Type code
  * (Int16) Size of the Attribute Value
  * (Int32) Last Modified Version Number

When requesting data from a table, the following structure will be returned:

* (Byte) Length of Table Name
* (String) Table Name - Limited to 100 ASCII characters.
* (Int8) Table Type - Limited to 0:DataPoint, 1:CDSM, 2: Resource.
* (Int32) Latest Version Number
* (Int32) Record Count
  * (Guid) Record Identifier
  * (Int32) Last Modified Version Number
  * (Int32) Attribute Count 
    * (byte) Length of Attribute Name
    * (String) Attribute Name - Limited to 100 ASCII characters.
    * (Byte) Attribute Value Type code
    * (Int32) Array Index - Defaults to 0. For attributes that support multiple values, these are indexed here.
    * (Int16) Size of the Attribute Value
    * (Int32) Last Modified Version Number
    * (byte[]) Attribute Value

### Attribute Value Types

When defining each attribute, it is important to identify the type of data that is expected in that field. The wireline
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

### DataPoint Table Structure

For the DataPoint Table, the record identifier will correspond to the ID of the respective data point. The following table defines a minimal list of attributes associated with a data point.

| Attribute Name   | Supports Arrays | Attribute Value Type | Description |
|:----------------:|:---------------:|:--------------------:|:-----------:|
| PointID          | N | Guid    | The GUID associated with the data point. |
| PointTag         | N | String  | A string based unique identifier. |

### CDSM Table Structure

It is not mandatory for the publisher to maintain a CDSM Table for every CDSM defined by the publisher. When the publisher optionally defines metadata for a CDSM, the table must contain the following minimal set of attributes. 

| Attribute Name   | Supports Arrays | Attribute Value Type | Description |
|:----------------:|:---------------:|:--------------------:|:-----------:|
| CDSMID           | N | Guid    | The GUID associated with the CDSM. |
| CDSMTag          | N | String  | A string based unique identifier. |

### Resource Table

It is not mandatory for the publisher to maintain Resource Tables. When the publisher optionally defines metadata for resources, the table must contain the following minimal set of attributes.

| Attribute Name  | Supports Arrays | Attribute Value Type | Description |
|:--------------: |:---------------:|:--------------------:|:-----------:|
| ResourceID      | N | Guid    | The GUID associated with the resource. |

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

## Appendix Z - Power Industry Examples (To be moved later)

Here are some examples of metadata suitable for the electric power industry.

### DataPoint Table

A publisher might try the following DataPoint Table for the power industry.

| Attribute Name   | Supports Arrays | Attribute Value Type | Description |
|:----------------:|:---------------:|:--------------------:|:-----------:|
| PointID          | N | Guid    | The GUID associated with the data point. |
| PointTag         | N | String  | A string based unique identifier. |
| Description      | Y | String  | A description for this measurement |
| ProducerTableName| N | String  | The name of the table within which the record for the resource that produced this data point resides. |
| ProducerTableID  | N | Guid    | The primary key for the record within the Producer Table. |
| SignalReference  | N | String  | A string based unique identifier |
| SignalTypeID     | N | Integer | A code describing the signal type |
| Adder            | N | Float   | An adjustment factor |
| Multiplier       | N | Float   | An adjustment factor |
| Signal Type      | N | String  | Fixed set of signal types. I.E.: (STAT\|FREQ\|DFREQ\|PM\|PA\|PR\|PI\|ANALOG\|DIGITAL\|CALC) |
| Phase Designation| N | String  | The phase this field is computed from. Ex: A,B,C,0,+,-
| Engineering Units| N | String  | The base units of this field. (Ex: Volts, Amps, Watts)
| Engineering Scale| N | Float   | The scaling factor of these units (Ex: 1, 1000, 1000,000)
| Channel Name     | Y | String  | C37.118 Channel Name. For Digital types, an array of 16 elements are permitted. Array length shall be zero if this is not a C37.118 - derived data point.|
| PositionIndex    | N | Integer | C37.118 position index in a PMU frame. Zero for non-C37.118 data points. |

### PMU Table (a Resource Table example)

| Attribute Name  | Supports Arrays | Attribute Value Type | Description |
|:--------------: |:---------------:|:--------------------:|:-----------:|
| ResourceID      | N | Guid   | The GUID associated with the resource. |
| Acronym         | N | String | A name of the device. |
| Name            | N | String | A friendly name of the device |
| SubstationTableName| N | String | The name of the table within which the record for the substation where this PMU resides. |
| SubstationTableID  | N | Guid    | The primary key for the record within the substation table. |
| CompanyTableName| N | String | The name of the table within which the record for the company that owns this PMU. |
| CompanyTableID  | N | Guid   | The primary key for the record within the company table. |
| Protocol        | N | String | The protocol the device is communicating with |
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
| Serial Number   | Y | String | Serial numbers or other identifying information about this equipment) |
| In Service Date | Y | Date   | The date this device was put in service |
| Out Service Date| Y | Date   | The date this device was removed from service |

### Substation Table (a Resource Table example)

| Attribute Name  | Supports Arrays | Attribute Value Type | Description |
|:--------------: |:---------------:|:--------------------:|:-----------:|
| ResourceID      | N | Guid    | The GUID associated with the resource. |
| Name            | N | String | A friendly name of the substation. |
| Latitude        | N | Float  | The latitude of the substation. |
| Longitude       | N | Float  | The location of the substation. |
| TimeZone        | N | String | The time zone for the substation. |

### Phasor Table (a CDSM Table example)

The existence of this CDSM Table presumes the existence of a 'built-in' CDSM called 'Phasor'. For this example, assume that the Phasor CDSM is comprised of two fields: Magnitude (float) and Angle (float).

| Attribute Name   | Supports Arrays | Attribute Value Type | Description |
|:----------------:|:---------------:|:--------------------:|:-----------:|
| CDSMID           | N | Guid   | The GUID associated with an entry in the Phasor CDSM. |
| CDSMTag          | N | String | A string based unique identifier for the Phasor. |
| Description      | N | String | A description for this phasor, e.g. 'Smith Substation North Bus Voltage'. |
| IsCurrent        | N | Bit    | Set if this is a current phasor. |
| VoltAssociation  | N | Guid   | The ID of the voltage phasor used to compute power. Ignore if IsCurrent is reset. |
| AlternateVolt    | N | Guid   | An alternate voltage phasor, used when the primary voltage is unavailable. Ignore if IsCurrent is reset. |
| LineTableName    | N | String | The name of the table within which the record for the line associated with this current phasor resides. Ignore if IsCurrent is reset. |
| LineTableID      | N | Guid    | The primary key for the record within the line table. Ignore if IsCurrent is reset. |

### VIPair Table (a CDSM example)

The existence of this CDSM Table presumes the existence of a CDSM, 'built-in' or 'user-defined', called 'VIPair'. For this example, assume that the VIPair CDSM is comprised of two fields: Voltage (Phasor CDSM) and Current (Phasor CDSM).

| Attribute Name   | Supports Arrays | Attribute Value Type | Description |
|:----------------:|:---------------:|:--------------------:|:-----------:|
| CDSMID           | N | Guid   | The GUID associated with an entry in the VIPair CDSM. |
| CDSMTag          | N | String | A string based unique identifier for the VIPair. |
| Description      | N | String | A description for this VIPair, e.g. 'Smith-Jones Line'. |

