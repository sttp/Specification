## Design Notes

_These design notes have not been added to the main-line document yet, right now this document exists to make sure any design ideas that we are thinking about get captured so that documentation sections can address the design details._

- The protocol should be defined in such a way that the entire protocol does not have to be fully implemented. To encourage widespread adoption of STTP, certain functions such as Publish/Subscribe, Data Backfilling, Metadata Exchange, Metadata Synchronization, Historical Query Response, Protocol Encapsulation, Access Control, etc. should be broken out into separate optional specifications. These options will then be grouped into levels of compliance with the STTP protocol. In other words, you cannot claim to be a "STTP Data Concentrator" if you cannot do A, B, and C. Or you cannot claim to be a "STTP Gateway" if you cannot do X, Y, and Z. But an end/user application can get data from a Gateway if they support D and F.

## Protocol Message Format

Messages will be broken into small blocks that must all conform to one of the following specification.

Standard Message Format:
* (int16) Sync Bytes.  0xA77A.
* (int16) Block Size - The size of the entire block
* (uint16) Sequence Number - A number to identify that blocks are changing.
* (uint16) Runtime Feature ID - A number to identify the feature that is in use on this protocol.
* (byte[]) User Data (Block Size - 10)
* (int16) Some kind of checksum maybe CRC-CCITT.

Compact Message Format - This format may be negotiated, but should only be selected if the 
following can be guaranteed. 
 * Data passes integrity checksum
 * Data has guaranteed delivery
 * Data cannot arrive out of order

This is true for most TCP connections or for TLS streams. (Note: A PMU communicating over serial that 
goes through a serial to TCP transceiver will not qualify. This is because the serial interface does not have a 
good enough checksum, and buffer overflows in the transceiver may not be properly communicated on the TCP side)

Format:
* (1bit) FeatureBool (1 = Is Feature ID the same as the last message. 0 otherwise)
* (7bit) User data length (or 127 if the user data length is >= 127 bytes)
* (int16) (Optional) Runtime Feature ID (if FeatureBool=0)
* (int16) (Optional) User Data Length (if previous block equals 127)
* (byte[]) User Data

## Feature: Data Point Streaming
The data stream feature will detail how raw Data Points will be serialized on the wire. 

### Raw
If guaranteed delivery of messages in order cannot be obtained in the transport protocol. 
This Raw method must be used.

**Data Point Definition** - The serialization format of each Data Point must be negotiated before 
the data can be interpreted serialized. If the client receives a Data Point, but does not have 
this mapping information, the measurement will be undefined.

Mapping:
* (int8) Data Point Definition (Const = 1)
* (7BitUInt) Point Runtime ID
* (7BitUInt) Field Count
* (int8[]) Field Types

**Measurement String** - A series of raw data measurements.

Mapping
* (int8) Measurement String (Const = 0)
* (7BitUInt) Point count in this block
* For Each Point:
  * (7BitUInt) Point Runtime ID
  * (7BitUInt) Data Point Size
  * (byte[]) Data

### Standard
This method is the default method if the transport protocol can guaranteed delivery of messages in order.

**Data Point Definition** - The serialization format of each Data Point must be negotiated before 
the data can be interpreted serialized. If the client receives a point with no corresponding
mapping information, the connection must be terminated.

Mapping:
* (1bit) Same type as last time. 
* (0bits) Point Runtime ID (Increment by 1)
* (7bits) Reserved
* (int8) (Optional) Data Point Definition (Const = 1 if not the same as last time)
* (7BitUInt) Field Count
* (int8[]) Field Types

**Measurement String** - A series of raw data measurements.

Mapping
* (1bit) Same type as last time. 
* (int8) (Optional) Measurement String (Const = 0 if not the same as last time)
* (7BitUInt) Point count in this block
* For Each Point:
  * (1bit) Same Following PointID as the last time that the previous pointID was referenced
  * (7BitUInt) (Optional) Point Runtime ID, if the previous bit was 0
  * (byte[]) Data


### Ultra Compact
This method will be fairly complex, but should be a rather substantial reduction in bandwidth.

ToDo: Explain how this will look.

