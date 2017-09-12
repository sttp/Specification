## Design Notes

_These design notes have not been added to the main-line document yet, right now this document exists to make sure any design ideas that we are thinking about get captured so that documentation sections can address the design details._

** These are thoughts captured by SEC **

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

## Protocol Negotiation
Upon connection, session details must be negotiated. The initial negotiation will be done in the clear,
but renegotiation can be done at anytime. It is recommended if encryption is to be used that
the first negotiation step will only negotiate the encryption, after the secured channel has been
established, then more of the session can be configured.

Items to be negotiated:
* Encryption: TLS-1.0, TLS-1.2, ZeroMQ, Kerberos, None
* Authentication: Password, LDAP, Windows, Certificate, None
* Message Format: Standard/Compact
* Connection Type: Who is Client/Server/Peer. (This allows server initiated connections if they are desired)
* List of all supported features needed for this connection
* Data Point Stream Format: Raw/Standard/Ultra Compact


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


## IEEE C37.118 Mapping



### Encapsulation

A C37.118 stream can be encapsulated in its raw format inside sttp using the following
definitions. The intent of this definition is to make sttp transparent so a sttp service can
transport insecure C37.118 over an untrusted medium.

C37.118 -> sttp -> C37.118

**Use Case:** A light weight front-end processor manages connectivity to all or a subset of PMU/PDCs
communicating via C37.118. Existing server applications can through a single connection, connect to this
front-end processor to receive all of the raw data. This application then uses its own mapping to interpret the
raw data. Since each vendor has their own proprietary mapping, it's naive to think we can create one mapping
that everyone will adopt. In addition, a neighboring utility can also run a lightweight service
that can connect to this front-end processor and translate it back into a C37.118 stream without
having to maintain another local database of how to map it back into a C37.118 stream.

> :tomato::question: JRC: I was thinking the following kind of mapping would be available in a extended
> metadata table, e.g., `IEEEC37.118` table with an ID or name for the mapping,
> the field types and measurement mappings.

> :bulb: SEC: I would think it would not be adventageous to make a dedicated hard coded table that
> will maintain this mapping information. It would make extensibility more difficult.

Metadata for each Data Point:
 * (int16) Data Concentrator ID Code
 * (int16) ID Code of data source
 * (int32) Time Base
 * (char) Value Type (S=Stat, P=Phasor, F=Freq, Q=DFreq, A=Analog, D=Digital)
 * (int8) Size (2/4)
 * (char) Phasor Type (R=Rect, P=Polar)
 * (int16) Position Index (eg. whether this is the first or second phasor or analog)
 * (int16) PMU Number (eg. whether this is the first of second PMU in a concentrated stream)
 * (char16) Station Name
 * (char16[16]) Channel Name (Array of 16 if channel type is Digital)
 * (int16) Nominal Line Frequency
 * (int16) Rate of data transmission
 * (int16) Config Change Count

> :confused: JRC: Note sure I understand the following - this seems to break the tenant of
> mapping primitives? Even if broken into chunks, this would require identification and
> sequencing of chunks? Perhaps I am missing your idea here...

> :bulb: SEC: I see. I'm not trying to "map" premitives. I've created a new section in the
> document for mapping into the generic Data Point type. This is simply what I understand is necessary
> to transport the data in it's raw format.
>
> I'm focusing on what the transport layer looks like. How the higher level API decides
> to use this data has yet to be defined and can vary from application to application.
> We may not decide support encapsulation, but either way, the wireline protocol should not care
> how the API decides to use it.

Data Point
 * (MetaData) All of the metadata that was exchanged with this point, mapped to a Runtime ID.
 * (uint32) SOC
 * (uint24) FrameSec
 * (uint8) Time Quality
 * One of the following:
   * Status, Digital, Int16 Freq, Int16 DFreq, Int16 Analog
     * (int16) Value
   * Float Freq, Float DFreq, Float Analog
     * (float) Value
   * Int16 Phasor (Rect or Polar)
     * (int16) Value1 (Mag/Real)
     * (int16) Value2 (Ang/Im)
   * Float Phasor (Rect or Polar)
     * (float) Value1 (Mag/Real)
     * (float) Value2 (Ang/Im)


### Mapping

To be described later once a generic Data Point has been described.

##### DateTime2 Structure

Uniquely represent time and supports leap seconds. This structure is designed to work hand in hand with native DateTime structure in .NET. This structure will also sort as expected when encountering a leap second.

```C
struct {
  uint22 days;
  uint40 ticks;
  uint2 flags;
}
Version;
```
- The `days` field defines the number of days that have elapsed since Jan 1, 0001.
- The `ticks` field defines the number of 100 nanosecond ticks that have elapsed since the start of the day.
- The `flags` field defines currently unused bits that will be later defined.

In order to properly support leap seconds, the time must be represented in UTC, and the `ticks` field will be >= 864,000,000,000 (The number of ticks in a day). This will represent that 1 second was added to the end of the current day.

The intent of this structure is for the sole purpose of storing and transporting leap second related time.
When transformations are done on this structure, it will be converted into a language native type to perform this functions.
This will result in a loss of leap second data, but would yield more predictable results. For example: adding 1 minute to 12/31/2006 11:59:03 should not return 1/1/2017 12:00:02, even though that is technically the correct answer.
