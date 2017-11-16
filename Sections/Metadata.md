## Metadata

Metadata is exchanged in STTP as a table of records with attributes. The complete list of tables available from an STTP publisher may be requested over the command channel. When requesting all of the tables, a structure is returned as follows:

### Table Types
Three types of tables are defined in STTP.

* DataPoint Table - The DataPoint Table conveys metadata related to an STTP data point. Each publisher shall maintain zero or one DataPoint Table. The name of the table shall be 'DataPoint'. The publisher shall maintain one unique record with the DataPoint Table for each data point defined.

> TO DO: Define complex data structure and complex data structure mapping in definitions section. A CDSM may be either 'built-in' or 'user-defined'. 'Built-in' CDSMs may differ by industry. In the electric power industry, an example of a 'built-in' CDSM is a phasor.
* CDSM Table - A CDSM Table conveys metadata about a complex data structure. A publisher may maintain zero or more CDSM tables. A CDSM table shall only describe a CDSM defined at the publisher, and each record within the CDSM Table shall uniquely describe a corresponding mapping. An example of a CDSM in the transportation industry may be 'location', which is defined with two floating point values named 'latitude' and 'longitude'. Carrying forward this example, the desription attribute for a record within the Position Table might be, 'Location of Truck #42'.

* Resource Table - A Resource Table conveys metadata related to a resource available in the publisher's asset base. A publisher may maintain zero or more resource tables to describe the desired asset hierarchy. A resource is any asset, whether hardware, software or physical, that relates to a data point transmitted over the wire. The simplest example of a resource is a sensor, or the transducer used to digitize a measured value.

A maximum of 2^16 tables in any combination of the allowable types are permitted.

### Commands

Metadata commands are encapsulated into a Refresh Metadata packet. These commands are as follows.
> Note: these commands describe
what is required to make the server side metadata look like the client side metadata. Additional synchronization needs to occur
at the client side API when synchronizing with it's main repository.

* Response Publisher to Subscriber
  * UseTable - Changes the active table
    * int tableIndex
  * AddTable - Adds or Replaces a table if it already exists.
    * Guid majorVersion,
    * long minorVersion,
    * string tableName,
    * TableFlags flags
  * AddColumn - Adds a column.
    * int columnIndex,
    * string columnName,
    * ValueType columnType
  * AddValue - Adds or updates a value. Deleting a value would be to assign it with null.
    * int columnIndex,
    * int rowIndex,
    * byte[] value
  * DeleteRow - Removes an entire row of data.
    * int rowIndex,
  * TableVersion - Indicates what the current version of a table is.
    * int tableIndex
    * Guid majorVersion,
    * long minorVersion,
  * AddRelationship - Adds a table relationship. Sometimes known as a foreign key relationship.
    * int tableIndex
    * int columnIndex,
    * int foreignTableIndex
* Request Subscriber to Publisher
  * GetTable - Requests metadata from the specified table.
    * int tableIndex
    * int columnListCount
    * int[] columnIndexes
    * int filterExpressions
    * string[] filterExpressionStrings
  * SyncTable - Requests that the specified table is synchronized with the local copy. MajorVersion == Guid.Empty if the local table is blank.
    * int tableIndex
    * Guid majorVersion
    * long minorVersion
    * int columnListCount
    * int[] columnList
  * SelectAllTablesWithSchema - Gets all of the tables with their columns
  * GetAllTableVersions - Gets the version information for every table the user has access to.

### Attribute Value Types

When defining each attribute, it is important to identify the type of data that is expected in that field. The wireline
protocol itself will not enforce these requirements, but rather provides encoding mechanisms for transporting the data
and rules for how items can be converted to the desired type.  

#### Encoding

When attributes are serialized, the value field must be encoded using one of the following encoding types:

| Code | Type | Description |
|:----:|:---------:|------|
| 0x00 | Null | A null value. |
| 0x01 | String | A UTF8 encoded string |
| 0x02 | Single | A 32-bit floating point number encoded Big Endian |
| 0x03 | Double | A 64-bit floating point number encoded Big Endian |
| 0x04 | Decimal | A 128-bit floating point number encoded Big Endian |
| 0x05 | Int32 | A 32-bit integer number encoded Big Endian |
| 0x06 | Int64 | A 64-bit integer number encoded Big Endian |
| 0X07 | Guid | A 128-bit GUID encoded Big Endian |
| 0x08 | Ticks | A 64-bit date/time value encoded Big Endian |
| 0x09 | Binary | An array binary values |
| 0x0A | Boolean | A boolean value |

#### Defining

The list below defines how the measurement fields can be restricted and what types are permitted under each restriction.

* Integer
  * Supported Types: Null | Single | Double | Decimal | Int32 | Int64
* Float
  * Supported Types: Null | Single | Double | Decimal | Int32 | Int64
* Date
  * Supported Types: Null | Ticks
* Time
  * Supported Types: Null | Ticks
* Date Time
  * Supported Types: Null | Ticks
* Duration
  * Supported Types: Null | Ticks
* Boolean
  * Supported Types: Null | Boolean
* Binary
  * Supported Types: Null | Binary
* String
  * Supported Types: All since all types can be represented as a string.
* Guid
  * Supported Types: Null | Guid

### DataPoint Table Structure

For the DataPoint Table, the record identifier will correspond to the ID of the respective data point. The following table defines a minimal list of attributes associated with a data point.

| Attribute Name   | Attribute Value Type | Description |
|:----------------:|:--------------------:|:-----------:|
| PointID          | Guid    | The GUID associated with the data point. |

### CDSM Table Structure

It is not mandatory for the publisher to maintain a CDSM Table for every CDSM defined by the publisher. When the publisher optionally defines metadata for a CDSM, the table must contain the following minimal set of attributes.

