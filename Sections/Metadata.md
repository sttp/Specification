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
