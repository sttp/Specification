## Data Point Structure

When a subscriber has issued a [subscribe command](Commands.md#subscribe-command) to its publisher for select set of data points, the publisher will start sending [data point packet commands](Commands.md#data-point-packet-commands) each with a payload of several data point values serialized using the `DataPoint` structure, defined as follows. The actual number of `DataPoint` structures contained in the data point packet command depends the configured maximum payload size and the serialized size of the data point structures:

```C
struct {
  uint32 id;
  uint8[] value;    // Size based on type
  uint8[] state;    // Size based on flags
}
DataPoint;
```

### Data Point Value Types

The types in the [`ValueType`](Commands.md#runtime-id-mapping-command) enumeration are described below, along with any needed associated structures:

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
* `String` [Character String as `StringValue`](https://en.wikipedia.org/wiki/String_%28computer_science%29) (Maximum of 16-bytes - 1-byte header with 15-bytes of character data, supported encoding for ASCII, ANSI, UTF8 and Unicode)
* `Buffer` [Untyped Data Buffer as `BufferValue`](https://en.wikipedia.org/wiki/Data_buffer) (Maximum of 16-bytes - 1-byte header with 15-bytes of data)

Both the `String` and `Buffer` represent variable length data types. Each variable length data point will have a fixed maximum number of bytes that can be transmitted per instance of the `DataPoint` structure. For data sets larger then the specified maximum size, data will need to be fragmented, marked with a [sequence number](#data-point-sequence-number) and transmitted in small chunks, i.e., 63-byte segments. For this large data set collation scenario, it is expected that the data packets will be transmitted over a reliable transport protocol, e.g., TCP, otherwise the subscriber should expect the possibility of missing fragments. Details for the content of the `String` type which is the `StringValue` structure and the `Buffer` type which is the `BufferValue` structure are defined as follows:

```C
enum {
  ASCII = 0,
  ANSI = 0x40,
  UTF8 = 0x80,
  Unicode  = 0xC0,
  EncodingMask = 0xC0,
  LengthMask = 0x3F
}
StringValueState; // sizeof(uint8), 1-byte

struct {
  StringValueState state;
  uint8[] data; // Maximum size of 15
}
StringValue;

struct {
  uint8 length;
  uint8[] data; // Maximum size of 15
}
BufferValue;
```

> :information_source: String value encoding is defined at a data point level when using the `String` data type, this differs from the session negotiated string encoding established by the publisher and subscriber. The negotiated string encoding is always used for strings being exchanged by the publisher and subscriber at a command level, however, the subscriber will be subject to the encoding specified for a `StringValue` - this prevents the publisher from having to handle string encoding translations of available data. Additionally, the data publisher should have a general philosophy of not changing any data being provided to the subscriber.

### Data Point Timestamp Types

The timestamp formats supported by STTP are defined to accommodate foreseeable use cases and defined requirements. The types in the `TimestampType` enumeration are described below along with the associated timestamp structures.

1. The `NoTime` type specifies that no timestamp is included in the data point
2. The `Ticks` type specifies that the timestamp will be a `TicksTimestamp` structure, defined below, which represents the 100-nanosecond intervals since 1/1/0001 with a range of 32,768 years. This timestamp has a resolution that is ideal for timestamps measured using GPS.
3. The `Unix64` type specifies a 64-bit Unix, a.k.a., POSIX, industry standard timestamp that will be a `Unix64Timestamp` structure, defined below, which represents one second intervals since 1/1/1970 with a range of 584 billion years. This timestamp has whole second resolution, i.e., no sub-second time.
4. The `NTP128` type specifies a 128-bit NTP industry standard timestamp that will be a `NTP128Timestamp` structure, defined below, which represents seconds since 1/1/1900 with a range of 584 billion years and fractional seconds with a resolution down to 0.05 attoseconds. This timestamp has a resolution that can accommodate most any conceivable time value.

Timestamps also include a `TimestampFlags` structure, defined below, that describes timestamp level notifications of leap seconds and  as well as timestamp quality defined with the `TimeQuality` enumeration value. This detail is included for devices that have access to a GPS or UTC time synchronization source, e.g., from an IRIG timecode signal. For timestamps that are acquired without an accurate time source, e.g., using the local system clock for new timestamps, the `TimeQuality` value should be set to `Locked` and the `TimestampFlags.NoAccurateTimeSource` should be set.

```C
enum {
  Locked = 0x0,                       // Clock locked, Normal operation
  Failure =  0xF,                     // Clock fault, time not reliable
  Unlocked10Seconds = 0xB,            // Clock unlocked, time within 10^1s
  Unlocked1Second = 0xA,              // Clock unlocked, time within 10^0s
  UnlockedPoint1Seconds = 0x9,        // Clock unlocked, time within 10^-1s
  UnlockedPoint01Seconds = 0x8,       // Clock unlocked, time within 10^-2s
  UnlockedPoint001Seconds = 0x7,      // Clock unlocked, time within 10^-3s
  UnlockedPoint0001Seconds = 0x6,     // Clock unlocked, time within 10^-4s
  UnlockedPoint00001Seconds = 0x5,    // Clock unlocked, time within 10^-5s
  UnlockedPoint000001Seconds = 0x4,   // Clock unlocked, time within 10^-6s
  UnlockedPoint0000001Seconds = 0x3,  // Clock unlocked, time within 10^-7s
  UnlockedPoint00000001Seconds = 0x2, // Clock unlocked, time within 10^-8s
  UnlockedPoint000000001Seconds = 0x1 // Clock unlocked, time within 10^-9s
}
TimeQuality; // 4-bits, 1-nibble

enum {
  None = 0,
  TimeQualityMask = 0xF,        // Mask for TimeQuality
  LeapsecondPending = 1 << 4,   // Set before a leap second occurs and then cleared after
  LeapsecondOccurred = 1 << 5,  // Set in the first second after the leap second occurs and remains set for 24 hours
  LeapsecondDirection = 1 << 6, // Clear for add, set for delete
  NoAccurateTimeSource = 1 << 7 // Accurate time source is unavailable
}
TimestampFlags; // sizeof(uint8), 1-byte

struct {
  int64 value; // 100-nanosecond intervals since 1/1/0001, +/-16,384 years
  TimestampFlags flags;
}
TicksTimestamp; // 9-bytes

struct {
  int64 value; // Seconds since 1/1/1970, +/-292 billion years
  TimestampFlags flags;
}
Unix64Timestamp; // 9-bytes

struct {
  int64 seconds;    // Seconds since 1/1/1900, +/-292 billion years
  uint64 fraction;  // 0.05 attosecond resolution (i.e., 0.5e-18 second)
  TimestampFlags flags;
}
NTP128Timestamp; // 17-bytes
```

### Data Point Quality Flags

A set of simple quality flags are defined for STTP data point values in the `QualityFlags` enumeration, defined as follows. These quality flags are only included in the `DataPoint.state` data when the `DataPoint.flags` includes the `StateFlags.Quality` flag. The `QualityFlags` must be serialized into the `DataPoint.state` data in big-endian order following any defined timestamp. If no timestamp is defined for the `DataPoint.state` data, i.e., the `DataPoint.flags` defines a `TimestampType` of `NoTime`, then the `QualityFlags` must be the first value serialized into the `DataPoint.state` data.

> :information_source: These quality flags are intentionally simple to accommodate a very wide set of use cases and still provide some indication of data point value quality. More complex data qualities can exist as new data point values are added to a more complex data type, e.g., a `BufferValue`.

```C
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

### Data Point Sequence Number

For data that needs to be transmitted with a defined sequence number, the `DataPoint.flags` must include the `StateFlags.Sequence` flag. The sequence number, which is defined as a `uint16`, must be serialized into the `DataPoint.state` data in big-endian order following any defined `QualityFlags` or timestamp. If no timestamp is defined for the `DataPoint.state` data, i.e., the `DataPoint.flags` defines a `TimestampType` of `NoTime` and no `QualityFlags` is defined for the `DtaaPoint.state` data, i.e., the `DataPoint.flags` does not include the `StateFlags.Quality` flag, then the sequence number must be the first value serialized into the `DataPoint.state` data.