| Attribute Name   | Attribute Value Type | Description |
|:----------------:|:--------------------:|:-----------:|
| CDSMID           | Guid    | The GUID associated with the CDSM. |

### Resource Table

It is not mandatory for the publisher to maintain Resource Tables. When the publisher optionally defines metadata for resources, the table must contain the following minimal set of attributes.

| Attribute Name  | Attribute Value Type | Description |
|:--------------: |:--------------------:|:-----------:|
| ResourceID      | Guid    | The GUID associated with the resource. |

### Dataset Filtering

Note: These may end up being client side filters to simplify the wireline protocol and the burden on the server side API.

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

| Attribute Name   | Attribute Value Type | Description |
|:----------------:|:--------------------:|:-----------:|
| PointID          | Guid    | The GUID associated with the data point. |
| PointTag         | String  | A string based unique identifier. |
| Description      | String  | A description for this measurement |
| ProducerTableName| String  | The name of the table within which the record for the resource that produced this data point resides. |
| ProducerTableID  | Guid    | The primary key for the record within the Producer Table. |
| SignalReference  | String  | A string based unique identifier |
| SignalTypeID     | Integer | A code describing the signal type |
| Adder            | Float   | An adjustment factor |
| Multiplier       | Float   | An adjustment factor |
| Signal Type      | String  | Fixed set of signal types. I.E.: (STAT\|FREQ\|DFREQ\|PM\|PA\|PR\|PI\|ANALOG\|DIGITAL\|CALC) |
| Phase Designation| String  | The phase this field is computed from. Ex: A,B,C,0,+,-
| Engineering Units| String  | The base units of this field. (Ex: Volts, Amps, Watts)
| Engineering Scale| Float   | The scaling factor of these units (Ex: 1, 1000, 1000,000)
| Channel Name     | String  | C37.118 Channel Name. For Digital types, an array of 16 elements are permitted. Array length shall be zero if this is not a C37.118 - derived data point.|
| PositionIndex    | Integer | C37.118 position index in a PMU frame. Zero for non-C37.118 data points. |

### PMU Table (a Resource Table example)

| Attribute Name  | Attribute Value Type | Description |
|:--------------: |:--------------------:|:-----------:|
| ResourceID      | Guid   | The GUID associated with the resource. |
| Acronym         | String | A name of the device. |
| Name            | String | A friendly name of the device |
| SubstationTableName| String | The name of the table within which the record for the substation where this PMU resides. |
| SubstationTableID  | Guid    | The primary key for the record within the substation table. |
| CompanyTableName| String | The name of the table within which the record for the company that owns this PMU. |
| CompanyTableID  | Guid   | The primary key for the record within the company table. |
| Protocol        | String | The protocol the device is communicating with |
| FrameRate       | String | The sample rate |
| FNOM            | String | C37.118 Nominal Frequency |
| IDCODE          | String | C37.118 ID Code |
| STN             | String | C37.118 Station Name |
| Nominal Voltage | Float  | The factor required to convert this voltage to a per unit base. |
| CT Ratio        | Float  | The ratio of a connected CT |
| Rated MVA       | Float  | The nominal rating of this device |
| Vendor          | String | The vendor of this device |
| Model           | String | The model number of this device |
| Equipment Type  | String | The type of equipment this device is monitoring (Ex: Line, Transformer) |
| Serial Number   | String | Serial numbers or other identifying information about this equipment) |
| In Service Date | Date   | The date this device was put in service |
| Out Service Date| Date   | The date this device was removed from service |

### Substation Table (a Resource Table example)

| Attribute Name  | Attribute Value Type | Description |
|:--------------: |:--------------------:|:-----------:|
| ResourceID      | Guid   | The GUID associated with the resource. |
| Name            | String | A friendly name of the substation. |
| Latitude        | Float  | The latitude of the substation. |
| Longitude       | Float  | The location of the substation. |
| TimeZone        | String | The time zone for the substation. |

### Phasor Table (a CDSM Table example)

The existence of this CDSM Table presumes the existence of a 'built-in' CDSM called 'Phasor'. For this example, assume that the Phasor CDSM is comprised of two fields: Magnitude (float) and Angle (float).

| Attribute Name   | Attribute Value Type | Description |
|:----------------:|:--------------------:|:-----------:|
| CDSMID           | Guid   | The GUID associated with an entry in the Phasor CDSM. |
| CDSMTag          | String | A string based unique identifier for the Phasor. |
| Description      | String | A description for this phasor, e.g. 'Smith Substation North Bus Voltage'. |
| IsCurrent        | Bit    | Set if this is a current phasor. |
| VoltAssociation  | Guid   | The ID of the voltage phasor used to compute power. Ignore if IsCurrent is reset. |
| AlternateVolt    | Guid   | An alternate voltage phasor, used when the primary voltage is unavailable. Ignore if IsCurrent is reset. |
| LineTableName    | String | The name of the table within which the record for the line associated with this current phasor resides. Ignore if IsCurrent is reset. |
| LineTableID      | Guid    | The primary key for the record within the line table. Ignore if IsCurrent is reset. |

### VIPair Table (a CDSM example)

The existence of this CDSM Table presumes the existence of a CDSM, 'built-in' or 'user-defined', called 'VIPair'. For this example, assume that the VIPair CDSM is comprised of two fields: Voltage (Phasor CDSM) and Current (Phasor CDSM).

| Attribute Name   | Attribute Value Type | Description |
|:----------------:|:--------------------:|:-----------:|
| CDSMID           | Guid   | The GUID associated with an entry in the VIPair CDSM. |
| CDSMTag          | String | A string based unique identifier for the VIPair. |
| Description      | String | A description for this VIPair, e.g. 'Smith-Jones Line'. |
