## Data Point Structure

When a subscriber has issued a [subscribe command](Commands.md#subscribe-command) to its publisher for select set of data points, the publisher will start sending [data point packet commands](Commands.md#data-point-packet-commands) each with a payload of several data point values serialized using the `DataPoint` structure, defined as follows:

```C
struct {
  int32 runtimeID;         // -1 if not specified, can optionally be sent instead of `id`.
  SttpValue id;            // A point Identifier.
  SttpValue timestamp;     // A timestamp, SttpTimestamp is highly recommended for this field but not required.
  SttpValue value;         // The single value that represents this Data Point.
  uint64 quality;          // Unstructured quality bits. See another section for details on the acutal bits used.
  SttpValue ExtendedData;  // Additional data that can be sent if `value` is insufficient.
}
DataPoint;
```

The actual number of `DataPoint` structures contained in the data point packet command depends the configured maximum payload size and the serialized size of the data point structures, see [Figure 6](#user-content-figure6).

<a name="figure6"></a> <center>

![Data Packet Command Details](Images/data-packet-command-details.png)

<sup>Figure 6</sup>
</center>

> :information_source: The maximum size of a `DataPoint` structure instance is unspecified, but controlled indirectly at the wire level protocol. With simple encoding techniques this size can be reduced down to a few bytes for most value types.

### Data Point Identifier

When identifying a Data Point, one of 4 mechanics are encouraged to identify the source of the time series data.

* [Guid] - Some kind of integer based identifier.
* [String] - This is commonly referred to as a tag in a time series databases.
* [SttpMarkup] - Essentially this is a connection string that combines a set of unique identifiers.

Runtime ID's are negotiated with the connection and are the default value type in the Data Point Structure.

While the normal use case is to use RuntimeIDs, for systems that have an indefinite number of IDs, it's not practical to map every point to a Runtime ID. In this case, it's allowed to send the identifier with the measurement.

### Sttp Value Types

The data types available to a `DataPoint` are described in the `ValueType` enumeration, defined below:

```C
enum {
  Null = 0,              // 0-bytes
  Int64 = 1,             // 8-bytes
  Single = 2,            // 4-bytes
  Double = 3,            // 8-bytes
  SttpTime = 4,          // Universal Time with Leap Seconds
  Bool = 5,              // 1-byte
  Guid = 6,              // 16-bytes
  String = 7,            // Limit defined in NegotiateSession
  SttpBuffer = 8,        // Limit defined in NegotiateSession
  SttpMarkup = 9,        // An array of SttpValue. Up to 255 elements.
  SttpBulkTransport = 10 // A pointer to a large object. Data must be requested as a seperate command.
}
ValueTypeCode; // sizeof(uint4), 1-nibble
```

- `Null`: No space occupied
- `Int64`: [64-bit Signed Integer](https://en.wikipedia.org/wiki/Integer_%28computer_science%29#Value_and_representation) (8-bytes, big-endian)
- `Single`: [32-bit Single Precision Floating Point](https://en.wikipedia.org/wiki/Single-precision_floating-point_format) (4-bytes, per [IEEE 754-2008](https://en.wikipedia.org/wiki/IEEE_754))
- `Double`: [64-bit Double Precision Floating Point](https://en.wikipedia.org/wiki/Double-precision_floating-point_format) (8-bytes, per [IEEE 754-2008](https://en.wikipedia.org/wiki/IEEE_754))
- `SttpTime`: [Time as `Timestamp`](https://en.wikipedia.org/wiki/System_time) (8-bytes, see [data point timestamp](#data-point-timestamp))
- `Bool`: [Boolean as 1-bit](https://en.wikipedia.org/wiki/Boolean_data_type) (1-bit, zero is `false`, 1 is `true`)
- `Guid`: [Globally Unique Identifer](https://en.wikipedia.org/wiki/Universally_unique_identifier) (16-bytes, big-endian for all components)
- `String` [Character String as `StringValue`](https://en.wikipedia.org/wiki/String_%28computer_science%29) (encoding is UTF8)
- `SttpBuffer` [Untyped Data Buffer as `BufferValue`](https://en.wikipedia.org/wiki/Data_buffer)
- `SttpMarkup` [Untyped Data Buffer as `BufferValue`](https://en.wikipedia.org/wiki/Data_buffer)
- `SttpBulkTransport` [Untyped Data Buffer as `BufferValue`](https://en.wikipedia.org/wiki/Data_buffer)

### Encoding Methods

When encoding each of these values, a 4-bit ValueTypeCode will be written first, then the value itself will be written. The 4-bit prefix can be optimally eliminated, but a separate encoding algorithm must make that determination.

All serialization will occur through the Bit-Byte-Block. So reference that section for additional serialization details.

Unless specifically called out below, the types are serialized using the BitByteBlock corresponding type.

#### Int64

These values are variable length encoded where leading 0's are not stored. In order to prevent a value of -1 from consuming a full 8 bytes, this value will undergo a lossless transformation of its bits so it has leading 0's. The transformation is described in the following code:

Encoding: rotate left 1, then inverts bits 1-63 if bit 0 is 1.
Decode: invert bits 1-63 if bit0 is 1, then rotate right 1.

``` C
long PackSign(long value)
{
    if (value >= 0)
        return value << 1;
    return (~value << 1) + 1;
}

long UnPackSign(long value)
{
    if ((value & 1) == 0)
        return (value >> 1) & long.MaxValue;
    return (~value >> 1) | long.MinValue;
}
```

After Packing the value, it is serialized using Write8BitSegments.

#### SttpTime

SttpTime is a specially encoded timestamp based on Microsoft's .NET DateTime field, however, a leap second can be added at the end of every minute. There are approximately 145 billion seconds of space unused in the first 62-bits of the DateTime field. However, there are only 5 billion distinct minutes between year 1 and 9999. The space above DateTime.MaxValue has been allocated to a 61st second.

SttpTime is encoded/decoded as a typical int64 consuming 8 bytes (as opposed to a variable length SttpValueTypeCode.Int64)

#### SttpBuffer

This value contains only a byte buffer, and is serialized using `BitByteBlock.Write(byte[] data);`

#### SttpMarkup

At it's core, a SttpMarkup is only a byte buffer, and is serialized using `BitByteBlock.Write(byte[] data);`

See SttpMarkup section for more details on how the internals of this object are serialized.

#### SttpBulkTransport

This value is a pointer type, and contains the following fields.

```C
struct {
  SttpValueTypeCode fundamentalType;  // The type of the underlying data.
  Guid bulkTransportID                // The ID that can be used to request this data.
  long length;                        // The length of the data.
}
SttpBulkTransport;
```

And is serialized as:
- Bits4(fundamentalType);
- Guid(bulkTransportID);
- Int64(length);
