## Data Point Structure

When a subscriber has issued a [subscribe command](Commands.md#subscribe-command) to its publisher for select set of data points, the publisher will start sending [data point packet commands](Commands.md#data-point-packet-commands) each with a payload of several data point values serialized using the `DataPoint` structure, defined as follows:

```C
struct {
  DataPointIdentifier id;
  SttpTimestamp timestamp;
  SttpValue value; 
  TimeQualityFlags timeQuality;
  ValueQualityFlags valueQuality;
  SttpValue[] ExtraFields;        //A set of extra fields that are reserved for future need.
}
DataPoint;
```

The actual number of `DataPoint` structures contained in the data point packet command depends the configured maximum payload size and the serialized size of the data point structures, see [Figure 6](#user-content-figure6).

<a name="figure6"></a> <center>

![Data Packet Command Details](Images/data-packet-command-details.png)

<sup>Figure 6</sup>
</center>

> :information_source: The maximum size of a `DataPoint` structure instance is 94-bytes, however, with simple encoding techniques this size can be reduced down to a few bytes for most value types.

### Data Point Identifier

When identifying a Data Point, one of 4 mechanics can be used to identify the source of the time series data.

* [Guid] An integer identifier - This does not have to be a true GUID, but can be any integer that can fit in a 128 bit integer.
* [String] A string identifier - This is commonly referred to as a tag in a time series databases.
* [SttpNamedSet] A Connection String - A set of [string Name, SttpValue value] that uniquely identify the source of a point ID.
* [Int32] Runtime ID - Runtime ID's are negotiated with the connection and are the default value type in the Data Point Structure.

```C
enum {
  RuntimeID = 0,   // 4-bytes
  Guid = 1,        // 16-bytes
  String = 2,      // variable
  NamedSet = 3,    // variable
}
DataPointIdentifierTypeCode; // 2 bits

struct {
  DataPointIdentifierTypeCode identifierType;
  uint8[] identifer;    
}
DataPointIdentifier;
```

While the normal use case is to use RuntimeIDs, for systems that have an indefinite number of IDs, it's not practical to map every 
point to a Runtime ID. In this case, it's allowed to send the identifier with the measurement.

### Sttp Value Types

The data types available to a `DataPoint` are described in the `ValueType` enumeration, defined below:

```C
enum {
  Null = 0,              // 0-bytes
  SByte = 1,             // 1-byte
  Int16 = 2,             // 2-bytes
  Int32 = 3,             // 4-bytes
  Int64 = 4,             // 8-bytes
  Byte = 5,              // 1-byte
  UInt16 = 6,            // 2-bytes
  UInt32 = 7,            // 4-bytes
  UInt64 = 8,            // 8-bytes
  Single = 9,            // 4-bytes
  Double = 10,           // 8-bytes
  Decimal = 11,          // 16-bytes
  DateTime = 12,         // Local/Universal/Unspecified/Unambiguous Date Time
  DateTimeOffset = 13,   // Local/Universal/Unspecified/Unambiguous Date Time with an offset.
  SttpTime = 14,         // Local/Universal Time with Leap Seconds
  SttpTimeOffset = 15,   // Local/Universal Time with Leap Seconds and timezone offset.
  TimeSpan = 16,         // 8 bytes  
  Bool = 17,             // 1-byte
  Char = 18,             // 2-bytes
  Guid = 19,             // 16-bytes
  String = 20,           // Limit defined in NegotiateSession
  Buffer = 21,           // Limit defined in NegotiateSession
  ValueSet = 22,         // An array of SttpValue. Up to 255 elements.
  NamedSet = 23,         // An array of [string,SttpValue]. Up to 255 elements. Like a connection string.
  BulkTransportGuid = 24 // A special type of GUID that indicates it is transmitted out of band.
}
ValueTypeCode; // sizeof(uint8), 1-byte
```

- `Null`: No space occupied
- `SByte`: [8-bit Signed Byte](https://en.wikipedia.org/wiki/Byte) (1-byte, big-endian)
- `Int16`: [16-bit Signed Integer](https://en.wikipedia.org/wiki/Integer_%28computer_science%29#Value_and_representation) (2-bytes, big-endian)
- `Int32`: [32-bit Signed Integer](https://en.wikipedia.org/wiki/Integer_%28computer_science%29#Value_and_representation) (4-bytes, big-endian)
- `Int64`: [64-bit Signed Integer](https://en.wikipedia.org/wiki/Integer_%28computer_science%29#Value_and_representation) (8-bytes, big-endian)
- `Byte`: [8-bit Unsigned Byte](https://en.wikipedia.org/wiki/Byte) (1-byte, big-endian)
- `UInt16`: [16-bit Unsigned Integer](https://en.wikipedia.org/wiki/Integer_%28computer_science%29#Value_and_representation) (2-bytes, big-endian)
- `UInt32`: [32-bit Unsigned Integer](https://en.wikipedia.org/wiki/Integer_%28computer_science%29#Value_and_representation) (4-bytes, big-endian)
- `UInt64`: [64-bit Unsigned Integer](https://en.wikipedia.org/wiki/Integer_%28computer_science%29#Value_and_representation) (8-bytes, big-endian)
- `Decimal`: [128-bit Decimal Floating Point](https://en.wikipedia.org/wiki/Decimal128_floating-point_format) (16-bytes, per [IEEE 754-2008](https://en.wikipedia.org/wiki/IEEE_754))
- `Double`: [64-bit Double Precision Floating Point](https://en.wikipedia.org/wiki/Double-precision_floating-point_format) (8-bytes, per [IEEE 754-2008](https://en.wikipedia.org/wiki/IEEE_754))
- `Single`: [32-bit Single Precision Floating Point](https://en.wikipedia.org/wiki/Single-precision_floating-point_format) (4-bytes, per [IEEE 754-2008](https://en.wikipedia.org/wiki/IEEE_754))
- `Bool`: [Boolean as 8-bit Unsigned Integer](https://en.wikipedia.org/wiki/Boolean_data_type) (1-byte, big-endian, zero is `false`, non-zero value is `true`)
- `Guid`: [Globally Unique Identifer](https://en.wikipedia.org/wiki/Universally_unique_identifier) (16-bytes, big-endian for all components)
- `Time`: [Time as `Timestamp`](https://en.wikipedia.org/wiki/System_time) (16-bytes, see [data point timestamp](#data-point-timestamp))
- `String` [Character String as `StringValue`](https://en.wikipedia.org/wiki/String_%28computer_science%29) (encoding is UTF8)
- `Buffer` [Untyped Data Buffer as `BufferValue`](https://en.wikipedia.org/wiki/Data_buffer) 


### Data Point Timestamp

The default timestamp that is used for Sttp has a bit reserved for LeapSecondInProgress. It takes the same structure as DateTime except, DateTimeKind.Ambiguious and DateTimeKind.Unspecified have been sacrificed for a leap second pending bit. 

### Data Point Time Quality Flags

Data points can also include a `TimeQualityFlags` structure in the serialized state data, defined below, that describes both the timestamp quality, defined with the `TimeQuality` enumeration value, as well as an indication of if a timestamp was not measured with an accurate time source.

The time quality detail is included for devices that have access to a GPS or UTC time synchronization source, e.g., from an IRIG timecode signal. For timestamps that are acquired without an accurate time source, e.g., using the local system clock, the `TimeQuality` value should be set to `Locked` and the `TimeQualityFlags.NoAccurateTimeSource` should be set.

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
  NoAccurateTimeSource = 1 << 7 // Accurate time source is unavailable
}
TimeQualityFlags; // sizeof(uint8), 1-byte
```

> :construction: The remaining available bits in the `TimeQualityFlags` enumeration could be made to directly map to IEEE C37.118 leap-second flags. Existing IEEE text could then be used to describe the function of these bits if deemed useful:

```C
LeapsecondPending = 1 << 4,   // Set before a leap second occurs and then cleared after
LeapsecondOccurred = 1 << 5,  // Set in the first second after the leap second occurs and remains set for 24 hours
LeapsecondDirection = 1 << 6, // Clear for add, set for delete
```

### Data Point Data Quality Flags

A set of data quality flags are defined for STTP data point values in the `DataQualityFlags` enumeration, defined as follows:

```C
enum {
  Normal = 0,                 // Defines normal state
  BadTime = 1 << 0,           // Defines bad time state when set
  BadValue = 1 << 1,          // Defines bad value state when set
  UnreasonableValue = 1 << 2, // Defines unreasonable value state when set
  CalculatedValue = 1 << 3,   // Defines calculated value state when set
  MissingValue = 1 << 4,      // Defines missing value when set
  ReservedFlag = 1 << 5,      // Reserved flag
  UserDefinedFlag1 = 1 << 6,  // User defined flag 1
  UserDefinedFlag2 = 1 << 7   // User defined flag 2
 }
DataQualityFlags; // sizeof(uint8), 1-byte
```

> :information_source: These quality flags are intentionally simple to accommodate a very wide set of use cases and still provide some indication of data point value quality. More complex data qualities can exist as new data points.


