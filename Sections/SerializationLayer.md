# Serialization Layer

_All data exchange of any type (measurements, commands, metadata) must be taken from its native type and converted 
into a byte level representation. This section of the document will describe the structure around how all data will
be serialized for transport._

## Reasoning

While existing serialization methods such as XML, JSON, and google Protocol Buffers could be used to serialize STTP, 
the overhead associated with these protocols is too high for serializing millions of measurements per second at an 
average size less than 4 bytes per measurement. Existing GEP has a lossless data compression method that can
transport data at just over 2 bytes per measurement. 

## Overview

Rather than reinvent a comprehensive serialization format, only a very fundamental means of transporting data will be
allowed by this layer. This will be somewhat modeled after ODBC or other structured data serialization methods. 

The following rules apply:
* All data must be transmitted as complete units of data known as records. (think of SQL rows)
* Each record must have a user specified number of fields in the records 
  and each field must have a name and a type. (Record Definition)
* Before sending any data, a channel with a name and a Record Definition must be created. (think of SQL tables) 

It's also import that record definitions specify the desired compression algorithms that can be used to 
serialize the data. If this is left blank, the data will be serialized in it's raw format.

## Example Uses

Record Definition for measurements:
* (Guid) MeasurementID [Compression: Remap to Int]
* (DateTime) Timestamp [Compression: On Change]
* (Float) Value [Compression: Bits Changed]
* (Int32) Flags [Compression: On Change]

Record Definition for Metadata
* (Int32) NodeID
* (Int32) ParentNodeID
* (String) Attribute Name
* (String) Attribute Value
* (byte) Value Data Type

Record Definition for Commands
* (String) Command Code
* (String) Command Text