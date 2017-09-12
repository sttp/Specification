## Data Point Structure

When a subscriber has issued a [subscribe command](Commands.md#subscribe-command) to its publisher for select set of data points, the publisher will start sending [data point packet commands](Commands.md#data-point-packet-commands) each with a payload of several _data point structures_, defined as follows, where the actual number of data point structures contained in the command packet depends the configured maximum payload size and the serialized size of the data point structures:

```C
enum {
  Null = 0,     // 0-bytes
  SByte = 1,    // 1-byte
  Int16 = 2,    // 2-bytes
  Int32 = 3,    // 4-bytes
  Int64 = 4,    // 8-bytes
  Byte = 5,     // 1-byte
  UInt16 = 6,   // 2-bytes
  UInt32 = 7,   // 4-bytes
  UInt64 = 8,   // 8-bytes
  Decimal = 9,  // 16-bytes
  Double = 10,  // 8-bytes
  Single = 11,  // 4-bytes
  Ticks = 12,   // 8-bytes
  Bool = 13,    // 1-byte
  Guid = 14,    // 16-bytes
  String = 15,  // 64-bytes, max
  Buffer = 16   // 64-bytes, max
}
ValueType; // sizeof(uint8), 1-byte

enum {
  None = 0,           // No state is defined
  Timestamp = 1 << 0, // State includes Timestamp
  Quality = 1 << 1,   // State includes QualityFlags
  Sequence = 1 << 2,  // State includes sequence number as uint16
}
StateFlags;

struct {
  uint32 id;
  ValueType type;   // 1-byte
  StateFlags flags; // 1-byte
  uint8[] value;    // Size based on type
  uint8[] state;    // Size based on flags
}
DataPoint;

struct {
  uint8 length;
  Encodings encoding; // 1-byte
  uint8[] data;       // Maximum size of 62
}
StringValue;

struct {
  uint8 length;
  uint8[] data; // Maximum size of 63
}
BufferValue;

struct {
  uint64 value;
  uint8 flags;
}
Timestamp;

enum {
  Normal = 0,                 // Defines normal state
  BadTime = 1 << 0,           // Defines bad time state
  BadValue = 1 << 1,          // Defines bad value state
  UnreasonableValue = 1 << 2, // Defines unreasonable value state
  CalculatedValue = 1 << 3,   // Defines calculated value state
  ReservedFlag1 = 1 << 4,     // Defines reserved flag 1
  ReservedFlag2 = 1 << 5,     // Defines reserved flag 1
  UserDefinedFlag1 = 1 << 6,  // Defines user defined flag 1
  UserDefinedFlag2 = 1 << 7   // Defines user defined flag 1
}
QualityFlags; // sizeof(uint8), 1-byte
```

### Data Point Value Types

* `Null`: No space occupied
* `SByte`: [8-bit Signed Byte](https://en.wikipedia.org/wiki/Byte) (1-byte, big-endian)
* `Int16`: [16-bit Signed Integer](https://en.wikipedia.org/wiki/Integer_%28computer_science%29#Value_and_representation) (2-bytes, big-endian)
* `Int32`: [32-bit Signed Integer](https://en.wikipedia.org/wiki/Integer_%28computer_science%29#Value_and_representation) (4-bytes, big-endian)
* `Int64`: [64-bit Signed Integer](https://en.wikipedia.org/wiki/Integer_%28computer_science%29#Value_and_representation) (8-bytes, big-endian)
* `Byte`: [8-bit Unsigned Byte](https://en.wikipedia.org/wiki/Byte) (1-byte, big-endian)
* `UInt16`: [16-bit Unsigned Integer](https://en.wikipedia.org/wiki/Integer_%28computer_science%29#Value_and_representation) (2-bytes, big-endian)
* `UInt32`: [32-bit Unsigned Integer](https://en.wikipedia.org/wiki/Integer_%28computer_science%29#Value_and_representation) (4-bytes, big-endian)
* `UInt64`: [64-bit Unsigned Integer](https://en.wikipedia.org/wiki/Integer_%28computer_science%29#Value_and_representation) (8-bytes, big-endian)
* `Decimal`: [128-bit Decimal Floating Point](https://en.wikipedia.org/wiki/Decimal128_floating-point_format) (16-bytes, per [IEEE 754-2008](https://en.wikipedia.org/wiki/IEEE_754))
* `Double`: [64-bit Double Precision Floating Point](https://en.wikipedia.org/wiki/Double-precision_floating-point_format) (8-bytes, per [IEEE 754-2008](https://en.wikipedia.org/wiki/IEEE_754))
* `Single`: [32-bit Single Precision Floating Point](https://en.wikipedia.org/wiki/Single-precision_floating-point_format) (4-bytes, per [IEEE 754-2008](https://en.wikipedia.org/wiki/IEEE_754))
* `Ticks`: [Time as 64-bit Signed Integer](https://en.wikipedia.org/wiki/System_time) (8-bytes, big-endian, 100-nanosecond ticks since 1 January 0001)
* `Bool`: [Boolean as 8-bit Unsigned Integer](https://en.wikipedia.org/wiki/Boolean_data_type) (1-byte, big-endian, zero is `false`, non-zero value is `true`)
* `Guid`: [Globally Unique Identifer](https://en.wikipedia.org/wiki/Universally_unique_identifier) (16-bytes, big-endian for all components)
* `String` [Character String as `StringValue`](https://en.wikipedia.org/wiki/String_%28computer_science%29) (Maximum of 64-bytes - 2-byte header with 62-bytes of character data, supported encoding for ASCII, ANSI, UTF8 and Unicode)
* `Buffer` [Untyped Data Buffer as `BufferValue`](https://en.wikipedia.org/wiki/Data_buffer) (Maximum of 64-bytes - 1-byte header with 63-bytes of data)

Both the `String` and `Buffer` represent variable length data types. Each variable length data point will have a fixed maximum number of bytes that can be transmitted per instance of the structure. For data sets larger then the specified maximum size, data will need to be fragmented, marked with a collation index and transmitted in small chunks. For this large data set collation scenario, the data packets should only be transmitted over a reliable transport protocol, e.g., TCP.
